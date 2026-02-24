/**
 * Agentes Invisibles - Sistema Centralizado
 * 
 * Todos los agentes se exportan desde aquí para facilitar
 * su uso por el Coordinador Maestro.
 */

import { InvisibleAgent } from '@/types/invisibleAgent';
import { growthAgent } from './GrowthAgent';
import { pricingAgent } from './PricingAgent';
import { brandAgent } from './BrandAgent';
import { digitalPresenceAgent } from './DigitalPresenceAgent';
import { inventoryAgent } from './InventoryAgent';
import { legalAgent } from './LegalAgent';

export const invisibleAgents: Record<string, InvisibleAgent> = {
  growth: growthAgent,
  pricing: pricingAgent,
  brand: brandAgent,
  'digital-presence': digitalPresenceAgent,
  inventory: inventoryAgent,
  legal: legalAgent
};

export function getAgent(agentId: string): InvisibleAgent | undefined {
  return invisibleAgents[agentId];
}

export function getAllAgents(): InvisibleAgent[] {
  return Object.values(invisibleAgents);
}

export {
  growthAgent,
  pricingAgent,
  brandAgent,
  digitalPresenceAgent,
  inventoryAgent,
  legalAgent
};
