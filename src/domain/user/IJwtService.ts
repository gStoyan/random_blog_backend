export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export interface IJwtService {
  /**
   * Generate a JWT token for a user
   */
  generateToken(payload: JwtPayload): Promise<string>;

  /**
   * Verify and decode a JWT token
   * Returns null if token is invalid or expired
   */
  verifyToken(token: string): Promise<JwtPayload | null>;
}
