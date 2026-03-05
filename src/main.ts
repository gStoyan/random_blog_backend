import { createServer } from "./presentation/http/server.ts";
import { CreateBlog } from "./application/blog/usecases/CreateBlog.ts";
import { DeleteBlog } from "./application/blog/usecases/DeleteBlog.ts";
import { GetBlogBySlug } from "./application/blog/usecases/GetBlogBySlug.ts";
import { ListBlogs } from "./application/blog/usecases/ListBlogs.ts";
import { KvBlogRepository } from "./infrastructure/blog/KvBlogRepository.ts";

const PORT = Number(Deno.env.get("PORT") ?? "4200");

// Open default KV database :contentReference[oaicite:6]{index=6}
const kv = await Deno.openKv();

const repo = new KvBlogRepository(kv);

const listBlogs = new ListBlogs(repo);
const getBlogBySlug = new GetBlogBySlug(repo);
const createBlog = new CreateBlog(repo);
const deleteBlog = new DeleteBlog(repo);

const app = createServer({ listBlogs, getBlogBySlug, createBlog, deleteBlog });

console.log(`✅ RandomBlog API running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
