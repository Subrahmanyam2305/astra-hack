"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  proteinPdb: string;
  drugSdf: string | null;
}

type ViewStyle = "cartoon" | "stick" | "surface" | "sphere";

export default function MolViewer({ proteinPdb, drugSdf }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<$3Dmol.GLViewer | null>(null);
  const [style, setStyle] = useState<ViewStyle>("cartoon");
  const [showDrug, setShowDrug] = useState(true);
  const [showSurface, setShowSurface] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if ((window as Record<string, unknown>).$3Dmol) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://3Dmol.org/build/3Dmol-min.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const initViewer = useCallback(() => {
    if (!loaded || !containerRef.current || !dims) return;
    const $3Dmol = (window as unknown as Record<string, unknown>).$3Dmol as typeof import("3dmol");
    if (!$3Dmol) return;

    if (viewerRef.current) {
      viewerRef.current.clear();
      viewerRef.current = null;
    }
    containerRef.current.innerHTML = "";

    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: "0x0a0a0a",
      antialias: true,
    });
    viewerRef.current = viewer;

    viewer.addModel(proteinPdb, "pdb");
    applyProteinStyle(viewer, style);

    if (drugSdf) {
      viewer.addModel(drugSdf, "sdf");
      viewer.setStyle(
        { model: 1 },
        { stick: { colorscheme: "greenCarbon", radius: 0.15 } }
      );
    }

    viewer.zoomTo();
    viewer.render();
    viewer.spin("y", 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, dims, proteinPdb, drugSdf]);

  useEffect(() => { initViewer(); }, [initViewer]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !loaded) return;
    applyProteinStyle(viewer, style);
    viewer.render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !loaded) return;
    viewer.removeAllSurfaces();
    if (showSurface) {
      viewer.addSurface(
        (window as unknown as Record<string, { SurfaceType: { VDW: number } }>).$3Dmol?.SurfaceType?.VDW ?? 1,
        { opacity: 0.7, color: "white", model: 0 } as Record<string, unknown>,
        { model: 0 }
      );
    }
    viewer.render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSurface]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !loaded || !drugSdf) return;
    viewer.setStyle(
      { model: 1 },
      showDrug ? { stick: { colorscheme: "greenCarbon", radius: 0.15 } } : {}
    );
    viewer.render();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDrug]);

  return (
    <div ref={wrapperRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
        {(["cartoon", "stick", "sphere"] as ViewStyle[]).map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              style === s
                ? "bg-emerald-600 text-white"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80"
            } backdrop-blur-sm capitalize`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setShowSurface(!showSurface)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showSurface
              ? "bg-emerald-600 text-white"
              : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80"
          } backdrop-blur-sm`}
        >
          Surface
        </button>
        {drugSdf && (
          <button
            onClick={() => setShowDrug(!showDrug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showDrug
                ? "bg-cyan-600 text-white"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80"
            } backdrop-blur-sm`}
          >
            Drug
          </button>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={() => viewerRef.current?.spin("y", 0.5)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"
        >
          Spin
        </button>
        <button
          onClick={() => viewerRef.current?.spin(false as never)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"
        >
          Stop
        </button>
        <button
          onClick={() => { viewerRef.current?.zoomTo(); viewerRef.current?.render(); }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 backdrop-blur-sm"
        >
          Reset
        </button>
      </div>

      {dims && (
        <div
          ref={containerRef}
          style={{ width: dims.w, height: dims.h }}
        />
      )}

      <div className="absolute bottom-3 left-3 text-xs text-gray-500">
        Drag to rotate · Scroll to zoom · Right-click to translate
      </div>
    </div>
  );
}

function applyProteinStyle(viewer: $3Dmol.GLViewer, style: ViewStyle) {
  switch (style) {
    case "cartoon":
      viewer.setStyle({ model: 0 }, { cartoon: { color: "spectrum" } });
      break;
    case "stick":
      viewer.setStyle({ model: 0 }, { stick: { colorscheme: "Jmol", radius: 0.1 } });
      break;
    case "sphere":
      viewer.setStyle({ model: 0 }, { sphere: { colorscheme: "Jmol", scale: 0.3 } });
      break;
    case "surface":
      viewer.setStyle({ model: 0 }, { cartoon: { color: "spectrum" } });
      break;
  }
}
