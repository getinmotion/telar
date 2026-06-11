# Agent Resource

Esta resource funciona como un **puente/proxy** para realizar peticiones al servicio de agentes (AGENT_URL).

## Características

- **No está vinculada a una tabla de base de datos**: Esta resource no tiene entity ni repository de TypeORM
- **Service genérico**: Proporciona métodos reutilizables (GET, POST, PUT, DELETE) para comunicarse con el servicio de agentes
- **Configurable**: Utiliza la variable de entorno `AGENT_URL` para determinar la URL base del servicio
- **Logging integrado**: Todas las peticiones se registran en los logs
- **Exportable**: El `AgentService` se exporta para que otros módulos puedan utilizarlo

## Estructura

```
agent/
├── agent.controller.ts   # Controlador con endpoints HTTP
├── agent.service.ts      # Servicio con métodos para peticiones HTTP
├── agent.module.ts       # Módulo de configuración
├── dto/                  # Carpeta para DTOs futuros
└── README.md            # Esta documentación
```

## Uso del Service

El `AgentService` puede ser inyectado en otros servicios:

```typescript
import { AgentService } from '../agent/agent.service';

export class MiServicio {
  constructor(private readonly agentService: AgentService) {}

  async ejemplo() {
    // GET request
    const data = await this.agentService.get('/endpoint');

    // POST request
    const result = await this.agentService.post('/endpoint', { data: 'value' });

    // PUT request
    await this.agentService.put('/endpoint', { data: 'value' });

    // DELETE request
    await this.agentService.delete('/endpoint');
  }
}
```

## Endpoints actuales

### Health Check
- **GET** `/agent/health`
- Verifica si el servicio está configurado correctamente
- Retorna el estado y la URL configurada

## Variables de entorno

- `AGENT_URL`: URL base del servicio de agentes (requerida)

## Próximos pasos

Se agregarán más endpoints según las necesidades del proyecto para comunicarse con el servicio de agentes.
