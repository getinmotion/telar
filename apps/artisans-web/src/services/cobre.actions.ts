import { telarApi } from '@/integrations/api/telarApi';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface CounterpartyMetadata {
  account_number?: string;
  beneficiary_institution?: string;
  counterparty_fullname?: string;
  counterparty_id_number?: string;
  counterparty_id_type?: string;
  registered_account?: string;
}

export interface CounterpartyResponse {
  id: string;
  geo?: string;
  type?: string;
  alias?: string;
  metadata?: CounterpartyMetadata;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface BankDataPayload {
  holder_name: string;
  document_type: string;
  document_number: string;
  bank_code: string;
  account_type: string;
  account_number: string;
}

// ─── Acciones ──────────────────────────────────────────────────────────────────

/**
 * Obtiene los datos de una contraparte de Cobre por su ID.
 * POST /cobre/counterparty
 */
export async function getCounterparty(
  counterpartyId: string,
): Promise<CounterpartyResponse> {
  const response = await telarApi.post<CounterpartyResponse>('/cobre/counterparty', {
    counterparty_id: counterpartyId,
  });
  return response.data;
}

/**
 * Crea una contraparte en Cobre para una tienda específica (acción de administrador).
 * POST /cobre/counterparty-admin
 */
export async function createCounterpartyAdmin(
  shopId: string,
  bankData: BankDataPayload,
): Promise<{ id_contraparty: string }> {
  const response = await telarApi.post<{ id_contraparty: string }>(
    '/cobre/counterparty-admin',
    { shopId, bankData },
  );
  return response.data;
}

/**
 * Crea o reemplaza la contraparte en Cobre para la tienda del artesano autenticado.
 * POST /cobre/counterparty-self
 */
export async function createCounterpartySelf(
  userId: string,
  bankData: BankDataPayload,
): Promise<{ id_contraparty: string }> {
  const response = await telarApi.post<{ id_contraparty: string }>(
    '/cobre/counterparty-self',
    { userId, bankData },
  );
  return response.data;
}
