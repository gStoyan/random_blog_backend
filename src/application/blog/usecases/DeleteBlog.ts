import type { IBlogRepository } from "../../../domain/blog/IBlogRepository.ts";
import { Err, Ok, type Result } from "../../common/Result.ts";

export class DeleteBlog {
  constructor(private readonly repo: IBlogRepository) {}

  async execute(slug: string): Promise<Result<void>> {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return Err("Slug is required.");

    const deleted = await this.repo.deleteBySlug(normalizedSlug);
    if (!deleted) return Err("Blog not found.");

    return Ok(undefined);
  }
}
