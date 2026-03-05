import type { Blog } from "./Blog.ts";

export interface BlogQuery {
  q?: string;
}

export interface IBlogRepository {
  list(query?: BlogQuery): Promise<Blog[]>;
  findBySlug(slug: string): Promise<Blog | null>;
  create(blog: Blog): Promise<void>;
  deleteBySlug(slug: string): Promise<boolean>;
}
