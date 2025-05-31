"use client"

import React from "react"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Cancha {
  id: string
  nombre: string
  numero: number
  tipo: string
  precio_hora: number
  precio_hora_pico: number
  descripcion: string
}

interface Horario {
  id: string
  hora_inicio: string
  hora_fin: string
  es_hora_pico: boolean
}

interface ReservasContentProps {
  user: User
  canchas: Cancha[]
  horarios: Horario[]
}

const formatDateForDisplay = (date: Date) => {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

const formatDateForDatabase = (date: Date) => {
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

export function ReservasContent({ user, canchas, horarios }: ReservasContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null)
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null)
  const [nombresJugadores, setNombresJugadores] = useState<string[]>(["", "", "", ""])
  const [notas, setNotas] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [horariosDisponibles, setHorariosDisponibles] = useState<Horario[]>(horarios)

  const router = useRouter()
  const supabase = createClient()

  // Verificar disponibilidad cuando cambia la fecha o cancha
  const verificarDisponibilidad = async (fecha: Date, canchaId: string) => {
    try {
      const { data: reservasExistentes } = await supabase
        .from("reservas")
        .select("hora_inicio")
        .eq("cancha_id", canchaId)
        .eq("fecha", formatDateForDatabase(fecha))
        .in("estado", ["pendiente", "confirmada"])

      const horariosOcupados = reservasExistentes?.map((r) => r.hora_inicio) || []

      const horariosLibres = horarios.filter((horario) => !horariosOcupados.includes(horario.hora_inicio))

      setHorariosDisponibles(horariosLibres)

      // Si el horario seleccionado ya no está disponible, deseleccionarlo
      if (selectedHorario && horariosOcupados.includes(selectedHorario.hora_inicio)) {
        setSelectedHorario(null)
      }
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error)
      setHorariosDisponibles(horarios)
    }
  }

  // Efecto para verificar disponibilidad
  React.useEffect(() => {
    if (selectedDate && selectedCancha) {
      verificarDisponibilidad(selectedDate, selectedCancha.id)
    }
  }, [selectedDate, selectedCancha])

  const handleReserva = async () => {
    if (!selectedDate || !selectedCancha || !selectedHorario) {
      toast("Por favor completa todos los campos antes de continuar")
      return
    }

    setIsLoading(true)

    try {
      // 1. Validar que el horario sigue disponible
      const { data: reservaExistente } = await supabase
        .from("reservas")
        .select("id")
        .eq("cancha_id", selectedCancha.id)
        .eq("fecha", formatDateForDatabase(selectedDate))
        .eq("hora_inicio", selectedHorario.hora_inicio)
        .in("estado", ["pendiente", "confirmada"])
        .maybeSingle()

      if (reservaExistente) {
        toast("Horario no disponible, por favor selecciona otro")
        await verificarDisponibilidad(selectedDate, selectedCancha.id)
        return
      }

      // 2. Calcular precio total
      const precioTotal = getPrecio(selectedCancha, selectedHorario)

      // 3. Crear la reserva
      const { data: nuevaReserva, error: errorReserva } = await supabase
        .from("reservas")
        .insert({
          usuario_id: user.id,
          cancha_id: selectedCancha.id,
          fecha: formatDateForDatabase(selectedDate),
          hora_inicio: selectedHorario.hora_inicio,
          hora_fin: selectedHorario.hora_fin,
          precio_total: precioTotal,
          estado: "pendiente",
          nombres_jugadores: nombresJugadores.filter((nombre) => nombre.trim() !== ""),
          notas: notas.trim() || null,
        })
        .select()
        .single()

      if (errorReserva) {
        throw errorReserva
      }

      // 4. Crear registro de pago pendiente
      const { error: errorPago } = await supabase.from("pagos").insert({
        reserva_id: nuevaReserva.id,
        usuario_id: user.id,
        monto: precioTotal,
        estado: "pendiente",
      })

      if (errorPago) {
        // Si falla el pago, eliminar la reserva
        await supabase.from("reservas").delete().eq("id", nuevaReserva.id)
        throw errorPago
      }

      toast("¡Reserva creada!")

      // 5. Redirigir al pago (por ahora a una página de confirmación)
      setTimeout(() => {
        router.push(`/reserva/${nuevaReserva.id}/pago`)
      }, 1500)
    } catch (error) {
      console.error("Error al crear reserva:", error)
      toast("Error al crear la reserva")
    } finally {
      setIsLoading(false)
    }
  }

  const getPrecio = (cancha: Cancha, horario: Horario) => {
    return horario.es_hora_pico && cancha.precio_hora_pico ? cancha.precio_hora_pico : cancha.precio_hora
  }

  const updateJugador = (index: number, nombre: string) => {
    const nuevosNombres = [...nombresJugadores]
    nuevosNombres[index] = nombre
    setNombresJugadores(nuevosNombres)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Hacer Reserva</h1>
          <p className="text-muted-foreground">Selecciona fecha, cancha y horario para tu reserva</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Paso 1: Seleccionar Fecha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                1. Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                className="rounded-md border"
              />
              {selectedDate && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Fecha seleccionada: {formatDateForDisplay(selectedDate)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Paso 2: Seleccionar Cancha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                2. Seleccionar Cancha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canchas.map((cancha) => (
                  <div
                    key={cancha.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCancha?.id === cancha.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCancha(cancha)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{cancha.nombre}</h4>
                        <p className="text-sm text-muted-foreground">Cancha #{cancha.numero}</p>
                        <Badge variant="outline" className="mt-1">
                          {cancha.tipo === "indoor" ? "Cubierta" : "Descubierta"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${cancha.precio_hora}</p>
                        {cancha.precio_hora_pico && (
                          <p className="text-xs text-muted-foreground">Pico: ${cancha.precio_hora_pico}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paso 3: Seleccionar Horario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                3. Seleccionar Horario
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate || !selectedCancha ? (
                <p className="text-muted-foreground text-center py-8">Selecciona fecha y cancha primero</p>
              ) : (
                <div className="space-y-2">
                  {horariosDisponibles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No hay horarios disponibles para esta fecha
                    </p>
                  ) : (
                    horariosDisponibles.map((horario) => (
                      <div
                        key={horario.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedHorario?.id === horario.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedHorario(horario)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {horario.hora_inicio} - {horario.hora_fin}
                            </p>
                            {horario.es_hora_pico && (
                              <Badge variant="secondary" className="text-xs">
                                Horario Pico
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">${getPrecio(selectedCancha, horario)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información de Jugadores */}
        {selectedDate && selectedCancha && selectedHorario && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información de Jugadores (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {nombresJugadores.map((nombre, index) => (
                  <div key={index}>
                    <Label htmlFor={`jugador-${index}`}>Jugador {index + 1}</Label>
                    <Input
                      id={`jugador-${index}`}
                      placeholder={`Nombre del jugador ${index + 1}`}
                      value={nombre}
                      onChange={(e) => updateJugador(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label htmlFor="notas">Notas adicionales</Label>
                <Textarea
                  id="notas"
                  placeholder="Comentarios o solicitudes especiales..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen y Confirmación */}
        {selectedDate && selectedCancha && selectedHorario && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDateForDisplay(selectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cancha</p>
                    <p className="font-medium">
                      {selectedCancha.nombre} #{selectedCancha.numero}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horario</p>
                    <p className="font-medium">
                      {selectedHorario.hora_inicio} - {selectedHorario.hora_fin}
                    </p>
                  </div>
                </div>

                {nombresJugadores.some((nombre) => nombre.trim() !== "") && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Jugadores</p>
                    <div className="flex flex-wrap gap-2">
                      {nombresJugadores
                        .filter((nombre) => nombre.trim() !== "")
                        .map((nombre, index) => (
                          <Badge key={index} variant="outline">
                            {nombre}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium">Total a pagar:</p>
                    <p className="text-2xl font-bold text-primary">${getPrecio(selectedCancha, selectedHorario)}</p>
                  </div>
                </div>

                <Button onClick={handleReserva} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando reserva...
                    </>
                  ) : (
                    "Confirmar Reserva y Pagar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
