"use client"
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, CreditCard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  precio_total: number;
  estado: string;
  canchas: {
    nombre: string;
    numero: number;
    tipo: "indoor" | "outdoor"; // 👈 ahora es un string literal
  }; // 👈 ahora es un array
}

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservas() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("reservas")
        .select(
          `
          id,
          fecha,
          hora_inicio,
          hora_fin,
          precio_total,
          estado,
          canchas(nombre, numero)
        `
        )
        .eq("usuario_id", user.id)
        .order("fecha", { ascending: false })
        .limit(5);
      if (error) {
        console.error("Error fetching reservas:", error);
        setReservas(data!);
      }

      setLoading(false);
    }

    fetchReservas();
  }, [user.id]);

  const getEstadoBadge = (estado: string) => {
    const variants = {
      pendiente: "secondary",
      confirmada: "default",
      cancelada: "destructive",
      completada: "outline",
    } as const;

    return (
      <Badge variant={variants[estado as keyof typeof variants] || "secondary"}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido de vuelta, {user.email}
            </p>
          </div>
          <Button asChild>
            <Link href="/reservas">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reserva
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas Activas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reservas.filter((r) => r.estado === "confirmada").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reservas
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {reservas
                  .reduce((sum, r) => sum + r.precio_total, 0)
                  .toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
            <CardDescription>Tus últimas reservas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : reservas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No tienes reservas
                </h3>
                <p className="text-muted-foreground">
                  ¡Haz tu primera reserva para empezar a jugar!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/reservas">Hacer Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                            {reserva.canchas.nombre} #{reserva.canchas.numero}
                        </span>
                        <Badge variant={reserva.canchas.tipo === "indoor" ? "default" : "secondary"} className="text-xs">
                            {reserva.canchas.tipo === "indoor" ? "Indoor" : "Outdoor"}
                        </Badge>
                        {getEstadoBadge(reserva.estado)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(reserva.fecha).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {reserva.hora_inicio} - {reserva.hora_fin}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${reserva.precio_total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/mis-reservas">Ver Todas las Reservas</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
