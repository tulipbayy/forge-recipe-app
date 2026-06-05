import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Recipes from "./pages/Recipes.jsx";
import MyRecipes from "./pages/MyRecipes.jsx";
import CreateRecipe from "./pages/CreateRecipe.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/my-recipes" element={<MyRecipes />} />
      <Route path="/create-recipe" element={<CreateRecipe />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/recipes" replace />} />
    </Routes>
  );
}
