import { Routes, Route } from "react-router-dom";
import RecipeDetail from "./pages/RecipeDetail";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<RecipeDetail />} />
    </Routes>
  );
}

export default App;
