"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  getAdminInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from "@/lib/adminApi";
import type { ContactInquiry, InquiryStatus } from "@/types/admin";

const STATUS_OPTIONS: InquiryStatus[] = ["new", "read", "replied", "archived"];

function statusBadgeClass(status: InquiryStatus): string {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "read":
      return "bg-gray-800 text-gray-300 border border-gray-700";
    case "replied":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "archived":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    default:
      return "bg-gray-800 text-gray-400";
  }
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await getAdminInquiries(
        statusFilter === "all" ? undefined : statusFilter,
        page * limit,
        limit
      );
      setInquiries(data);
    } catch (err) {
      const loadError = err as Error;
      setError(loadError.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleFilterChange = (value: InquiryStatus | "all") => {
    setPage(0);
    setStatusFilter(value);
  };

  const handleOpenDetail = async (inquiry: ContactInquiry) => {
    setSelectedInquiry(null);
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      let detail = await getInquiry(inquiry.id);
      if (detail.status === "new") {
        detail = await updateInquiryStatus(detail.id, { status: "read" });
        loadInquiries();
      }
      setSelectedInquiry(detail);
    } catch (err) {
      const openError = err as Error;
      showMessage(openError.message || "Failed to load inquiry", true);
      setSelectedInquiry(inquiry);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (inquiry: ContactInquiry, status: InquiryStatus) => {
    if (inquiry.status === status) return;
    setSaving(true);
    try {
      const updated = await updateInquiryStatus(inquiry.id, { status });
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(updated);
      }
      showMessage("Inquiry status updated");
      loadInquiries();
    } catch (err) {
      const statusError = err as Error;
      showMessage(statusError.message || "Failed to update status", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    setSaving(true);
    try {
      await deleteInquiry(inquiryToDelete.id);
      showMessage("Inquiry deleted successfully");
      setIsConfirmOpen(false);
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setIsModalOpen(false);
        setSelectedInquiry(null);
      }
      loadInquiries();
    } catch (err) {
      const deleteError = err as Error;
      showMessage(deleteError.message || "Failed to delete inquiry", true);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ContactInquiry>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "subject", header: "Subject" },
    {
      key: "status",
      header: "Status",
      render: (inquiry) => (
        <select
          value={inquiry.status}
          disabled={saving}
          onChange={(e) =>
            handleStatusChange(inquiry, e.target.value as InquiryStatus)
          }
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-gray-700 text-white rounded px-2 py-1"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "created_at",
      header: "Received",
      render: (inquiry) => new Date(inquiry.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value as InquiryStatus | "all")}
          className="bg-gray-950 border border-gray-700 text-white rounded px-3 py-2"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded">
          {success}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <DataTable
          data={inquiries}
          columns={columns}
          loading={loading}
          editLabel="View"
          onEdit={handleOpenDetail}
          onDelete={(inquiry) => {
            setInquiryToDelete(inquiry);
            setIsConfirmOpen(true);
          }}
        />

        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">Page {page + 1}</span>
          <button
            disabled={inquiries.length < limit || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInquiry(null);
        }}
        title={selectedInquiry?.subject || "Inquiry"}
      >
        {detailLoading || !selectedInquiry ? (
          <div className="text-gray-400">Loading inquiry...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${statusBadgeClass(
                  selectedInquiry.status
                )}`}
              >
                {selectedInquiry.status}
              </span>
              <select
                value={selectedInquiry.status}
                disabled={saving}
                onChange={(e) =>
                  handleStatusChange(
                    selectedInquiry,
                    e.target.value as InquiryStatus
                  )
                }
                className="bg-gray-950 border border-gray-700 text-white rounded px-3 py-2"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-400">From</div>
              <div className="text-white">{selectedInquiry.name}</div>
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {selectedInquiry.email}
              </a>
            </div>
            <div>
              <div className="text-sm text-gray-400">Received</div>
              <div className="text-white">
                {new Date(selectedInquiry.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Message</div>
              <p className="text-white whitespace-pre-wrap bg-gray-950 border border-gray-800 rounded p-4">
                {selectedInquiry.message}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message={`Are you sure you want to delete the inquiry from "${inquiryToDelete?.name}"? This action cannot be undone.`}
        isDeleting={saving}
      />
    </div>
  );
}
