import type { Blog } from "../../domain/blog/Blog.ts";
import type {
  BlogQuery,
  IBlogRepository,
} from "../../domain/blog/IBlogRepository.ts";

type StoredBlog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export class KvBlogRepository implements IBlogRepository {
  constructor(private readonly kv: Deno.Kv) {}

  async list(query?: BlogQuery): Promise<Blog[]> {
    const q = query?.q?.trim().toLowerCase();

    const blogs: Blog[] = [];
    // Lists all keys starting with ["blogs"] :contentReference[oaicite:3]{index=3}
    for await (const entry of this.kv.list<StoredBlog>({ prefix: ["blogs"] })) {
      const v = entry.value;
      if (!v) continue;

      if (q) {
        const hay =
          `${v.title}\n${v.content}\n${v.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      // Re-hydrate into domain entity by using Blog.create-like rules:
      // We'll reconstruct via Blog.create() to keep invariants.
      // (We keep id/title/content/tags and reuse stored timestamps as "now" isn't needed)
      const blog = (await import("../../domain/blog/Blog.ts")).Blog.create({
        id: v.id,
        title: v.title,
        content: v.content,
        tags: v.tags,
        now: new Date(v.createdAt),
      }).update({ now: new Date(v.updatedAt) });

      blogs.push(blog);
    }

    // Sort newest first
    blogs.sort(
      (a, b) => b.toJSON().createdAt.getTime() - a.toJSON().createdAt.getTime(),
    );

    return blogs;
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const res = await this.kv.get<StoredBlog>(["blogs", slug]); // :contentReference[oaicite:4]{index=4}
    const v = res.value;
    if (!v) return null;

    const { Blog } = await import("../../domain/blog/Blog.ts");
    const blog = Blog.create({
      id: v.id,
      title: v.title,
      content: v.content,
      tags: v.tags,
      now: new Date(v.createdAt),
    }).update({ now: new Date(v.updatedAt) });

    return blog;
  }

  async create(blog: Blog): Promise<void> {
    const b = blog.toJSON();
    const value: StoredBlog = {
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      tags: b.tags,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };

    await this.kv.set(["blogs", b.slug], value); // :contentReference[oaicite:5]{index=5}
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    const key: Deno.KvKey = ["blogs", slug];
    const existing = await this.kv.get<StoredBlog>(key);
    if (!existing.value) return false;

    await this.kv.delete(key);
    return true;
  }
}
