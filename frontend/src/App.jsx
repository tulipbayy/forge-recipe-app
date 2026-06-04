import { Routes, Route } from "react-router-dom";
import RecipeDetail from "./pages/RecipeDetail";
import CreateRecipe from "./pages/CreateRecipe";

function App() {
  return (
    <Routes>
      <Route path="/create-recipe" element={<CreateRecipe />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="*" element={<RecipeDetail />} />
    </Routes>
  );
}

export default App;
