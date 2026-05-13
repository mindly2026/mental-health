export interface JwtPayload {
  sub: string // user ID
  email: string
  role: 'customer' | 'clinic'
  iat?: number | undefined
  exp?: number | undefined
}

export interface AuthConfig {
  jwtSecret: string
  jwtExpiresIn?: string | undefined
}
