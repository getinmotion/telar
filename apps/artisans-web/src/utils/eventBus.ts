export type SystemEvent =
  | "store.synced"
  | "brand.reviewed"
  | "brand.updated"
  | "brand.logo.uploaded"
  | "brand.colors.updated"
  | "brand.wizard.completed"
  | "inventory.synced"
  | "inventory.updated"
  | "product.wizard.completed"
  | "shop.wizard.completed"
  | "pricing.updated"
  | "shop.published"
  | "shop.created"
  | "shop.social_links.added"
  | "shop.contact.added"
  | "legal.nit.pending"
  | "legal.nit.completed"
  | "growth.plan.ready"
  | "perfil.synced"
  | "marca.synced"
  | "tienda.synced"
  | "inventario.synced"
  | "presence.synced"
  | "i18n.synced"
  | "master.context.updated"
  | "master.full.sync"
  | "task.updated"
  | "deliverable.created"
  | "profile.updated"
  | "business.updated"
  | "business.profile.updated"
  | "maturity.assessment.completed"
  | "gamification.xp_gained"
  | "maturity.score_updated"
  | "debug.data.cleared"
  | "task.completed.check.generation"
  | "milestone.completed"
  | "milestone.unlocked"
  | "milestone.almost.complete"
  | "milestone.tasks.generated"
  | "product.created"
  | "maturity.block.completed"
  | "shop.customized"
  | "shop.story.created"
  | "artisan.profile.completed"
  | "onboarding.completed"
  | "tasks.initialized"
  | "bank.data.completed";

type EventCallback = (data: any) => void;

class EventBusImpl {
  private listeners: Map<SystemEvent, Set<EventCallback>> = new Map();
  private debounceTimers: Map<SystemEvent, NodeJS.Timeout> = new Map();

  subscribe(event: SystemEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  publish(event: SystemEvent, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * OPTIMIZATION: Debounced publish to prevent event cascades
   * Aggregates multiple rapid events into a single callback
   * @param event - Event type
   * @param data - Event data
   * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
   */
  publishDebounced(event: SystemEvent, data: any, debounceMs: number = 300): void {
    const existing = this.debounceTimers.get(event);
    if (existing) clearTimeout(existing);
    
    this.debounceTimers.set(event, setTimeout(() => {
      this.publish(event, data);
      this.debounceTimers.delete(event);
    }, debounceMs));
  }

  clear(event?: SystemEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const EventBus = new EventBusImpl();
