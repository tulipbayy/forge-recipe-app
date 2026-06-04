import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { userDoc } = useAuth();
  const initials = userDoc?.displayName
    ? userDoc.displayName.slice(0, 2).toUpperCase()
    : "JD";

  return (
    <div className="min-h-screen flex font-serif text-slate-800">
      <aside className="w-52 bg-[#E8F3EB] p-6 shadow-md shrink-0">
        <h1 className="text-2xl mb-10">Recipe App</h1>
        <nav className="flex flex-col gap-4 pl-6 text-lg">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/recipes" className="hover:underline">
            Recipe
          </Link>
          <Link to="/my-recipes" className="hover:underline">
            My Recipes
          </Link>
          <Link to="/create-recipe" className="hover:underline">
            Create Recipe
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#E8F3EB] px-10 py-5 flex justify-end items-center gap-10 text-lg">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/recipes" className="hover:underline">
            Recipe
          </Link>
          <Link to="/my-recipes" className="hover:underline">
            My Recipes
          </Link>
          <div className="w-11 h-11 rounded-full bg-pink-200 flex items-center justify-center text-sm font-sans font-semibold">
            {initials}
          </div>
        </header>

        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
