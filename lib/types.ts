export type ProjectStatus = "active" | "paused" | "done";

export type Project = {
  id: string;
  owner_id: string;
  name_th: string;
  name_en: string;
  url: string;
  category_id: string | null;
  status: ProjectStatus;
  description_th: string;
  description_en: string;
  icon: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
};

export type ProjectWithTags = Project & { tags: string[] };

export type Category = {
  id: string;
  owner_id: string;
  name_th: string;
  name_en: string;
  icon: string;
  order_index: number;
  created_at: string;
};

export type Tag = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
};

export type ProjectInput = {
  name_th: string;
  name_en: string;
  url: string;
  category_id: string | null;
  status: ProjectStatus;
  description_th: string;
  description_en: string;
  icon: string | null;
  tags: string[];
};

export type CategoryInput = {
  name_th: string;
  name_en: string;
  icon: string;
};
