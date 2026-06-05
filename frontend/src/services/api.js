import { auth } from "../../public/firebase";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  `${import.meta.env.VITE_BASE_URL || `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}`}/api`;

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getComments(recipeId) {
  const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export async function postComment(recipeId, text, parentCommentId = null) {
  const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify({ text, parentCommentId }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

export async function deleteComment(commentId) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

export async function createRecipe(recipe) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    },
    body: JSON.stringify(recipe),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create recipe");
  }
  return res.json();
}

export async function toggleUpvote(commentId) {
  const res = await fetch(`${API_BASE_URL}/comments/${commentId}/upvote`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to upvote");
  return res.json();
}
