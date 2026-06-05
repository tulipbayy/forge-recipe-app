import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";

export default function Admin() {
  const { firebaseUser, userDoc, loading: authLoading } = useAuth();
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, published: 0, rejected: 0 });
  const [filter, setFilter] = useState("pending");
  const [allRecipes, setAllRecipes] = useState([]);

  useEffect(() => {
    if (!authLoading && firebaseUser && userDoc?.isAdmin) {
      fetchPendingRecipes();
      fetchStats();
      fetchAllRecipes();
    }
  }, [authLoading, firebaseUser, userDoc?.isAdmin]);

  async function authHeaders() {
    if (!firebaseUser) return {};
    const token = await firebaseUser.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  const fetchPendingRecipes = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      console.log("TOKEN:", token);
      const response = await fetch(`${API_BASE_URL}/admin/pending`, {
        headers: await authHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load pending recipes");
      }

      setPendingRecipes(data);
    } catch (err) {
      setError(err.message || "Failed to load pending recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${id}/approve`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to approve recipe");
      setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
      setAllRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "published", approved: true } : r,
        ),
      );
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        published: prev.published + 1,
      }));
    } catch (err) {
      console.error("Failed to approve recipe", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/${id}/reject`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to reject recipe");
      setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
      setAllRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "rejected", rejected: true } : r,
        ),
      );
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
      }));
    } catch (err) {
      console.error("Failed to reject recipe", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const fetchAllRecipes = async () => {
    try {
      const token = await firebaseUser.getIdToken();
      const [pendingRes, publishedRes, rejectedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/published`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/admin/rejected`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [pending, published, rejected] = await Promise.all([
        pendingRes.json(),
        publishedRes.json(),
        rejectedRes.json(),
      ]);
      setAllRecipes([
        ...(Array.isArray(pending)
          ? pending.map((r) => ({ ...r, status: "pending" }))
          : []),
        ...(Array.isArray(published)
          ? published.map((r) => ({ ...r, status: "published" }))
          : []),
        ...(Array.isArray(rejected)
          ? rejected.map((r) => ({ ...r, status: "rejected" }))
          : []),
      ]);
    } catch (err) {
      console.error("Failed to load all recipes", err);
    }
  };

  const filteredRecipes =
    filter === "all"
      ? allRecipes
      : filter === "pending"
        ? allRecipes.filter((r) => r.status === "pending")
        : filter === "published"
          ? allRecipes.filter((r) => r.status === "published")
          : allRecipes.filter((r) => r.status === "rejected");

  if (authLoading || (firebaseUser && userDoc?.isAdmin && loading)) {
    return (
      <div className="min-h-screen bg-[#E8F3EB] flex items-center justify-center">
        <p className="text-slate-600">Loading pending recipes...</p>
      </div>
    );
  }

  if (!firebaseUser || userDoc?.isAdmin !== true) {
    return <Navigate to="/recipes" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E8F3EB] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-slate-800 mb-2">
              Admin Review
            </h1>
            <p className="text-slate-600">
              {pendingRecipes.length} recipe
              {pendingRecipes.length !== 1 ? "s" : ""} pending review
            </p>
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E9DAD5]">
              <p className="text-3xl font-serif text-[#B85A1A] mb-1">
                {stats.pending}
              </p>
              <p className="text-sm text-slate-500">Pending review</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-3xl font-serif text-[#2C5A5A] mb-1">
                {stats.published}
              </p>
              <p className="text-sm text-slate-500">Published</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-3xl font-serif text-slate-400 mb-1">
                {stats.rejected}
              </p>
              <p className="text-sm text-slate-500">Rejected</p>
            </div>
          </div>
          {/* Filter chips */}
          <div className="flex gap-3 mb-6">
            {["all", "pending", "published", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  filter === f
                    ? "bg-[#2C5A5A] text-white"
                    : "bg-white text-slate-600 hover:bg-[#D2E3D9]"
                }`}
              >
                {f === "all" ? "All submissions" : f}
              </button>
            ))}
          </div>
          {/* Empty state */}
          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-slate-500 text-lg">
                No {filter === "all" ? "" : filter} recipes{" "}
                {filter === "pending" ? "pending review" : "found"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="flex gap-6 p-6">
                    {/* Recipe image */}
                    {recipe.imageUrl && (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-32 h-28 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                    {/* Recipe info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-serif text-slate-800 mb-1">
                            {recipe.title}
                          </h2>
                          <p className="text-sm text-slate-500 mb-2">
                            by {recipe.authorId} · {recipe.category}
                          </p>
                          <p className="text-slate-600 text-sm line-clamp-2">
                            {recipe.description}
                          </p>
                        </div>
                        {/* Approve / Reject buttons */}
                        <div className="flex gap-3 flex-shrink-0">
                          {recipe.status === "published" ? (
                            <button className="bg-[#D2E3D9] text-[#2C5A5A] px-5 py-2 rounded-lg text-sm font-medium cursor-default">
                              ✓ Approved
                            </button>
                          ) : recipe.status === "rejected" ? (
                            <button className="bg-[#D8C9C2] text-slate-500 px-5 py-2 rounded-lg text-sm font-medium cursor-default">
                              ✕ Rejected
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(recipe.id)}
                                className="bg-[#2C5A5A] text-white px-5 py-2 rounded-lg hover:bg-[#244648] transition text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(recipe.id)}
                                className="bg-[#E9DAD5] text-slate-800 px-5 py-2 rounded-lg hover:bg-[#D8C9C2] transition text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Ingredients preview */}
                      {recipe.ingredients && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            Ingredients
                          </p>
                          <p className="text-sm text-slate-600">
                            {recipe.ingredients.slice(0, 3).join(", ")}
                            {recipe.ingredients.length > 3 && "..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
