import { Blog } from "../../../domain/blog/Blog.ts";
import type { IBlogRepository } from "../../../domain/blog/IBlogRepository.ts";
import { Err, Ok, type Result } from "../../common/Result.ts";
import type { BlogDTO, CreateBlogInput } from "../dto.ts";
import { toBlogDTO } from "../mappers.ts";

export class CreateBlog {
  constructor(private readonly repo: IBlogRepository) {}

  async execute(input: CreateBlogInput): Promise<Result<BlogDTO>> {
    try {
      const id = crypto.randomUUID();
      const blog = Blog.create({
        id,
        title: input.title,
        content: input.content,
        tags: input.tags ?? [],
        imageUrl: input.imageUrl,
      });

      const existing = await this.repo.findBySlug(blog.slug);
      if (existing)
        return Err("A blog with this slug already exists (try another title).");

      await this.repo.create(blog);
      return Ok(toBlogDTO(blog));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return Err(msg);
    }
  }
}
