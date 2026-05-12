import { createRemoteJWKSet } from 'jose'
import type { JWTVerifyGetKey } from 'jose'

const jwksCache = new Map<string, JWTVerifyGetKey>()

export function getJWKS(url: string): JWTVerifyGetKey {
  let jwks = jwksCache.get(url)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksCache.set(url, jwks)
  }
  return jwks
}
