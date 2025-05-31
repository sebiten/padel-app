import { ReservasContent } from "@/components/reservas/reservas-content";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReservasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Obtener canchas disponibles
  const { data: canchas } = await supabaseAdmin
    .from("canchas")
    .select("*")
    .eq("activa", true)
    .order("numero");

  // Obtener horarios disponibles
  const { data: horarios } = await supabaseAdmin
    .from("horarios")
    .select("*")
    .eq("activo", true)
    .order("hora_inicio");

  return (
    <ReservasContent
      user={user}
      canchas={canchas || []}
      horarios={horarios || []}
    />
  );
}
