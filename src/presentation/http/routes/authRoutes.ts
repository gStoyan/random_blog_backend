import { Router } from "jsr:@oak/oak/";
import type { RegisterUser } from "../../../application/user/usecases/RegisterUser.ts";

export function authRoutes(deps: { registerUser: RegisterUser }) {
  const router = new Router();

  router.post("/auth/register", async (ctx) => {
    const body = ctx.request.hasBody ? await ctx.request.body.json() : null;

    const result = await deps.registerUser.execute({
      name: body?.name ?? "",
      email: body?.email ?? "",
      dateOfBirth: body?.dateOfBirth ?? "",
      password: body?.password ?? "",
    });

    if (result.ok) {
      ctx.response.status = 201;
      ctx.response.body = result.value;
      return;
    }

    ctx.response.status = result.error.includes("already exists") ? 409 : 400;
    ctx.response.body = { message: result.error };
  });

  return router;
}
