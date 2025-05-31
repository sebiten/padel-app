import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PagoContent } from "@/components/pago/pago-content";

interface PagoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PagoPage(props: PagoPageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Obtener la reserva con información de la cancha
  const { data: reserva, error } = await supabase
    .from("reservas")
    .select(
      `
  *,
  canchas (
    nombre,
    numero,
    tipo
  ),
  pagos (
    id,
    estado,
    mp_preference_id
  )
`
    )

    .eq("id", params.id)
    .eq("usuario_id", user.id)
    .single();
  console.log("Reserva obtenida:", reserva);
  if (error || !reserva) {
    return redirect("/dashboard");
  }

  return <PagoContent reserva={reserva} user={user} />;
}
