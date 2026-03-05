import type { IBlogRepository } from "../../../domain/blog/IBlogRepository.ts";
import { Err, Ok, type Result } from "../../common/Result.ts";
import type { BlogDTO } from "../dto.ts";
import { toBlogDTO } from "../mappers.ts";

export class GetBlogBySlug {
  constructor(private readonly repo: IBlogRepository) {}

  async execute(slug: string): Promise<Result<BlogDTO>> {
    const blog = await this.repo.findBySlug(slug);
    if (!blog) return Err("Blog not found.");
    return Ok(toBlogDTO(blog));
  }
}
