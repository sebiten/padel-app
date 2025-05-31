"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign } from "lucide-react"


interface Cancha {
  id: string
  nombre: string
  numero: number
  tipo: string
  precio_hora: number
  precio_hora_pico: number
  descripcion: string
}

interface CanchasGridProps {
  canchas: Cancha[]
}

export function CanchasGrid({ canchas }: CanchasGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {canchas.map((cancha) => (
        <Card key={cancha.id} className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-green-600">{cancha.numero}</span>
                </div>
                <Badge variant={cancha.tipo === "indoor" ? "default" : "secondary"}>
                  {cancha.tipo === "indoor" ? "Cubierta" : "Descubierta"}
                </Badge>
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {cancha.nombre}
            </CardTitle>
            <CardDescription>{cancha.descripcion || `Cancha profesional de pádel #${cancha.numero}`}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Precio normal</span>
                </div>
                <span className="font-medium">${cancha.precio_hora}</span>
              </div>

              {cancha.precio_hora_pico && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Horario pico</span>
                  </div>
                  <span className="font-medium">${cancha.precio_hora_pico}</span>
                </div>
              )}
            </div>

            {/* <Button asChild className="w-full">
              <Link href={`/reservas?cancha=${cancha.id}`}>Reservar Cancha</Link>
            </Button> */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
