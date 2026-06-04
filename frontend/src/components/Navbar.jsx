import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../public/firebase";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Recipes", path: "/recipes" },
  { label: "Create Recipe", path: "/create-recipe" },
  { label: "My Recipes", path: "/my-recipes" },
];

const ADMIN_LINK = { label: "Admin", path: "/admin", icon: "⚙️" };

export default function Navbar({ children }) {
  const { firebaseUser, userDoc } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const getInitials = () => {
    if (userDoc?.username) {
      return userDoc.username.slice(0, 2).toUpperCase();
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.slice(0, 2).toUpperCase();
    }
    return "?";
  };

  const links = userDoc?.isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;

  return (
    <div className="min-h-screen flex flex-col bg-[#E8F3EB]">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-slate-900 transition p-1 rounded-md hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-current transition-transform duration-300 origin-center ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-opacity duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-current transition-transform duration-300 origin-center ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>

          <Link
            to="/"
            className="text-2xl font-serif text-slate-800 tracking-tight hover:text-[#5a8f6a] transition"
          >
            Recipe
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <>
              <div className="w-9 h-9 rounded-full bg-[#c8dece] text-[#3d6b4f] flex items-center justify-center font-semibold text-sm">
                {getInitials()}
              </div>
              <span className="text-slate-700 font-medium text-sm hidden sm:block">
                {userDoc?.username || firebaseUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-red-500 transition border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition border border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50"
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm font-medium text-white bg-[#5a8f6a] hover:bg-[#4a7a59] transition px-4 py-1.5 rounded-lg"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-20 ${
            isOpen ? "w-56" : "w-0"
          }`}
        >
          <nav className="flex-1 py-6 px-3 space-y-1 w-56">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#E8F3EB] text-[#3d6b4f] border-l-4 border-[#5a8f6a]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
