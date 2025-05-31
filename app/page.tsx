import { EnvVarWarning } from "@/components/env-var-warning"
import { AuthButton } from "@/components/auth-button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { hasEnvVars } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4 py-20">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Reserva tu cancha de <span className="text-primary">pádel</span> fácilmente
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema profesional de reservas online. Encuentra horarios disponibles, reserva al instante y paga de forma
            segura con Mercado Pago.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/reservas">
                <Calendar className="mr-2 h-5 w-5" />
                Hacer Reserva
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/canchas">
                <MapPin className="mr-2 h-5 w-5" />
                Ver Canchas
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir PadelReservas?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Reserva 24/7</h3>
              <p className="text-muted-foreground">
                Reserva tu cancha en cualquier momento del día, desde cualquier dispositivo.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Gestión Simple</h3>
              <p className="text-muted-foreground">
                Administra tus reservas, invita jugadores y mantén todo organizado en un solo lugar.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Pago Seguro</h3>
              <p className="text-muted-foreground">
                Paga de forma segura con Mercado Pago. Confirmación instantánea de tu reserva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">¿Listo para jugar?</h2>
          <p className="text-xl opacity-90">Únete a cientos de jugadores que ya reservan con nosotros</p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/auth/signup">Crear Cuenta Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">PadelReservas</h3>
              <p className="text-sm text-muted-foreground">La plataforma más fácil para reservar canchas de pádel.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Enlaces</h4>
              <div className="space-y-2 text-sm">
                <Link href="/reservas" className="block hover:text-primary">
                  Reservas
                </Link>
                <Link href="/canchas" className="block hover:text-primary">
                  Canchas
                </Link>
                <Link href="/precios" className="block hover:text-primary">
                  Precios
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Soporte</h4>
              <div className="space-y-2 text-sm">
                <Link href="/ayuda" className="block hover:text-primary">
                  Centro de Ayuda
                </Link>
                <Link href="/contacto" className="block hover:text-primary">
                  Contacto
                </Link>
                <Link href="/faq" className="block hover:text-primary">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy-policy" className="block hover:text-primary">
                  Privacidad
                </Link>
                <Link href="/terms-of-service" className="block hover:text-primary">
                  Términos
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PadelReservas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
