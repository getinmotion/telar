// internal/bootstrap/httpapp.go

package bootstrap

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewHTTPApp() *echo.Echo {
	e := echo.New()

	// Middleware Standard
	e.Use(middleware.Logger())  // Log de requests HTTP
	e.Use(middleware.Recover()) // Recuperación de pánicos para que no muera el server
	e.Use(middleware.CORS())    // CORS (Configúralo más estricto para producción)
	e.Use(middleware.RequestID())

	// Middleware de Seguridad Custom
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Set security headers
			c.Response().Header().Set("X-Content-Type-Options", "nosniff")
			c.Response().Header().Set("X-Frame-Options", "DENY")
			c.Response().Header().Set("X-XSS-Protection", "1; mode=block")
			return next(c)
		}
	})

	// Health check endpoint
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})

	return e
}
