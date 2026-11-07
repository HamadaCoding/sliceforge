import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface NavigationItem {
  path: string;
  label: string;
  exactMatch: boolean;
}

const primaryNavigationLinks: NavigationItem[] = [
  { path: "/", label: "Home", exactMatch: true },
  { path: "/engine", label: "Engine Workspace", exactMatch: false },
  { path: "/contact", label: "Contact Us", exactMatch: false },
];

/**
 * Header Component
 * 
 * Sticky top navigation bar featuring active route indicators,
 * brand identity, and conditional session controls.
 */
export const Header: React.FC = () => {
  const navigateTo = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthHydrated = useAuthStore((state) => state.isReady);
  const performLogout = useAuthStore((state) => state.logout);

  const handleLogoutClick = async (): Promise<void> => {
    await performLogout();
    navigateTo("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        {/* Brand Identity */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform text-lg shadow-md shadow-cyan-500/10">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-wider text-white">
            SLICE<span className="text-cyan-400">FORGE</span>
          </span>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {primaryNavigationLinks.map((navItem) => (
            <NavLink
              key={navItem.path}
              to={navItem.path}
              end={navItem.exactMatch}
              className={({ isActive }: { isActive: boolean }) =>
                `px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`
              }
            >
              {navItem.label}
            </NavLink>
          ))}
        </nav>

        {/* Conditional Authentication Controls */}
        <div className="flex items-center gap-3 text-xs md:text-sm">
          {!isAuthHydrated ? (
            <span className="text-slate-500 text-xs">Loading...</span>
          ) : currentUser ? (
            /* Logged-in State: Hide registration/login CTAs; show user pill, workspace shortcut, and Logout */
            <div className="flex items-center gap-2.5">
              <span className="max-w-36 truncate text-slate-300 font-medium text-xs bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800" title={currentUser.email}>
                👤 {currentUser.name}
              </span>
              <Link
                to="/engine"
                className="hidden sm:inline-flex rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 px-3 py-1 font-semibold text-xs transition-colors"
              >
                Go to Workspace
              </Link>
              <button
                type="button"
                onClick={() => void handleLogoutClick()}
                className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1 text-slate-300 hover:text-white transition-colors text-xs cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            /* Logged-out State: Show Sign In and Get Started */
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-3 py-1.5 text-slate-300 hover:text-white transition-colors text-xs font-medium"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
              >
                Get Started
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
