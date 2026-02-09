//internal/bootstrap/registry.go

package bootstrap

import "github.com/labstack/echo/v4"

// Module define la interfaz que deben implementar los módulos de dominio (ej: payment-checkout)
type Module interface {
	Provide(c *Container) error
	RegisterHTTP(e *echo.Echo)
}

// ApplyModules inicializa los módulos y registra sus rutas
func ApplyModules(c *Container, r *echo.Echo, modules ...Module) error {
	// 1. Inyección de dependencias (Provide)
	for _, m := range modules {
		if err := m.Provide(c); err != nil {
			return err
		}
	}

	// 2. Registro de Rutas HTTP
	// Nota: Cada módulo es responsable de crear sus grupos (ej: v1 := e.Group("/api/v1"))
	// o registrar rutas raíz si son webhooks.
	for _, m := range modules {
		m.RegisterHTTP(r)
	}

	return nil
}
