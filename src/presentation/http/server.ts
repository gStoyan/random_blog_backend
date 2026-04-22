import { Application } from "jsr:@oak/oak/";
import { Router } from "jsr:@oak/oak/";
import type { CreateBlog } from "../../application/blog/usecases/CreateBlog.ts";
import type { DeleteBlog } from "../../application/blog/usecases/DeleteBlog.ts";
import type { GetBlogBySlug } from "../../application/blog/usecases/GetBlogBySlug.ts";
import type { ListBlogs } from "../../application/blog/usecases/ListBlogs.ts";
import type { RegisterUser } from "../../application/user/usecases/RegisterUser.ts";
import type { LoginUser } from "../../application/user/usecases/LoginUser.ts";
import type { IJwtService } from "../../domain/user/IJwtService.ts";
import { cors } from "./middlewares/cors.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { authRoutes } from "./routes/authRoutes.ts";
import { blogRoutes } from "./routes/blogRoutes.ts";

export function createServer(deps: {
  listBlogs: ListBlogs;
  getBlogBySlug: GetBlogBySlug;
  createBlog: CreateBlog;
  deleteBlog: DeleteBlog;
  registerUser: RegisterUser;
  loginUser: LoginUser;
  jwtService: IJwtService;
}) {
  const app = new Application();

  app.use(errorHandler());
  app.use(cors());

  const root = new Router();
  root.get("/health", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = { ok: true };
  });

  const blogs = blogRoutes(deps);
  const auth = authRoutes(deps);

  app.use(root.routes());
  app.use(root.allowedMethods());

  app.use(blogs.routes());
  app.use(blogs.allowedMethods());

  app.use(auth.routes());
  app.use(auth.allowedMethods());

  return app;
}
