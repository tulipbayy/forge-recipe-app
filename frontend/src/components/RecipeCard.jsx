import { useNavigate } from "react-router-dom";

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${recipe.recipeId}?source=${recipe.source}`);
  };

  return (
    <div
      onClick={handleClick}
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
            {recipe.source === "community" ? "👤 Community" : "🌐 Edamam"}
          </span>
        </div>

        <h3 className="font-serif text-slate-800 text-lg leading-tight line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.averageRating && (
          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <span className="text-yellow-400">★</span>
            <span>{recipe.averageRating}</span>
          </div>
        )}
      </div>
    </div>
  );
}
