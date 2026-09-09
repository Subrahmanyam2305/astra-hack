"use client";

export default function Header() {
  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          MS
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">MolSight</h1>
          <p className="text-xs text-gray-500">Powered by GPT-6 Astra</p>
        </div>
      </div>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        Hackathon 2026
      </a>
    </header>
  );
}
