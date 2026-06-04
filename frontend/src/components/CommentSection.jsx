import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getComments,
  postComment,
  deleteComment,
  toggleUpvote,
} from "../services/api";

export default function CommentSection({ recipeId, onCommentsLoaded }) {
  const { firebaseUser, userDoc } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!recipeId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getComments(recipeId);
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId]);

  // Count number of comments to pass to RecipeDetail
  useEffect(() => {
    if (onCommentsLoaded) {
      onCommentsLoaded(comments.length);
    }
  }, [comments, onCommentsLoaded]);

  async function handlePost(e) {
    e.preventDefault();
    if (!newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await postComment(recipeId, newText);
      setComments((prev) => [created, ...prev]);
      setNewText("");
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentCommentId) {
    if (!replyText.trim()) return;
    try {
      const created = await postComment(recipeId, replyText, parentCommentId);
      setComments((prev) => [created, ...prev]);
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
      alert("Failed to post reply");
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  async function handleUpvote(commentId) {
    try {
      const result = await toggleUpvote(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId ? { ...c, upvotes: result.upvotes } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parentCommentId) {
      (acc[c.parentCommentId] ||= []).push(c);
    }
    return acc;
  }, {});
  // Replies in chronological order within each thread
  Object.values(repliesByParent).forEach((arr) =>
    arr.sort(
      (a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0)
    )
  );

  function canDelete(comment) {
    if (!firebaseUser) return false;
    return comment.userId === firebaseUser.uid || userDoc?.isAdmin === true;
  }

  return (
    <div className="mt-8 text-left">
      <h2 className="text-2xl font-serif text-slate-800 mb-4">Comments</h2>

      {firebaseUser ? (
        <form onSubmit={handlePost} className="mb-6">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newText.trim() || submitting}
            className="mt-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-gray-600 italic">Log in to comment.</p>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : topLevel.length === 0 ? (
        <p className="text-gray-600">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((c) => (
            <CommentItem
              key={c.commentId}
              comment={c}
              replies={repliesByParent[c.commentId] || []}
              currentUser={firebaseUser}
              canDelete={canDelete}
              onUpvote={handleUpvote}
              onDelete={handleDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(ts) {
  if (!ts?._seconds) return "";
  return new Date(ts._seconds * 1000).toLocaleString();
}

function CommentItem({
  comment,
  replies,
  currentUser,
  canDelete,
  onUpvote,
  onDelete,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onReply,
}) {
  const isReplying = replyingTo === comment.commentId;

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <div className="flex items-start gap-3">
        {comment.profilePicture ? (
          <img
            src={comment.profilePicture}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {comment.username || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-slate-700">{comment.text}</p>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <button
              onClick={() => onUpvote(comment.commentId)}
              disabled={!currentUser}
              className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              ▲ {comment.upvotes || 0}
            </button>
            {currentUser && (
              <button
                onClick={() =>
                  setReplyingTo(isReplying ? null : comment.commentId)
                }
                className="text-slate-600 hover:text-slate-900"
              >
                Reply
              </button>
            )}
            {canDelete(comment) && (
              <button
                onClick={() => onDelete(comment.commentId)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => onReply(comment.commentId)}
                  disabled={!replyText.trim()}
                  className="bg-slate-800 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  className="text-slate-600 px-3 py-1 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
              {replies.map((r) => (
                <div key={r.commentId} className="flex items-start gap-2">
                  {r.profilePicture ? (
                    <img
                      src={r.profilePicture}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">
                        {r.username || "User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{r.text}</p>
                    <div className="mt-1 flex gap-3 text-xs">
                      <button
                        onClick={() => onUpvote(r.commentId)}
                        disabled={!currentUser}
                        className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
                      >
                        ▲ {r.upvotes || 0}
                      </button>
                      {canDelete(r) && (
                        <button
                          onClick={() => onDelete(r.commentId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
