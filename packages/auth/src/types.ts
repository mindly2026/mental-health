export interface JwtPayload {
  sub: string // user ID
  email: string
  role: 'customer' | 'clinic' | 'doctor' | 'staff'
  iat?: number | undefined
  exp?: number | undefined
}

export interface AuthConfig {
  jwtSecret: string
  jwtExpiresIn?: string | undefined
}
