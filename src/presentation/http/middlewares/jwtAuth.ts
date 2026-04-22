import type { Context, Next } from "jsr:@oak/oak/";
import type {
  IJwtService,
  JwtPayload,
} from "../../../domain/user/IJwtService.ts";

export function jwtAuth(jwtService: IJwtService) {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Authorization token required." };
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const payload = await jwtService.verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Invalid or expired token." };
      return;
    }

    // Attach user information to context state
    ctx.state = { ...ctx.state, user: payload };

    await next();
  };
}
