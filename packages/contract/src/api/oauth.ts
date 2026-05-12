export const OAUTH_PROVIDERS = ['google', 'apple', 'facebook'] as const
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]

export interface OAuthAuthorizeResponse {
  url: string
  state: string
}

export interface OAuthCallbackRequest {
  code: string
  state: string
  user?: { name?: { firstName?: string; lastName?: string }; email?: string } // Apple first-auth
}

export interface OAuthTokenRequest {
  token: string // ID token (Google/Apple) or access token (Facebook)
  name?: string // Apple first-auth name from mobile SDK
}

export interface OAuthLoginResponse {
  token: string
  user: { id: string; email: string; name: string; avatarUrl: string | null }
  isNewUser: boolean
}
