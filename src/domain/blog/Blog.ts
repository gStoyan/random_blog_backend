export type BlogId = string;

export interface BlogProps {
  id: BlogId;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entity: Blog
 * - Keeps invariants close to the data.
 * - No framework imports here.
 */
export class Blog {
  private constructor(private readonly props: BlogProps) {}

  static create(input: {
    id: BlogId;
    title: string;
    content: string;
    tags?: string[];
    imageUrl?: string;
    now?: Date;
  }): Blog {
    const now = input.now ?? new Date();
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    const content = input.content.trim();
    if (!content) throw new Error("Content is required.");

    const slug = Blog.slugify(title);

    return new Blog({
      id: input.id,
      title,
      slug,
      content,
      tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
      imageUrl: input.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(input: {
    title?: string;
    content?: string;
    tags?: string[];
    now?: Date;
  }): Blog {
    const now = input.now ?? new Date();
    const title = (input.title ?? this.props.title).trim();
    if (!title) throw new Error("Title is required.");
    const content = (input.content ?? this.props.content).trim();
    if (!content) throw new Error("Content is required.");

    return new Blog({
      ...this.props,
      title,
      slug: Blog.slugify(title),
      content,
      tags: (input.tags ?? this.props.tags)
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: now,
    });
  }

  toJSON(): BlogProps {
    return { ...this.props };
  }

  get id(): BlogId {
    return this.props.id;
  }
  get slug(): string {
    return this.props.slug;
  }

  private static slugify(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);
  }
}
