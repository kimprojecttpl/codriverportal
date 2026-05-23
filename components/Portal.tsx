"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";
import { Topbar, type SortKey } from "./Topbar";
import { Hero } from "./Hero";
import { CategoryRail } from "./CategoryRail";
import { ProjectsTable } from "./ProjectsTable";
import { DetailPanel } from "./DetailPanel";
import { ProjectFormModal } from "./ProjectFormModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { LoadingState, ErrorState } from "./LoadingState";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import type { Category, ProjectInput, ProjectWithTags, Tag } from "@/lib/types";
import {
  createProject,
  deleteProject,
  descendantCategoryIds,
  fetchCategories,
  fetchProjects,
  fetchTags,
  togglePinned,
  touchLastAccessed,
  updateProject,
} from "@/lib/db";

export function Portal() {
  const supabase = useMemo(() => createClient(), []);

  const [projects, setProjects] = useState<ProjectWithTags[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [selected, setSelected] = useState<ProjectWithTags | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectWithTags | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithTags | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onNew: () => {
      setEditTarget(null);
      setFormOpen(true);
    },
    onEscape: () => {
      if (selected) setSelected(null);
    },
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      // supabase may be null (Local mode) — db.ts functions fall back to localStorage
      const [p, c, t] = await Promise.all([
        fetchProjects(supabase),
        fetchCategories(supabase),
        fetchTags(supabase),
      ]);
      setProjects(p);
      setCategories(c);
      setTags(t);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Realtime sync — Supabase channel when cloud-mode, storage events when local-mode
  useEffect(() => {
    if (supabase) {
      const channel = supabase
        .channel("portal-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "projects" },
          () => refetch()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "categories" },
          () => refetch()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "project_tags" },
          () => refetch()
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
    // Local mode — listen for cross-tab storage changes
    const onChange = () => refetch();
    window.addEventListener("storage", onChange);
    window.addEventListener("codriver-storage-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("codriver-storage-change", onChange);
    };
  }, [supabase, refetch]);

  const filtered = useMemo(() => {
    const STATUS_FILTERS = ["active", "paused", "done"];

    // Build category id set for filter — includes descendants when parent is selected
    let categoryIdSet: Set<string> | null = null;
    if (
      filter !== "all" &&
      filter !== "pinned" &&
      !STATUS_FILTERS.includes(filter)
    ) {
      const selectedCat = categories.find((c) => c.id === filter);
      if (selectedCat) {
        const ids = [selectedCat.id, ...descendantCategoryIds(categories, selectedCat.id)];
        categoryIdSet = new Set(ids);
      }
    }

    const result = projects.filter((p) => {
      if (filter === "pinned") return p.pinned;
      if (STATUS_FILTERS.includes(filter)) return p.status === filter;
      if (categoryIdSet && (!p.category_id || !categoryIdSet.has(p.category_id))) return false;
      if (search) {
        const q = search.toLowerCase();
        const inName =
          p.name_th.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q);
        const inDesc =
          p.description_th.toLowerCase().includes(q) ||
          p.description_en.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inDesc && !inTags) return false;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === "name") return a.name_th.localeCompare(b.name_th, "th");
      if (sortBy === "status") {
        const order = { active: 0, paused: 1, done: 2 };
        return order[a.status] - order[b.status];
      }
      const aTime = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
      const bTime = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [projects, categories, filter, search, sortBy]);

  const handleLaunch = async (p: ProjectWithTags) => {
    window.open(p.url, "_blank", "noopener,noreferrer");
    try {
      await touchLastAccessed(supabase, p.id);
      setProjects((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, last_accessed_at: new Date().toISOString() } : x
        )
      );
    } catch {
      // Non-blocking — launch already happened
    }
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (p: ProjectWithTags) => {
    setEditTarget(p);
    setFormOpen(true);
  };

  const handleFormSubmit = async (input: ProjectInput) => {
    if (editTarget) {
      await updateProject(supabase, editTarget.id, input);
    } else {
      await createProject(supabase, input);
    }
    await refetch();
    setSelected(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(supabase, deleteTarget.id);
    await refetch();
    setSelected(null);
  };

  const handleTogglePin = async (p: ProjectWithTags) => {
    const next = !p.pinned;
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, pinned: next } : x)));
    if (selected?.id === p.id) setSelected({ ...p, pinned: next });
    try {
      await togglePinned(supabase, p.id, next);
    } catch (e) {
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, pinned: !next } : x)));
      if (selected?.id === p.id) setSelected({ ...p, pinned: !next });
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          search={search}
          onSearchChange={setSearch}
          onAddNew={handleAddNew}
          resultCount={filtered.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchInputRef={searchInputRef}
          isLocal={supabase === null}
        />
        <Hero
          projects={projects}
          onAddNew={handleAddNew}
          onSearchFocus={() => searchInputRef.current?.focus()}
          onLaunch={handleLaunch}
        />
        <div className="flex-1 flex min-h-0">
          <CategoryRail
            categories={categories}
            projects={projects}
            selected={filter}
            onSelect={setFilter}
            onReset={() => {
              setFilter("all");
              setSearch("");
              setSortBy("recent");
            }}
          />
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <ProjectsTable
              projects={filtered}
              categories={categories}
              onRowClick={setSelected}
              onLaunch={handleLaunch}
              onAddNew={handleAddNew}
            />
          )}
          <DetailPanel
            project={selected}
            categories={categories}
            onClose={() => setSelected(null)}
            onLaunch={handleLaunch}
            onEdit={handleEdit}
            onDelete={(p) => setDeleteTarget(p)}
            onTogglePin={handleTogglePin}
          />
        </div>
      </div>

      <ProjectFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        tagSuggestions={tags.map((t) => t.name)}
        initial={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title_th="ลบโครงการ"
        title_en="Delete Project"
        message_th={`ต้องการลบ "${deleteTarget?.name_th ?? ""}" ใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้`}
        message_en={`Delete "${deleteTarget?.name_en ?? ""}"? This action cannot be undone.`}
        confirmLabel_th="ลบ"
        confirmLabel_en="Delete"
        danger
      />
    </div>
  );
}
