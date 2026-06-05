import { useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }) {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const { userDoc } = useAuth();

  return (
    <div className="app-frame">
      <Navbar onMenuClick={() => setIsSideNavOpen(true)} />
      <div
        className={`side-drawer ${isSideNavOpen ? "open" : ""}`}
        aria-hidden={!isSideNavOpen}
      >
        <button
          type="button"
          className="drawer-close"
          onClick={() => setIsSideNavOpen(false)}
          aria-label="Close navigation menu"
        >
          &times;
        </button>
        <nav aria-label="Side navigation">
          <NavLink to="/" onClick={() => setIsSideNavOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/recipes" onClick={() => setIsSideNavOpen(false)}>
            Recipes
          </NavLink>
          <NavLink to="/my-recipes" onClick={() => setIsSideNavOpen(false)}>
            My Recipes
          </NavLink>
          <NavLink to="/create-recipe" onClick={() => setIsSideNavOpen(false)}>
            Create Recipe
          </NavLink>
          {userDoc?.isAdmin && (
            <>
              <p className="sidebar-section-label">Admin only</p>
              <NavLink to="/admin" onClick={() => setIsSideNavOpen(false)}>
                Review
              </NavLink>
            </>
          )}
        </nav>
      </div>
      {isSideNavOpen && (
        <button
          type="button"
          className="drawer-backdrop"
          onClick={() => setIsSideNavOpen(false)}
          aria-label="Close navigation menu"
        />
      )}
      {children}
    </div>
  );
}
