import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Footer Component
 * 
 * Clean, matching footer across all pages displaying conditional links,
 * copyright, and value-driven feature highlights with zero framework jargon.
 */
export const Footer: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const performLogout = useAuthStore((state) => state.logout);

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-cyan-400 font-bold">⚡ SliceForge</span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400">Zero-Padding Sprite Sheet Slicer</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Production-ready frame extraction, content-aware alpha scanning, and automated zero-padded exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <Link to="/" className="hover:text-cyan-300 transition-colors">
              Home
            </Link>
            <Link to="/engine" className="hover:text-cyan-300 transition-colors">
              Engine Workspace
            </Link>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">
              Contact Us
            </Link>
            {currentUser ? (
              <>
                <Link to="/engine" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Go to Workspace
                </Link>
                <button
                  type="button"
                  onClick={() => void performLogout()}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-cyan-300 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="hover:text-cyan-300 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 font-mono">
          <span>Precision Sprite Slicing • Automated Zero-Padding • High-Performance Web Engine</span>
          <span>© {new Date().getFullYear()} SliceForge. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
