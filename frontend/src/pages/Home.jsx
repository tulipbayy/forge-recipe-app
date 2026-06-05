import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";

export default function Home() {
  return (
    <AppLayout>
      <main className="mint-page simple-page">
        <h1>Recipe App</h1>
        <p>Find official recipes, save favorites, and manage your own recipe creations.</p>
        <Link to="/recipes" className="share-button">
          Explore recipes
        </Link>
      </main>
    </AppLayout>
  );
}
