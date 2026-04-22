import { createServer } from "./presentation/http/server.ts";
import { CreateBlog } from "./application/blog/usecases/CreateBlog.ts";
import { DeleteBlog } from "./application/blog/usecases/DeleteBlog.ts";
import { GetBlogBySlug } from "./application/blog/usecases/GetBlogBySlug.ts";
import { ListBlogs } from "./application/blog/usecases/ListBlogs.ts";
import { RegisterUser } from "./application/user/usecases/RegisterUser.ts";
import { LoginUser } from "./application/user/usecases/LoginUser.ts";
import { KvBlogRepository } from "./infrastructure/blog/KvBlogRepository.ts";
import { Pbkdf2PasswordHasher } from "./infrastructure/security/Pbkdf2PasswordHasher.ts";
import { JwtService } from "./infrastructure/security/JwtService.ts";
import { KvUserRepository } from "./infrastructure/user/KvUserRepository.ts";

const PORT = Number(Deno.env.get("PORT") ?? "4200");

// Open default KV database :contentReference[oaicite:6]{index=6}
const kv = await Deno.openKv();

const repo = new KvBlogRepository(kv);
const userRepository = new KvUserRepository(kv);
const passwordHasher = new Pbkdf2PasswordHasher();
const jwtService = new JwtService();

const listBlogs = new ListBlogs(repo);
const getBlogBySlug = new GetBlogBySlug(repo);
const createBlog = new CreateBlog(repo);
const deleteBlog = new DeleteBlog(repo);
const registerUser = new RegisterUser(userRepository, passwordHasher);
const loginUser = new LoginUser(userRepository, passwordHasher, jwtService);

const app = createServer({
  listBlogs,
  getBlogBySlug,
  createBlog,
  deleteBlog,
  registerUser,
  loginUser,
  jwtService,
});

// Start the server
await app.listen({ port: PORT });
