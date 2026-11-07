import React from "react";
import { Link } from "react-router-dom";

/**
 * NotFoundPage Component
 * 
 * Displayed when visitors navigate to an unrecognized route.
 */
export const NotFoundPage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
        Error 404
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-base text-slate-400">
        The route you requested does not exist or has been moved within SliceForge.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 transition-all hover:bg-cyan-500"
        >
          Return Home
        </Link>
        <Link
          to="/engine"
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-slate-500 hover:text-white"
        >
          Open Engine Workspace
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
