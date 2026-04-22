import { create, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import type { IJwtService, JwtPayload } from "../../domain/user/IJwtService.ts";

export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: number; // in seconds
  private cryptoKey: CryptoKey | null = null;

  constructor(secret?: string, expiresInHours: number = 24) {
    this.secret =
      secret ||
      Deno.env.get("JWT_SECRET") ||
      "your-secret-key-change-in-production";
    this.expiresIn = expiresInHours * 3600; // convert hours to seconds
  }

  private async getCryptoKey(): Promise<CryptoKey> {
    if (!this.cryptoKey) {
      this.cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(this.secret),
        { name: "HMAC", hash: "SHA-512" },
        true,
        ["sign", "verify"],
      );
    }
    return this.cryptoKey;
  }

  async generateToken(payload: JwtPayload): Promise<string> {
    const key = await this.getCryptoKey();
    const now = Math.floor(Date.now() / 1000);

    const token = await create(
      { alg: "HS512", typ: "JWT" },
      {
        ...payload,
        iat: now,
        exp: now + this.expiresIn,
      },
      key,
    );

    return token;
  }

  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const key = await this.getCryptoKey();
      const payload = await verify(token, key);

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        name: payload.name as string,
      };
    } catch {
      return null;
    }
  }
}
