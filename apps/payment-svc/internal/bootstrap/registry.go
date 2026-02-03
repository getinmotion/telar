package bootstrap

import "github.com/labstack/echo/v4"

type Module interface {
	Provide(c *Container) error
	RegisterHTTP(e *echo.Echo)
}

func ApplyModules(c *Container, r *echo.Echo, modules ...Module) error {
	for _, m := range modules {
		if err := m.Provide(c); err != nil {
			return err
		}
	}

	r.Group("/api/v1")
	for _, m := range modules {
		m.RegisterHTTP(r)
	}
	return nil
}
