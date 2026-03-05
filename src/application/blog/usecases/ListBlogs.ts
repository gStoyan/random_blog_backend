import type { IBlogRepository } from "../../../domain/blog/IBlogRepository.ts";
import { Ok, type Result } from "../../common/Result.ts";
import type { BlogDTO } from "../dto.ts";
import { toBlogDTO } from "../mappers.ts";

export class ListBlogs {
  constructor(private readonly repo: IBlogRepository) {}

  async execute(query?: { q?: string }): Promise<Result<BlogDTO[]>> {
    const blogs = await this.repo.list({ q: query?.q });
    return Ok(blogs.map(toBlogDTO));
  }
}
