"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { getAdminServices, createService, updateService, deleteService } from "@/lib/adminApi";
import type { Service, ServiceInput } from "@/types/admin";

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ServiceInput>({
    title: "",
    slug: "",
    description: "",
    icon: "",
    featured: false,
    display_order: 0,
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getAdminServices();
      setServices(data.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
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

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        slug: service.slug,
        description: service.description,
        icon: service.icon,
        featured: service.featured,
        display_order: service.display_order,
      });
    } else {
      setEditingService(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        icon: "",
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
      if (editingService) {
        await updateService(editingService.id, formData);
        showMessage("Service updated successfully");
      } else {
        await createService(formData);
        showMessage("Service created successfully");
      }
      setIsModalOpen(false);
      loadServices();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to save service", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    setSaving(true);
    try {
      await deleteService(serviceToDelete.id);
      showMessage("Service deleted successfully");
      setIsConfirmOpen(false);
      loadServices();
    } catch (err) {
      const error = err as Error;
      showMessage(error.message || "Failed to delete service", true);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Service>[] = [
    { key: "display_order", header: "Order" },
    { key: "title", header: "Title" },
    { key: "icon", header: "Icon" },
    { 
      key: "featured", 
      header: "Featured",
      render: (s) => s.featured ? <span className="text-green-500">Yes</span> : <span className="text-gray-500">No</span>
    },
    { 
      key: "created_at", 
      header: "Created Date",
      render: (s) => new Date(s.created_at).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Add Service
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded">{success}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <DataTable
          data={services}
          columns={columns}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(s) => {
            setServiceToDelete(s);
            setIsConfirmOpen(true);
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? "Edit Service" : "Create Service"}
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
              <label className="block text-sm text-gray-400 mb-1">Icon</label>
              <input
                required
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="bg-gray-950 border-gray-700 rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-400">Featured Service</label>
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
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.title}"? This action cannot be undone.`}
        isDeleting={saving}
      />
    </div>
  );
}
