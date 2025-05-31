// import { CanchasGrid } from "@/components/canchas/canchas-grid"
// import { supabaseAdmin } from "@/lib/supabase/admin"

// export default async function CanchasPage() {

//   const { data: canchas } = await supabaseAdmin.from("canchas").select("*").eq("activa", true).order("numero")

//   // Si no hay canchas, insertamos datos de ejemplo
//   if (!canchas || canchas.length === 0) {
//     const canchasEjemplo = [
//       {
//         nombre: "Cancha Principal",
//         numero: 1,
//         tipo: "outdoor",
//         precio_hora: 2000,
//         precio_hora_pico: 2500,
//         descripcion: "Cancha profesional con piso de césped sintético",
//         activa: true,
//       },
//       {
//         nombre: "Cancha Cubierta",
//         numero: 2,
//         tipo: "indoor",
//         precio_hora: 2500,
//         precio_hora_pico: 3000,
//         descripcion: "Cancha cubierta con iluminación LED",
//         activa: true,
//       },
//       {
//         nombre: "Cancha Panorámica",
//         numero: 3,
//         tipo: "outdoor",
//         precio_hora: 2000,
//         precio_hora_pico: 2500,
//         descripcion: "Cancha con vista panorámica y excelente ventilación",
//         activa: true,
//       },
//       {
//         nombre: "Cancha Premium",
//         numero: 4,
//         tipo: "indoor",
//         precio_hora: 3000,
//         precio_hora_pico: 3500,
//         descripcion: "Cancha premium con piso de última generación",
//         activa: true,
//       },
//     ]

//     // Intentar insertar datos de ejemplo
//     const { data: insertedCanchas } = await supabaseAdmin.from("canchas").insert(canchasEjemplo).select()

//     if (insertedCanchas) {
//       // No se necesita hacer nada aquí, ya que el componente CanchasGrid manejará los datos insertados
//     }
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="space-y-6">
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold">Nuestras Canchas</h1>
//           <p className="text-muted-foreground">Canchas profesionales de pádel con la mejor calidad</p>
//         </div>

//         <CanchasGrid canchas={canchas || []} />
//       </div>
//     </div>
//   )
// }
