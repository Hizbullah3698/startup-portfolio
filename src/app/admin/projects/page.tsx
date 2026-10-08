"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getAdminProjects, createProject, updateProject, deleteProject } from "@/lib/adminApi";
import type { Project, ProjectInput } from "@/types/admin";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ProjectInput>({
    title: "",
    slug: "",
    description: "",
    category: "",
    technologies: [],
    featured: false,
    image_url: "",
    github_url: "",
    live_url: "",
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAdminProjects(page * limit, limit);
      setProjects(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        category: project.category,
        technologies: project.technologies,
        featured: project.featured,
        image_url: project.image_url || "",
        github_url: project.github_url || "",
        live_url: project.live_url || "",
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        category: "",
        technologies: [],
        featured: false,
        image_url: "",
        github_url: "",
        live_url: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        showMessage("Project updated successfully");
      } else {
        await createProject(formData);
        showMessage("Project created successfully");
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to save project", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setSaving(true);
    try {
      await deleteProject(projectToDelete.id);
      showMessage("Project deleted successfully");
      setIsConfirmOpen(false);
      loadProjects();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to delete project", true);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Project>[] = [
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    { 
      key: "featured", 
      header: "Featured",
      render: (p) => p.featured ? <span className="text-green-500">Yes</span> : <span className="text-gray-500">No</span>
    },
    { 
      key: "created_at", 
      header: "Created Date",
      render: (p) => new Date(p.created_at).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Add Project
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded">{success}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(p) => {
            setProjectToDelete(p);
            setIsConfirmOpen(true);
          }}
        />
        
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">Page {page + 1}</span>
          <button
            disabled={projects.length < limit || loading}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create Project"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <input
                required
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Technologies (comma separated)</label>
              <input
                required
                type="text"
                value={formData.technologies.join(", ")}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-sm text-gray-400 mb-1">Image URL</label>
              <input
                type="text"
                value={formData.image_url || ""}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
              <input
                type="text"
                value={formData.github_url || ""}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Live URL</label>
              <input
                type="text"
                value={formData.live_url || ""}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="bg-gray-950 border-gray-700 rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-400">Featured Project</label>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
        isDeleting={saving}
      />
    </div>
  );
}
