"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getAdminTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/adminApi";
import type { Testimonial, TestimonialInput } from "@/types/admin";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<TestimonialInput>({
    client_name: "",
    client_role: "",
    company: "",
    content: "",
    rating: 5,
    avatar_url: "",
    featured: false,
    display_order: 0,
  });

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonials();
      setTestimonials(data.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        client_name: testimonial.client_name,
        client_role: testimonial.client_role,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        avatar_url: testimonial.avatar_url || "",
        featured: testimonial.featured,
        display_order: testimonial.display_order,
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        client_name: "",
        client_role: "",
        company: "",
        content: "",
        rating: 5,
        avatar_url: "",
        featured: false,
        display_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        showMessage("Testimonial updated successfully");
      } else {
        await createTestimonial(formData);
        showMessage("Testimonial created successfully");
      }
      setIsModalOpen(false);
      loadTestimonials();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to save testimonial", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;
    setSaving(true);
    try {
      await deleteTestimonial(testimonialToDelete.id);
      showMessage("Testimonial deleted successfully");
      setIsConfirmOpen(false);
      loadTestimonials();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to delete testimonial", true);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Testimonial>[] = [
    { key: "display_order", header: "Order" },
    { key: "client_name", header: "Client" },
    { key: "company", header: "Company" },
    { key: "rating", header: "Rating" },
    { 
      key: "featured", 
      header: "Featured",
      render: (t) => t.featured ? <span className="text-green-500">Yes</span> : <span className="text-gray-500">No</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Testimonials Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Add Testimonial
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded">{success}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <DataTable
          data={testimonials}
          columns={columns}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(t) => {
            setTestimonialToDelete(t);
            setIsConfirmOpen(true);
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTestimonial ? "Edit Testimonial" : "Create Testimonial"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Name</label>
              <input
                required
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Client Role</label>
              <input
                required
                type="text"
                value={formData.client_role}
                onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Company</label>
            <input
              required
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Content</label>
            <textarea
              required
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rating (1-5)</label>
              <input
                required
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Display Order</label>
              <input
                required
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avatar URL</label>
              <input
                type="text"
                value={formData.avatar_url || ""}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured_test"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="bg-gray-950 border-gray-700 rounded"
            />
            <label htmlFor="featured_test" className="text-sm text-gray-400">Featured Testimonial</label>
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
        title="Delete Testimonial"
        message={`Are you sure you want to delete this testimonial from "${testimonialToDelete?.client_name}"? This action cannot be undone.`}
        isDeleting={saving}
      />
    </div>
  );
}
