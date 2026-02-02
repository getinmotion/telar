import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, LayoutDashboard, Hammer } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(40,15%,93%)] to-[hsl(43,85%,95%)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Artisan Illustration - Broken pottery */}
        <div className="mx-auto w-64 h-64 relative flex items-center justify-center">
          <div className="relative">
            {/* Broken pottery SVG */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main pottery piece */}
              <path
                d="M100 40 L120 100 L110 160 L90 160 L80 100 Z"
                fill="hsl(15, 70%, 58%)"
                opacity="0.8"
              />
              {/* Crack lines */}
              <path
                d="M100 60 L105 90 L100 120"
                stroke="hsl(25, 40%, 50%)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M95 80 L100 100 L95 130"
                stroke="hsl(25, 40%, 50%)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Hammer icon */}
              <g transform="translate(130, 80)">
                <Hammer className="w-12 h-12 text-[hsl(25,40%,50%)]" />
              </g>
            </svg>
          </div>
        </div>

        {/* Title and Message */}
        <div className="space-y-3">
          <h1 className="text-7xl font-bold text-[hsl(25,40%,50%)] tracking-tight">
            404
          </h1>
          <p className="text-3xl text-[hsl(25,40%,40%)] font-semibold">
            Parece que este camino no existe
          </p>
          <p className="text-lg text-[hsl(25,40%,45%)] max-w-md mx-auto leading-relaxed">
            Esta pieza aún no está lista. Volvamos al taller donde la magia sucede.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2 border-2 border-[hsl(145,65%,42%)] text-[hsl(145,65%,42%)] hover:bg-[hsl(145,50%,96%)] transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir Atrás
          </Button>

          <Button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-[hsl(145,65%,42%)] hover:bg-[hsl(145,65%,38%)] text-white transition-all hover:scale-105 shadow-lg"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ir al Taller Digital
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2 text-[hsl(25,40%,50%)] hover:bg-[hsl(40,15%,90%)] transition-all"
          >
            <Home className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>

        {/* Technical info (dev mode only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-[hsl(15,70%,95%)] rounded-lg border-2 border-[hsl(15,70%,85%)]">
            <p className="text-xs text-[hsl(15,70%,45%)] font-mono">
              Ruta intentada: {location.pathname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
