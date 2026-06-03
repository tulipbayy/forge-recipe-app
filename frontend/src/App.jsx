import { Routes, Route } from "react-router-dom";
import RecipeDetail from "./pages/RecipeDetail";

function App() {
  return (
    <Routes>
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="*" element={<RecipeDetail />} />
    </Routes>
  );
}

export default App;
