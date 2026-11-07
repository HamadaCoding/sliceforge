import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { buildFrameFileName, padGridIndex } from "../utils/frameName";

/**
 * HomePage Component
 * 
 * Cinematic landing page showcasing SliceForge's core capabilities, an interactive
 * zero-padding simulator sandbox, and a technical usage guide for developers.
 */
export const HomePage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);

  // Simulator state for interactive zero-padding demonstration
  const [simulatorRows, setSimulatorRows] = useState<number>(4);
  const [simulatorColumns, setSimulatorColumns] = useState<number>(4);
  const [activeTechnicalStep, setActiveTechnicalStep] = useState<number>(1);

  const totalSimulatorFrames = simulatorRows * simulatorColumns;
  const sampleFrameNameFirst = buildFrameFileName(0, 0, simulatorRows, simulatorColumns);
  const sampleFrameNameLast = buildFrameFileName(
    simulatorRows - 1,
    simulatorColumns - 1,
    simulatorRows,
    simulatorColumns
  );

  return (
    <div className="space-y-24 py-12 px-4 md:px-8 max-w-7xl mx-auto page-enter">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-6 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-950/50">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Next-Gen Sprite Sheet Slicer & Zero-Padding Exporter
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Precision Sprite Slicing. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Zero-Padded Automation.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transform irregular or grid-based sprite sheets into production-grade,
          zero-padded image sequences with engine-ready JSON coordinates for Unity,
          Godot, Unreal, and Web frameworks.
        </p>

        {/* Conditional Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/engine"
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
          >
            Launch Engine Workspace ⚡
          </Link>
          {currentUser ? (
            <Link
              to="/engine"
              className="rounded-xl border border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70 px-6 py-3 text-sm font-semibold text-cyan-300 transition-all"
            >
              Resume Slicing 🚀
            </Link>
          ) : (
            <Link
              to="/register"
              className="rounded-xl border border-slate-700 hover:border-cyan-500/60 bg-slate-900/80 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
            >
              Create Free Account
            </Link>
          )}
        </div>

        {/* Value-Driven Benefit Badges (Scrubbed of framework jargon) */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">✓ Sub-Pixel GPU Canvas</span>
          <span className="flex items-center gap-1.5">✓ Content-Aware Alpha Detection</span>
          <span className="flex items-center gap-1.5">✓ Ultra-Fast Cloud Sync</span>
          <span className="flex items-center gap-1.5">✓ Automated Email Notifications</span>
        </div>
      </section>

      {/* Interactive Zero-Padding Simulator Sandbox */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Interactive Engine Sandbox
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Dynamic Zero-Padding Automation Simulator
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Adjust the sliders below to see how SliceForge calculates digit width
              dynamically. Digits automatically pad to 2 digits for ≤99 items, and expand
              dynamically for ≥100 items.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Total Grid Cells:</span>
              <span className="text-cyan-300 font-bold text-base">{totalSimulatorFrames}</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-500 block">Digit Width:</span>
              <span className="text-emerald-400 font-bold text-base">
                {Math.max(2, String(Math.max(simulatorRows, simulatorColumns)).length)} Digits
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/60">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-300">Total Rows:</span>
                <span className="text-cyan-400 font-mono font-bold">{simulatorRows} rows</span>
              </div>
              <input
                type="range"
                min={1}
                max={32}
                value={simulatorRows}
                onChange={(changeEvent) => setSimulatorRows(Number(changeEvent.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Row padding: {padGridIndex(1, simulatorRows)} through {padGridIndex(simulatorRows, simulatorRows)}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-300">Total Columns:</span>
                <span className="text-cyan-400 font-mono font-bold">{simulatorColumns} cols</span>
              </div>
              <input
                type="range"
                min={1}
                max={32}
                value={simulatorColumns}
                onChange={(changeEvent) => setSimulatorColumns(Number(changeEvent.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Col padding: {padGridIndex(1, simulatorColumns)} through {padGridIndex(simulatorColumns, simulatorColumns)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">First Export File:</span>
                <span className="text-emerald-300 font-bold">{sampleFrameNameFirst}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Final Export File:</span>
                <span className="text-emerald-300 font-bold">{sampleFrameNameLast}</span>
              </div>
            </div>
          </div>

          {/* Visual Grid Simulation */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span>Live Generated Frame Preview ({Math.min(simulatorRows, 6)} × {Math.min(simulatorColumns, 6)} displayed)</span>
              <span className="text-cyan-400 font-mono">1-based zero-pad format</span>
            </div>

            <div
              className="grid gap-2 overflow-auto max-h-72 p-2 bg-slate-900/40 rounded-xl border border-slate-800/50"
              style={{
                gridTemplateColumns: `repeat(${Math.min(simulatorColumns, 8)}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: Math.min(simulatorRows, 6) }).map((_, rowIndex) =>
                Array.from({ length: Math.min(simulatorColumns, 8) }).map((__, columnIndex) => {
                  const frameName = buildFrameFileName(
                    rowIndex,
                    columnIndex,
                    simulatorRows,
                    simulatorColumns
                  );
                  return (
                    <div
                      key={`preview_${rowIndex}_${columnIndex}`}
                      className="group relative aspect-square bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500 rounded-lg p-1.5 flex flex-col justify-between transition-colors text-[10px]"
                      title={frameName}
                    >
                      <span className="text-[9px] text-cyan-400 font-mono">
                        R{padGridIndex(rowIndex + 1, simulatorRows)}
                      </span>
                      <span className="text-[9px] text-slate-300 font-mono truncate">
                        C{padGridIndex(columnIndex + 1, simulatorColumns)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-3 font-mono">
              Standardized format: frame_row{padGridIndex(1, simulatorRows)}_col{padGridIndex(1, simulatorColumns)}.png
            </p>
          </div>
        </div>
      </section>

      {/* Core Architectural Features */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Engine Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Designed for Modern Game Developers
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From smart alpha detection to secure team workflows, SliceForge
            covers the full sprite extraction lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition-all space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 text-2xl">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-100">Smart Grid Auto-Fit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input target columns and rows, and the assistant computes sub-pixel frame
              widths and heights while subtracting custom margins and spacings.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-100">Zero-Padded ZIPs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exports frames numbered dynamically according to grid width, ensuring file
              browsers and game engines order animation sequences seamlessly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl transition-all space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 text-2xl">
              👁️
            </div>
            <h3 className="text-lg font-bold text-slate-100">Interactive Canvas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect your grid with high-visibility overlays. Click any thumbnail to
              exclude empty cells or damaged graphics from the exported archive.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all space-y-3 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 text-2xl">
              🔐
            </div>
            <h3 className="text-lg font-bold text-slate-100">Secure Cloud Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade cloud infrastructure providing reliable session security,
              automated notifications, and seamless inquiry routing.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Technical Usage Guide */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Interactive Documentation
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Technical Usage & Slicing Workflow
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Click through each pipeline phase to understand the underlying mathematics and
            export execution flow.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-800 pb-4">
          {[
            { step: 1, title: "1. Ingestion", icon: "📥" },
            { step: 2, title: "2. Detection", icon: "📐" },
            { step: 3, title: "3. Visual Canvas", icon: "👁️" },
            { step: 4, title: "4. ZIP Export", icon: "📦" },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveTechnicalStep(item.step)}
              className={`p-3 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTechnicalStep === item.step
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Tab Detail Cards */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-6 md:p-8 rounded-2xl">
          {activeTechnicalStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📥 Step 1: Sprite Sheet Ingestion & Offscreen Decoding
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Drag and drop any PNG, JPG, or WebP texture atlas up to 25MB. The browser
                reads the file through a hardware-accelerated offscreen pipeline and parses
                natural pixel dimensions without downscaling or blurring transparent alpha channels.
              </p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                // Pipeline contract:<br />
                FileReader.readAsDataURL(selectedFile) → HTMLImageElement(naturalWidth, naturalHeight)
              </div>
            </div>
          )}

          {activeTechnicalStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📐 Step 2: Content-Aware Alpha Detection or Grid Calculation
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose between instant pixel alpha scanning (zero margins, zero spacing) or uniform
                grid slicing with custom columns, rows, margins, and gaps:
              </p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
                calculatedFrameWidth = Math.floor((imageWidth - marginX - (cols - 1) * spacingX) / cols)
              </div>
              <p className="text-xs text-slate-400">
                In Content-Aware mode, pixels with alpha &gt; 15 are grouped into discrete sprite islands automatically.
              </p>
            </div>
          )}

          {activeTechnicalStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                👁️ Step 3: Interactive Visual Canvas & Granular Frame Exclusion
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Inspect your sprite sheet on the interactive canvas. Sliced frames are
                rendered in a live thumbnail gallery where any frame can be toggled to
                exclude empty borders or corrupted sprites from your production archive.
              </p>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-emerald-400">✓ Green check: Included in export</span>
                <span className="text-red-400">× Red mark: Excluded from download</span>
              </div>
            </div>
          )}

          {activeTechnicalStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📦 Step 4: Zero-Padded Export & Metadata JSON
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Package your selected frames using the dynamic naming format
                <code className="text-emerald-400 font-mono ml-1">frame_row{`{R}`}_col{`{C}`}.png</code>.
                In addition, a comprehensive <code className="text-cyan-400 font-mono">sprites_metadata.json</code> file
                is generated recording origin coordinates, frame widths, heights, and global sheet metrics.
              </p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                Archive output: <br />
                ├── frame_row01_col01.png <br />
                ├── frame_row01_col02.png <br />
                └── sprites_metadata.json (originX, originY, width, height)
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="text-center rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-800/40 p-10 space-y-4 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white">
          {currentUser ? `Welcome back, ${currentUser.name}!` : "Ready to Slice Your Sprite Sheets?"}
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          {currentUser
            ? "Your cloud session is active. Jump directly into the engine workspace to slice and export frames."
            : "Start slicing instantly in the App Engine workspace or create an account to sync preferences across devices."}
        </p>
        <div className="pt-2">
          <Link
            to="/engine"
            className="inline-block rounded-xl bg-cyan-500 hover:bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/30 transition-all hover:scale-105"
          >
            {currentUser ? "Go to Workspace 🚀" : "Open Engine Workspace 🚀"}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
