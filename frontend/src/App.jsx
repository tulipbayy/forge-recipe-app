import { Routes, Route } from "react-router-dom";
import RecipeDetail from "./pages/RecipeDetail";
import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="*" element={<RecipeDetail />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
