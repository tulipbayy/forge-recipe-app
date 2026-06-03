import { NavLink } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="top-nav">
      <div className="brand-group">
        <button type="button" className="menu-button" onClick={onMenuClick} aria-label="Open navigation menu">
          &#9776;
        </button>
        <NavLink to="/" className="brand">
          Recipe App
        </NavLink>
      </div>
      <nav aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/recipes">Recipe</NavLink>
        <NavLink to="/my-recipes">My Recipes</NavLink>
      </nav>
      <div className="avatar" aria-label="Current user">
        JD
      </div>
    </header>
  );
}
