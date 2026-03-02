export interface CobreAuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface CobreCounterpartyResponse {
  id: string;
  type?: string;
  attributes?: any;
  [key: string]: any;
}
