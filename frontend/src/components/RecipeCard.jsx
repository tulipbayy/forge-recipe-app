import { useNavigate } from "react-router-dom";

export default function RecipeCard({
  recipe,
  variant = "catalog",
  onEdit,
  onDelete,
  onRemove,
  onSave,
}) {
  const navigate = useNavigate();
  const displayRating = recipe.averageRating ?? recipe.rating;
  const hasRating = Number(displayRating) > 0;

  const handleClick = () => {
    navigate(`/recipe/${recipe.recipeId}?source=${recipe.source}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const handleAction = (event, action) => {
    event.stopPropagation();
    action?.(recipe);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-video overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#5a8f6a] uppercase tracking-wide">
            {recipe.category || "Recipe"}
          </span>
          <span className="text-xs text-slate-400 capitalize">
            {recipe.source === "community" ? "👤 Community" : recipe.source === "official" ? "⭐ Official" : "🌐 Edamam"}
          </span>
        </div>

        <h3 className="font-serif text-slate-800 text-lg leading-tight line-clamp-2">
          {recipe.title}
        </h3>

        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
          <span className="text-yellow-400">★</span>
          <span>{hasRating ? Number(displayRating).toFixed(1) : "Not rated"}</span>
          {hasRating && recipe.ratingCount ? <span>({recipe.ratingCount})</span> : null}
        </div>

        {variant === "manage" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {onEdit && (
              <button
                type="button"
                className="rounded-md bg-[#c9e2d4] px-3 py-1.5 text-sm font-medium text-[#153f42]"
                onClick={(event) => handleAction(event, onEdit)}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="rounded-md bg-[#f4dfdc] px-3 py-1.5 text-sm font-medium text-[#b45b50]"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(recipe.recipeId);
                }}
              >
                Delete
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="col-span-2 rounded-md bg-[#f4dfdc] px-3 py-1.5 text-sm font-medium text-[#b45b50]"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(recipe.recipeId);
                }}
              >
                Remove
              </button>
            )}
          </div>
        )}

        {variant !== "manage" && onSave && (
          <button
            type="button"
            className="mt-4 rounded-md bg-[#f4dfdc] px-3 py-1.5 text-sm font-medium text-[#153f42]"
            onClick={(event) => {
              event.stopPropagation();
              onSave(recipe.recipeId);
            }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
