/**
 * Local-storage backed data store — used when Supabase env vars are not configured.
 * Mirrors the Supabase data shape so components don't care which backend is active.
 * Data is stored under a single JSON blob in localStorage for atomic writes.
 */

import type {
  Category,
  CategoryInput,
  Project,
  ProjectInput,
  ProjectWithTags,
  Tag,
} from "./types";

const STORAGE_KEY = "codriver-portal-v1";
export const LOCAL_USER_ID = "local-user";

type LocalData = {
  projects: Project[];
  categories: Category[];
  tags: Tag[];
  projectTags: { project_id: string; tag_id: string }[];
};

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for old browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function defaultData(): LocalData {
  const now = new Date().toISOString();
  return {
    projects: [],
    categories: [
      {
        id: uuid(),
        owner_id: LOCAL_USER_ID,
        name_th: "งาน",
        name_en: "Work",
        icon: "Briefcase",
        order_index: 1,
        parent_id: null,
        created_at: now,
      },
      {
        id: uuid(),
        owner_id: LOCAL_USER_ID,
        name_th: "ส่วนตัว",
        name_en: "Personal",
        icon: "Heart",
        order_index: 2,
        parent_id: null,
        created_at: now,
      },
      {
        id: uuid(),
        owner_id: LOCAL_USER_ID,
        name_th: "เรียนรู้",
        name_en: "Learning",
        icon: "BookOpen",
        order_index: 3,
        parent_id: null,
        created_at: now,
      },
      {
        id: uuid(),
        owner_id: LOCAL_USER_ID,
        name_th: "ทดลอง",
        name_en: "Experiment",
        icon: "FlaskConical",
        order_index: 4,
        parent_id: null,
        created_at: now,
      },
    ],
    tags: [],
    projectTags: [],
  };
}

function read(): LocalData {
  if (typeof window === "undefined") return defaultData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = defaultData();
    write(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as LocalData;
    return {
      projects: parsed.projects ?? [],
      categories: parsed.categories ?? [],
      tags: parsed.tags ?? [],
      projectTags: parsed.projectTags ?? [],
    };
  } catch {
    const initial = defaultData();
    write(initial);
    return initial;
  }
}

function write(data: LocalData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("codriver-storage-change"));
}

export function clearLocalData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("codriver-storage-change"));
}

// ── Projects ──────────────────────────────────────────

export function localFetchProjects(): ProjectWithTags[] {
  const data = read();
  const tagsByProject = new Map<string, string[]>();
  for (const pt of data.projectTags) {
    const tag = data.tags.find((t) => t.id === pt.tag_id);
    if (!tag) continue;
    const list = tagsByProject.get(pt.project_id) ?? [];
    list.push(tag.name);
    tagsByProject.set(pt.project_id, list);
  }
  return [...data.projects]
    .map((p) => ({ ...p, tags: tagsByProject.get(p.id) ?? [] }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aTime = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
      const bTime = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
}

export function localCreateProject(input: ProjectInput): Project {
  const data = read();
  const now = new Date().toISOString();
  const project: Project = {
    id: uuid(),
    owner_id: LOCAL_USER_ID,
    name_th: input.name_th,
    name_en: input.name_en,
    url: input.url,
    category_id: input.category_id,
    status: input.status,
    description_th: input.description_th,
    description_en: input.description_en,
    icon: input.icon,
    pinned: false,
    created_at: now,
    updated_at: now,
    last_accessed_at: null,
  };
  data.projects.push(project);
  syncTagsForProject(data, project.id, input.tags);
  write(data);
  return project;
}

export function localUpdateProject(id: string, input: ProjectInput): Project {
  const data = read();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Project not found");
  const updated: Project = {
    ...data.projects[idx],
    name_th: input.name_th,
    name_en: input.name_en,
    url: input.url,
    category_id: input.category_id,
    status: input.status,
    description_th: input.description_th,
    description_en: input.description_en,
    icon: input.icon,
    updated_at: new Date().toISOString(),
  };
  data.projects[idx] = updated;
  syncTagsForProject(data, id, input.tags);
  write(data);
  return updated;
}

export function localDeleteProject(id: string): void {
  const data = read();
  data.projects = data.projects.filter((p) => p.id !== id);
  data.projectTags = data.projectTags.filter((pt) => pt.project_id !== id);
  write(data);
}

export function localTouchLastAccessed(id: string): void {
  const data = read();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  data.projects[idx] = {
    ...data.projects[idx],
    last_accessed_at: new Date().toISOString(),
  };
  write(data);
}

export function localTogglePinned(id: string, pinned: boolean): void {
  const data = read();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  data.projects[idx] = { ...data.projects[idx], pinned };
  write(data);
}

function syncTagsForProject(data: LocalData, projectId: string, tagNames: string[]): void {
  const normalized = Array.from(
    new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))
  );
  // Remove existing links
  data.projectTags = data.projectTags.filter((pt) => pt.project_id !== projectId);
  if (normalized.length === 0) return;

  for (const name of normalized) {
    let tag = data.tags.find((t) => t.name === name);
    if (!tag) {
      tag = {
        id: uuid(),
        owner_id: LOCAL_USER_ID,
        name,
        created_at: new Date().toISOString(),
      };
      data.tags.push(tag);
    }
    data.projectTags.push({ project_id: projectId, tag_id: tag.id });
  }
}

