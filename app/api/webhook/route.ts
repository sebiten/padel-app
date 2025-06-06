import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // (opcional) Validar con clave secreta si la configuraste en MercadoPago
  // const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // const signature = req.headers.get("x-signature");
  // if (secret && signature !== secret) {
  //   console.error("❌ Webhook rechazado: clave inválida");
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const body = await req.json();
  const type = body.type;
  const id = body.data?.id;

  if (type !== "payment" || !id) {
    return NextResponse.json({ message: "Ignored" }, { status: 200 });
  }

  // Consultar a MP por detalles del pago
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
  });

  const payment = await mpRes.json();

  if (payment.status === "approved") {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cvs")
      .select("profile_id")
      .eq("id", payment.metadata.cv_id)
      .maybeSingle();

    if (!data) {
      console.error("❌ CV no encontrado. Posible webhook demasiado temprano.");
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Insertar pago si no existía aún
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("payments").insert({
        user_id: data.profile_id, // 👈 ESTO AGREGA EL user_id
        cv_id: payment.metadata.cv_id,
        payment_id: payment.id,
        amount: payment.transaction_amount,
        status: payment.status,
        payer_email: payment.payer.email,
        payment_type: payment.payment_type_id,
      });

      await supabase
        .from("cvs")
        .update({ status: "paid" })
        .eq("id", payment.metadata.cv_id);
    }
  }

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
