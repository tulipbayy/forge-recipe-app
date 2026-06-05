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
          <NavLink
            to="/"
            onClick={() => setIsSideNavOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-[#D2E3D9] text-[#2C5A5A] font-medium"
                  : "hover:bg-[#E3F3E9]"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/recipes"
            onClick={() => setIsSideNavOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-[#D2E3D9] text-[#2C5A5A] font-medium"
                  : "hover:bg-[#E3F3E9]"
              }`
            }
          >
            Recipes
          </NavLink>
          <NavLink
            to="/my-recipes"
            onClick={() => setIsSideNavOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-[#D2E3D9] text-[#2C5A5A] font-medium"
                  : "hover:bg-[#E3F3E9]"
              }`
            }
          >
            My Recipes
          </NavLink>
          <NavLink
            to="/create-recipe"
            onClick={() => setIsSideNavOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-[#D2E3D9] text-[#2C5A5A] font-medium"
                  : "hover:bg-[#E3F3E9]"
              }`
            }
          >
            Create Recipe
          </NavLink>
          {userDoc?.isAdmin && (
            <>
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
