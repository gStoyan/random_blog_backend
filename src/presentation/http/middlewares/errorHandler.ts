import type { Context } from "jsr:@oak/oak/context";

export function errorHandler() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      await next();
    } catch (err) {
      console.error(err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error" };
    }
  };
}
