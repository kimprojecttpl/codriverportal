"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CategoryRail } from "./CategoryRail";
import { ProjectsTable } from "./ProjectsTable";
import { DetailPanel } from "./DetailPanel";
import { mockProjects, mockCategories } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

export function Portal() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      if (filter === "active" && p.status !== "active") return false;
      if (filter === "paused" && p.status !== "paused") return false;
      if (filter === "done" && p.status !== "done") return false;
      if (filter === "pinned") return false;
      if (
        filter !== "all" &&
        filter !== "active" &&
        filter !== "paused" &&
        filter !== "done" &&
        filter !== "pinned" &&
        p.category_id !== filter
      ) {
        return false;
      }
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
  }, [search, filter]);

  const handleLaunch = (p: Project) => {
    window.open(p.url, "_blank", "noopener,noreferrer");
  };

  const handleAddNew = () => {
    alert(
      "เพิ่มโครงการ — จะใช้งานได้ใน v1.1 (ต่อ Supabase แล้ว)\n\nAdd Project — Available in v1.1 (after Supabase integration)"
    );
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
        />
        <div className="flex-1 flex min-h-0">
          <CategoryRail
            categories={mockCategories}
            projects={mockProjects}
            selected={filter}
            onSelect={setFilter}
            onReset={() => {
              setFilter("all");
              setSearch("");
            }}
          />
          <ProjectsTable
            projects={filtered}
            categories={mockCategories}
            onRowClick={setSelected}
            onLaunch={handleLaunch}
            onAddNew={handleAddNew}
          />
          <DetailPanel
            project={selected}
            categories={mockCategories}
            onClose={() => setSelected(null)}
            onLaunch={handleLaunch}
          />
        </div>
      </div>
    </div>
  );
}
