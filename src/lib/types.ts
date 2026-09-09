export interface MoleculeAnalysis {
  proteinName: string;
  proteinFunction: string;
  drugName: string;
  drugMechanism: string;
  bindingSite: string;
  bindingAffinity: string;
  interactions: string[];
  clinicalRelevance: string;
  suggestedModifications: string[];
  summary: string;
}

export interface AppState {
  step: "input" | "loading" | "view";
  proteinPdb: string | null;
  drugSdf: string | null;
  proteinId: string;
  drugQuery: string;
  analysis: MoleculeAnalysis | null;
  isLoading: boolean;
  error: string | null;
}
