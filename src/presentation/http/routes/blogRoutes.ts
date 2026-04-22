import { Router } from "jsr:@oak/oak/";
import type { CreateBlog } from "../../../application/blog/usecases/CreateBlog.ts";
import type { DeleteBlog } from "../../../application/blog/usecases/DeleteBlog.ts";
import type { GetBlogBySlug } from "../../../application/blog/usecases/GetBlogBySlug.ts";
import type { ListBlogs } from "../../../application/blog/usecases/ListBlogs.ts";
import type { IJwtService } from "../../../domain/user/IJwtService.ts";
import { jwtAuth } from "../middlewares/jwtAuth.ts";

export function blogRoutes(deps: {
  listBlogs: ListBlogs;
  getBlogBySlug: GetBlogBySlug;
  createBlog: CreateBlog;
  deleteBlog: DeleteBlog;
  jwtService: IJwtService;
}) {
  const router = new Router();

  router
    .get("/api/blogs", async (ctx) => {
      const q = ctx.request.url.searchParams.get("q") ?? undefined;
      const result = await deps.listBlogs.execute({ q });
      ctx.response.status = 200;
      ctx.response.body = result.ok ? result.value : { error: result.error };
    })
    .get("/api/blogs/:slug", async (ctx) => {
      const slug = ctx.params.slug!;
      const result = await deps.getBlogBySlug.execute(slug);
      ctx.response.status = result.ok ? 200 : 404;
      ctx.response.body = result.ok ? result.value : { error: result.error };
    })
    .post("/api/blogs", jwtAuth(deps.jwtService), async (ctx) => {
      const body = ctx.request.hasBody ? await ctx.request.body.json() : null;
      const result = await deps.createBlog.execute({
        title: body?.title ?? "",
        content: body?.content ?? "",
        tags: Array.isArray(body?.tags) ? body.tags : [],
      });

      ctx.response.status = result.ok ? 201 : 400;
      ctx.response.body = result.ok ? result.value : { error: result.error };
    })
    .delete("/api/blogs/:slug", jwtAuth(deps.jwtService), async (ctx) => {
      const slug = ctx.params.slug!;
      const result = await deps.deleteBlog.execute(slug);

      if (result.ok) {
        ctx.response.status = 204;
        return;
      }

      ctx.response.status = 404;
      ctx.response.body = { error: result.error };
    });

  return router;
}
