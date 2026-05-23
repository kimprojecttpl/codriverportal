export type ProjectStatus = "active" | "paused" | "done";

export type Project = {
  id: string;
  name_th: string;
  name_en: string;
  url: string;
  category_id: string;
  tags: string[];
  status: ProjectStatus;
  description_th: string;
  description_en: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
};

export type Category = {
  id: string;
  name_th: string;
  name_en: string;
  icon: string;
  order: number;
};

export type Tag = {
  id: string;
  name: string;
};
