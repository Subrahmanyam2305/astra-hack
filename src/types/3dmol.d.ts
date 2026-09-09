/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace $3Dmol {
  interface GLViewer {
    addModel(data: string, format: string): any;
    setStyle(sel: any, style: any): void;
    addSurface(type: any, style: any, sel?: any): void;
    removeAllSurfaces(): void;
    zoomTo(sel?: any): void;
    render(): void;
    spin(axis: string | boolean, speed?: number): void;
    clear(): void;
    setBackgroundColor(color: string): void;
  }

  function createViewer(element: HTMLElement, config?: any): GLViewer;

  const SurfaceType: { VDW: number; SAS: number; SES: number; MS: number };
}
