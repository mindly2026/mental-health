export interface OAuthUserInfo {
  providerUserId: string
  email: string
  name: string
  avatarUrl: string | null
}

export interface OAuthTokenExchangeResult {
  idToken?: string | undefined
  accessToken: string
  refreshToken?: string | undefined
}

export interface OAuthStatePayload {
  provider: string
  codeVerifier?: string | undefined
  nonce: string
  redirectUri: string
  iat?: number | undefined
  exp?: number | undefined
}

export interface AppleClientSecretConfig {
  teamId: string
  clientId: string
  keyId: string
  privateKey: string
}
