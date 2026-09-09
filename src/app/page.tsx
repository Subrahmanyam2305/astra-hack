"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import AnalysisPanel from "@/components/AnalysisPanel";
import Header from "@/components/Header";
import type { AppState } from "@/lib/types";

const MolViewer = dynamic(() => import("@/components/MolViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-500">
      Loading 3D viewer...
    </div>
  ),
});

const EXAMPLES = [
  { protein: "6LU7", drug: "Nirmatrelvir", label: "SARS-CoV-2 Protease + Paxlovid" },
  { protein: "1HWI", drug: "Imatinib", label: "Abl Kinase + Gleevec" },
  { protein: "4HJO", drug: "Trastuzumab", label: "HER2 + Herceptin" },
  { protein: "5HT1", drug: "Sumatriptan", label: "Serotonin Receptor + Imitrex" },
  { protein: "3EML", drug: "Erlotinib", label: "EGFR + Tarceva" },
  { protein: "2HYY", drug: "Oseltamivir", label: "Neuraminidase + Tamiflu" },
];

export default function Home() {
  const [state, setState] = useState<AppState>({
    step: "input",
    proteinPdb: null,
    drugSdf: null,
    proteinId: "",
    drugQuery: "",
    analysis: null,
    isLoading: false,
    error: null,
  });

  const handleVisualize = useCallback(async () => {
    if (!state.proteinId.trim()) {
      setState((s) => ({ ...s, error: "Please enter a PDB ID." }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null, step: "loading" }));

    try {
      const [molRes, analysisRes] = await Promise.all([
        fetch("/api/fetch-molecules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proteinId: state.proteinId,
            drugQuery: state.drugQuery,
          }),
        }),
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proteinId: state.proteinId,
            drugQuery: state.drugQuery,
          }),
        }),
      ]);

      if (!molRes.ok) {
        const err = await molRes.json();
        throw new Error(err.error || "Failed to fetch molecular data");
      }

      const molData = await molRes.json();

      let analysis = null;
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        analysis = analysisData.analysis;
      }

      setState((s) => ({
        ...s,
        step: "view",
        proteinPdb: molData.proteinPdb,
        drugSdf: molData.drugSdf,
        analysis,
        isLoading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step: "input",
        isLoading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
      }));
    }
  }, [state.proteinId, state.drugQuery]);

  const handleReset = useCallback(() => {
    setState({
      step: "input",
      proteinPdb: null,
      drugSdf: null,
      proteinId: "",
      drugQuery: "",
      analysis: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const fillExample = useCallback((protein: string, drug: string) => {
    setState((s) => ({ ...s, proteinId: protein, drugQuery: drug }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {state.step === "input" && (
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Visualize Drug-Protein Interactions
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Enter a protein (PDB ID) and a drug name. MolSight fetches the real 3D structure
              and uses GPT-6 Astra to analyze their molecular interaction.
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-2">
                  Protein (PDB ID)
                </label>
                <div className="mol-input rounded-xl border border-gray-700 bg-gray-800/50 transition-all">
                  <input
                    type="text"
                    value={state.proteinId}
                    onChange={(e) =>
                      setState((s) => ({ ...s, proteinId: e.target.value.toUpperCase(), error: null }))
                    }
                    placeholder="e.g. 6LU7"
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 outline-none text-lg font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Find IDs at{" "}
                  <a
                    href="https://www.rcsb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:underline"
                  >
                    rcsb.org
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-2">
                  Drug Name
                </label>
                <div className="mol-input rounded-xl border border-gray-700 bg-gray-800/50 transition-all">
                  <input
                    type="text"
                    value={state.drugQuery}
                    onChange={(e) =>
                      setState((s) => ({ ...s, drugQuery: e.target.value, error: null }))
                    }
                    placeholder="e.g. Nirmatrelvir"
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Generic drug name or compound name
                </p>
              </div>
            </div>

            {state.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                {state.error}
              </div>
            )}

            <button
              onClick={handleVisualize}
              disabled={!state.proteinId.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              Visualize Interaction
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">
              Try an example
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.protein}
                  onClick={() => fillExample(ex.protein, ex.drug)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-left hover:border-emerald-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="text-xs font-mono text-emerald-400 group-hover:text-emerald-300">
                    {ex.protein}
                  </div>
                  <div className="text-sm text-gray-300 mt-0.5">{ex.label}</div>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {state.step === "loading" && (
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-cyan-500/30 rounded-full" />
              <div className="absolute inset-2 border-4 border-cyan-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Loading Molecular Data...</h2>
            <p className="text-gray-400">
              Fetching protein structure from RCSB PDB
              {state.drugQuery && " and drug from PubChem"}
              <br />
              GPT-6 Astra is analyzing the interaction.
            </p>
          </div>
        </main>
      )}

      {state.step === "view" && state.proteinPdb && (
        <main className="flex flex-col lg:flex-row gap-4 p-4 overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-800 viewer-panel relative">
            <MolViewer
              proteinPdb={state.proteinPdb}
              drugSdf={state.drugSdf}
            />
          </div>
          <div className="lg:w-96 shrink-0 overflow-y-auto">
            <AnalysisPanel analysis={state.analysis} onReset={handleReset} />
          </div>
        </main>
      )}
    </div>
  );
}
