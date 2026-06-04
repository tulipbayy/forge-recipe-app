import React, { useState, useEffect } from "react";

export default function Admin() {
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingRecipes();
    }, []);

    const fetchPendingRecipes = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/admin/pending");
            const data = await response.json();
            setPendingRecipes(data);
        } catch (err) {
            setError("Fail to load pending recipes");
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/admin/${id}/approve`, {
                method: "PATCH",
            });
            setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to approve recipe", err);
        }
    }

    const handleReject = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/admin/${id}/reject`, {
                method: "PATCH",
            });
            setPendingRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to reject recipe", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E8F3EB] flex items-center justify-center">
                <p className="text-slate-600">Loading pending recipes...</p>
            </div>
        );
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