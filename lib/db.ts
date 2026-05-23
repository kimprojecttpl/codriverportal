import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  CategoryInput,
  Project,
  ProjectInput,
  ProjectWithTags,
  Tag,
} from "./types";

export async function fetchProjects(supabase: SupabaseClient): Promise<ProjectWithTags[]> {
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("pinned", { ascending: false })
    .order("last_accessed_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (projectsError) throw projectsError;

  const { data: projectTags, error: ptError } = await supabase
    .from("project_tags")
    .select("project_id, tags(name)");

  if (ptError) throw ptError;

  type ProjectTagRow = { project_id: string; tags: { name: string } | { name: string }[] | null };
  const tagsByProject: Record<string, string[]> = {};
  for (const row of (projectTags ?? []) as ProjectTagRow[]) {
    if (!tagsByProject[row.project_id]) tagsByProject[row.project_id] = [];
    const tagData = row.tags;
    if (Array.isArray(tagData)) {
      for (const t of tagData) tagsByProject[row.project_id].push(t.name);
    } else if (tagData) {
      tagsByProject[row.project_id].push(tagData.name);
    }
  }

  return (projects as Project[]).map((p) => ({
    ...p,
    tags: tagsByProject[p.id] ?? [],
  }));
}

export async function fetchCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function fetchTags(supabase: SupabaseClient): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Tag[];
}

export async function createProject(
  supabase: SupabaseClient,
  input: ProjectInput
): Promise<Project> {
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;
  if (!ownerId) throw new Error("Not authenticated");

  const { tags, ...projectFields } = input;
  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...projectFields, owner_id: ownerId })
    .select()
    .single();

  if (error) throw error;
  if (tags.length > 0) await syncProjectTags(supabase, project.id, tags, ownerId);
  return project as Project;
}

export async function updateProject(
  supabase: SupabaseClient,
  id: string,
  input: ProjectInput
): Promise<Project> {
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;
  if (!ownerId) throw new Error("Not authenticated");

  const { tags, ...projectFields } = input;
  const { data: project, error } = await supabase
    .from("projects")
    .update(projectFields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await syncProjectTags(supabase, id, tags, ownerId);
  return project as Project;
}

export async function deleteProject(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function touchLastAccessed(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function togglePinned(
  supabase: SupabaseClient,
  id: string,
  pinned: boolean
): Promise<void> {
  const { error } = await supabase.from("projects").update({ pinned }).eq("id", id);
  if (error) throw error;
}

export async function syncProjectTags(
  supabase: SupabaseClient,
  projectId: string,
  tagNames: string[],
  ownerId: string
): Promise<void> {
  const normalized = Array.from(
    new Set(tagNames.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))
  );

  await supabase.from("project_tags").delete().eq("project_id", projectId);

  if (normalized.length === 0) return;

  const { data: existing } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", normalized);

  const existingMap = new Map<string, string>(
    (existing ?? []).map((t: { id: string; name: string }) => [t.name, t.id])
  );

  const newTagNames = normalized.filter((n) => !existingMap.has(n));
  if (newTagNames.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("tags")
      .insert(newTagNames.map((name) => ({ name, owner_id: ownerId })))
      .select("id, name");
    if (insertError) throw insertError;
    for (const t of inserted ?? []) existingMap.set(t.name, t.id);
  }

  const links = normalized.map((name) => ({
    project_id: projectId,
    tag_id: existingMap.get(name)!,
  }));

  const { error: linkError } = await supabase.from("project_tags").insert(links);
  if (linkError) throw linkError;
}

export async function createCategory(
  supabase: SupabaseClient,
  input: CategoryInput
): Promise<Category> {
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;
  if (!ownerId) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("categories")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1);
  const nextOrder = ((existing?.[0]?.order_index as number | undefined) ?? 0) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...input, owner_id: ownerId, order_index: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  input: CategoryInput
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
