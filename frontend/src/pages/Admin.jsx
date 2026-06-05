import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
    const { firebaseUser, userDoc, loading: authLoading } = useAuth();
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && firebaseUser && userDoc?.isAdmin) {
            fetchPendingRecipes();
        }
    }, [authLoading, firebaseUser, userDoc?.isAdmin]);

    async function authHeaders() {
        if (!firebaseUser) return {};
        const token = await firebaseUser.getIdToken();
        return { Authorization: `Bearer ${token}` };
    }

    const fetchPendingRecipes = async () => {
        try {
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
    }

    const handleApprove = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/${id}/approve`, {
                method: "PATCH",
                headers: await authHeaders(),
            });
            if (!response.ok) throw new Error("Failed to approve recipe");
            setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to approve recipe", err);
        }
    }

    const handleReject = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/${id}/reject`, {
                method: "PATCH",
                headers: await authHeaders(),
            });
            if (!response.ok) throw new Error("Failed to reject recipe");
            setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to reject recipe", err);
        }
    };

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
        <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-serif text-slate-800 mb-2">
                        Admin Review
                    </h1>
                    <p className="text-slate-600">
                        {pendingRecipes.length} recipe{pendingRecipes.length !== 1 ? "s" : ""} pending review
                    </p>
                </div>
                {/* Empty state */}
                {pendingRecipes.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <p className="text-slate-500 text-lg">
                            No recipes pending review 🎉
                        </p>
                    </div>) : (
                    <div className="space-y-6">
                        {pendingRecipes.map((recipe) => (
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
    );
}
