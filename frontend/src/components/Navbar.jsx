import { NavLink } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../public/firebase";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { firebaseUser, userDoc } = useAuth();

  const initials =
    userDoc?.username?.slice(0, 2).toUpperCase() ||
    firebaseUser?.email?.slice(0, 2).toUpperCase() ||
    "JD";

  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function handleLogout() {
    await signOut(auth);
  }

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
        <NavLink to="/recipes">Recipes</NavLink>
        <NavLink to="/my-recipes">My Recipes</NavLink>
        <NavLink to="/create-recipe">Create Recipe</NavLink>
      </nav>
      <div className="account-actions">
        {firebaseUser ? (
          <>
            <div className="avatar" aria-label="Current user">
              {initials}
            </div>
            <button type="button" className="auth-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button type="button" className="auth-button primary" onClick={handleLogin}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}
