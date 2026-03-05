import type { Context } from "jsr:@oak/oak/context";

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4200",
  "https://marvelous-basbousa-bdcc98.netlify.app",
]);

export function cors() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const origin = ctx.request.headers.get("origin") ?? "";
    if (allowedOrigins.has(origin)) {
      ctx.response.headers.set("access-control-allow-origin", origin);
      ctx.response.headers.set("vary", "origin");
    }

    ctx.response.headers.set(
      "access-control-allow-methods",
      "GET,POST,DELETE,OPTIONS",
    );
    ctx.response.headers.set(
      "access-control-allow-headers",
      "content-type, authorization",
    );

    if (ctx.request.method === "OPTIONS") {
      ctx.response.status = 204;
      return;
    }
    await next();
  };
}