// ── Categories ──────────────────────────────────────────

export function localFetchCategories(): Category[] {
  return [...read().categories].sort(
    (a, b) =>
      a.order_index - b.order_index || a.name_th.localeCompare(b.name_th, "th")
  );
}

export function localCreateCategory(input: CategoryInput): Category {
  const data = read();
  const nextOrder =
    Math.max(0, ...data.categories.map((c) => c.order_index)) + 1;
  const category: Category = {
    id: uuid(),
    owner_id: LOCAL_USER_ID,
    name_th: input.name_th,
    name_en: input.name_en,
    icon: input.icon,
    order_index: nextOrder,
    parent_id: input.parent_id,
    created_at: new Date().toISOString(),
  };
  validateCategoryHierarchy(data, category);
  data.categories.push(category);
  write(data);
  return category;
}

export function localUpdateCategory(id: string, input: CategoryInput): Category {
  const data = read();
  const idx = data.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category not found");
  const updated: Category = {
    ...data.categories[idx],
    name_th: input.name_th,
    name_en: input.name_en,
    icon: input.icon,
    parent_id: input.parent_id,
  };
  validateCategoryHierarchy(data, updated);
  data.categories[idx] = updated;
  write(data);
  return updated;
}

export function localDeleteCategory(id: string): void {
  const data = read();
  // Children: detach (parent_id = null) — matches Supabase ON DELETE SET NULL
  data.categories = data.categories.map((c) =>
    c.parent_id === id ? { ...c, parent_id: null } : c
  );
  // Projects in this category: set category_id = null
  data.projects = data.projects.map((p) =>
    p.category_id === id ? { ...p, category_id: null } : p
  );
  data.categories = data.categories.filter((c) => c.id !== id);
  write(data);
}

function validateCategoryHierarchy(data: LocalData, candidate: Category): void {
  if (candidate.parent_id === null) return;
  if (candidate.parent_id === candidate.id) {
    throw new Error("Category cannot be its own parent");
  }
  const parent = data.categories.find((c) => c.id === candidate.parent_id);
  if (parent && parent.parent_id !== null) {
    throw new Error(
      "Sub-categories cannot have their own children (max 2 levels) / หมวดย่อยมี sub-category ไม่ได้"
    );
  }
  const hasChildren = data.categories.some((c) => c.parent_id === candidate.id);
  if (hasChildren) {
    throw new Error(
      "Cannot move a parent category under another parent / ย้ายหมวดที่มี sub ไปเป็น child ไม่ได้"
    );
  }
}

// ── Tags ──────────────────────────────────────────

export function localFetchTags(): Tag[] {
  return [...read().tags].sort((a, b) => a.name.localeCompare(b.name));
}
