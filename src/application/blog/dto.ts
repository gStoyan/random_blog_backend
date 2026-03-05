export interface BlogDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogInput {
  title: string;
  content: string;
  tags?: string[];
}
