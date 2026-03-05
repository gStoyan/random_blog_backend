import type { Blog } from "../../domain/blog/Blog.ts";
import type { BlogDTO } from "./dto.ts";

export function toBlogDTO(blog: Blog): BlogDTO {
  const b = blog.toJSON();
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    content: b.content,
    tags: b.tags,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}
