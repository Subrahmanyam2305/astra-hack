"use client";

import type { MoleculeAnalysis } from "@/lib/types";

interface Props {
  analysis: MoleculeAnalysis | null;
  onReset: () => void;
}

export default function AnalysisPanel({ analysis, onReset }: Props) {
  if (!analysis) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-full flex flex-col items-center justify-center text-gray-500">
        <p>No analysis available</p>
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-full overflow-y-auto flex flex-col gap-4">
      <h3 className="text-lg font-bold text-emerald-400">Interaction Analysis</h3>

      <p className="text-sm text-gray-300">{analysis.summary}</p>

      <div className="grid grid-cols-1 gap-3">
        <InfoCard label="Protein" value={analysis.proteinName} sub={analysis.proteinFunction} color="emerald" />
        <InfoCard label="Drug" value={analysis.drugName} sub={analysis.drugMechanism} color="cyan" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Binding Site" value={analysis.bindingSite} />
        <Stat label="Affinity" value={analysis.bindingAffinity} />
      </div>

      {analysis.interactions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">
            Key Interactions
          </h4>
          <ul className="space-y-1">
            {analysis.interactions.map((item, i) => (
              <li
                key={i}
                className="text-sm text-emerald-300 flex items-start gap-2"
              >
                <span className="text-emerald-500 mt-0.5">&#9679;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.clinicalRelevance && (
        <div className="px-3 py-2 rounded-lg border text-sm text-cyan-400 bg-cyan-500/10 border-cyan-500/30">
          <span className="font-medium">Clinical: </span>
          {analysis.clinicalRelevance}
        </div>
      )}

      {analysis.suggestedModifications.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">
            Suggested Modifications
          </h4>
          <ul className="space-y-1">
            {analysis.suggestedModifications.map((mod, i) => (
              <li
                key={i}
                className="text-sm text-amber-300 flex items-start gap-2"
              >
                <span className="text-amber-500 mt-0.5">&#9679;</span>
                {mod}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-4">
        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          Analyze Another Pair
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "emerald" | "cyan";
}) {
  const borderColor = color === "emerald" ? "border-emerald-500/30" : "border-cyan-500/30";
  const labelColor = color === "emerald" ? "text-emerald-400" : "text-cyan-400";
  return (
    <div className={`bg-gray-800/50 rounded-lg p-3 border-l-2 ${borderColor}`}>
      <div className={`text-xs font-medium ${labelColor}`}>{label}</div>
      <div className="text-sm font-semibold text-gray-200">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-200">{value}</div>
    </div>
  );
}
