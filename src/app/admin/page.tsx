"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/adminApi";
import type { DashboardStats } from "@/types/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900 h-32 rounded-lg border border-gray-800"></div>
          ))}
        </div>
        <div className="bg-gray-900 h-64 rounded-lg border border-gray-800 mt-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded text-center">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Projects</h3>
          <div className="text-3xl font-bold text-white">{stats.total_projects}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.featured_projects} featured</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Services</h3>
          <div className="text-3xl font-bold text-white">{stats.total_services}</div>
          <div className="text-sm text-gray-500 mt-2">{stats.featured_services} featured</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Testimonials</h3>
          <div className="text-3xl font-bold text-white">{stats.total_testimonials}</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Inquiries</h3>
          <div className="text-3xl font-bold text-white">{stats.total_inquiries}</div>
          <div className="text-sm text-blue-400 mt-2">{stats.new_inquiries} new</div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Recent Inquiries</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {stats.recent_inquiries.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No recent inquiries</div>
          ) : (
            stats.recent_inquiries.map((inquiry) => (
              <div key={inquiry.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{inquiry.name}</div>
                  <div className="text-sm text-gray-400">{inquiry.subject}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      inquiry.status === "new"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
