// /app/api/create-payment/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Extraemos los datos de la reserva desde el front
  const body = await req.json();
  const { reservaId } = body;

  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.data.user.id;
  const email = user.data.user.email;

  // Obtener la reserva con información de la cancha
  const { data: reserva, error: reservaError } = await supabase
    .from("reservas")
    .select(`
      *,
      canchas (
        nombre,
        numero,
        tipo
      )
    `)
    .eq("id", reservaId)
    .eq("usuario_id", userId)
    .single();

  if (reservaError || !reserva) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  // Verificar que la reserva esté en estado pendiente
  if (reserva.estado !== "pendiente") {
    return NextResponse.json({ error: "La reserva ya fue procesada" }, { status: 400 });
  }

  // Crear preferencia de Mercado Pago
  const mpRes = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        items: [
          {
            id: `reserva-${reserva.id}`,
            title: `Reserva Cancha ${reserva.canchas.nombre} #${reserva.canchas.numero}`,
            description: `Reserva para el ${reserva.fecha} de ${reserva.hora_inicio} a ${reserva.hora_fin}`,
            category_id: "services",
            quantity: 1,
            unit_price: reserva.precio_total,
          },
        ],
        payer: {
          email: email,
        },
        external_reference: `reserva_${reserva.id}`,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/${reserva.id}/confirmacion`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/${reserva.id}/pago?error=payment_failed`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/reserva/${reserva.id}/pago?status=pending`,
        },
        auto_return: "approved",
        metadata: {
          reserva_id: reserva.id,
          usuario_id: userId,
          cancha_id: reserva.cancha_id,
          fecha: reserva.fecha,
          hora_inicio: reserva.hora_inicio,
        },
        customization: {
          visual: {
            showExternalReference: true,
          },
        },
      }),
    }
  );

  const mpJson = await mpRes.json();

  if (!mpJson.init_point) {
    return NextResponse.json(
      { error: "No se pudo generar link de pago" },
      { status: 500 }
    );
  }

  // Actualizar el registro de pago con el preference_id
  await supabase
    .from("pagos")
    .update({
      mp_preference_id: mpJson.id,
    })
    .eq("reserva_id", reservaId);

  return NextResponse.json({ 
    init_point: mpJson.init_point,
    preference_id: mpJson.id 
  });
}