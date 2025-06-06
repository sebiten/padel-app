"use client"
import { useState } from "react"
import Link from "next/link"
import { Home, Calendar, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnvVarWarning } from "./env-var-warning"
import { AuthButton } from "./auth-button"


export default function Navbar({ hasEnvVars }: { hasEnvVars: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center px-4">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          🎾 PadelReservas
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="hover:text-primary flex flex-col items-center justify-center"
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>

          <div className="flex flex-col items-center gap-2">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>

          <Button>
            <Link
              href="/reservas"
              className="hover:text-primary flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reservar
            </Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-background border-t z-50 p-4 flex flex-col gap-4 text-sm">
          <Link
            href="/"
            className="hover:text-primary flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>

          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}

          <Button className="w-full" onClick={() => setIsOpen(false)}>
            <Link
              href="/reservas"
              className="hover:text-primary flex items-center justify-center w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reservar
            </Link>
          </Button>
        </div>
      )}
    </nav>
  )
}
