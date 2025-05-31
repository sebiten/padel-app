"use client";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  precio_total: number;
  estado: string;
  nombres_jugadores: string[];
  notas: string;
  canchas: {
    nombre: string;
    numero: number;
    tipo: string;
  };
  pagos: {
    id: string;
    estado: string;
    mp_preference_id: string;
  }[];
}

interface PagoContentProps {
  reserva: Reserva;
  user: User;
}

export function PagoContent({ reserva, user }: PagoContentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
    console.log("Reserva obtenida:", reserva);
    
  const handlePago = async () => {
    setIsProcessing(true);

    try {
      // Aquí integrarías con Mercado Pago
      // Por ahora simulamos el pago
      console.log("Procesando pago para reserva:", reserva.id);

      // Simular delay de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirigir a confirmación
      window.location.href = `/reserva/${reserva.id}/confirmacion`;
    } catch (error) {
      console.error("Error al procesar pago:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pago = reserva.pagos[0];

  if (pago?.estado === "aprobado") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">¡Pago Completado!</h1>
            <p className="text-muted-foreground">
              Tu reserva ha sido confirmada exitosamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Confirmar Pago</h1>
          <p className="text-muted-foreground">
            Revisa los detalles de tu reserva y procede al pago
          </p>
        </div>

        {/* Detalles de la Reserva */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(reserva.fecha), "PPP", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">
                    {reserva.hora_inicio} - {reserva.hora_fin}
                  </p>
                </div>
              </div>

              <Badge className="font-medium ">
                {reserva.canchas?.nombre}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reserva.canchas?.tipo === "indoor" ? "Indoor" : "Outdoor"}
              </Badge>

              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant="secondary">{reserva.estado}</Badge>
              </div>
            </div>

            {reserva.nombres_jugadores &&
              reserva.nombres_jugadores.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Jugadores
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reserva.nombres_jugadores.map((nombre, index) => (
                      <Badge key={index} variant="outline">
                        {nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {reserva.notas && (
              <div>
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="text-sm">{reserva.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Pago */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Reserva de cancha</span>
                <span>${reserva.precio_total}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${reserva.precio_total}</span>
              </div>
            </div>

            <Button
              onClick={handlePago}
              className="w-full mt-6"
              size="lg"
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Procesando..." : "Pagar con Mercado Pago"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Al hacer clic en "Pagar" serás redirigido a Mercado Pago para
              completar el pago de forma segura.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
