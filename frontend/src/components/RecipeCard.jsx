import { Link } from "react-router-dom";

function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      &#9733;&#9733;&#9733;&#9733;&#9733;
    </span>
  );
}

export default function RecipeCard({
  recipe,
  variant = "catalog",
  onSave,
  onEdit,
  onDelete,
  onRemove,
}) {
  const detailPath = `/recipes/${recipe.recipeId}`;
  const actionCount = [onEdit, onDelete, onRemove].filter(Boolean).length;

  if (variant === "manage") {
    return (
      <article className="recipe-card manage-card">
        <Link to={detailPath}>
          <img src={recipe.imageUrl} alt={recipe.title} />
        </Link>
        <div className="recipe-card-body">
          <h3>{recipe.title}</h3>
          <div className={`manage-actions ${actionCount === 1 ? "single-action" : ""}`}>
            {onEdit && (
              <button type="button" className="soft-action success" onClick={() => onEdit(recipe)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="soft-action danger" onClick={() => onDelete(recipe.recipeId)}>
                Delete
              </button>
            )}
            {onRemove && (
              <button type="button" className="soft-action danger" onClick={() => onRemove(recipe.recipeId)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="recipe-card">
      <Link to={detailPath}>
        <img src={recipe.imageUrl} alt={recipe.title} />
      </Link>
      <button type="button" className="save-button" onClick={() => onSave?.(recipe.recipeId)} aria-label={`Save ${recipe.title}`}>
        &#9829;
      </button>
      <div className="recipe-card-body">
        <div className="recipe-card-heading">
          <h3>{recipe.title}</h3>
          <Stars rating={recipe.rating} />
        </div>
        <p>{recipe.description}</p>
      </div>
    </article>
  );
}
