import { auth } from "../../public/firebase";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getComments(recipeId) {
  const res = await fetch(`${API_BASE}/recipes/${recipeId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export async function postComment(recipeId, text, parentCommentId = null) {
  const res = await fetch(`${API_BASE}/recipes/${recipeId}/comments`, {
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
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

export async function toggleUpvote(commentId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}/upvote`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to upvote");
  return res.json();
}
