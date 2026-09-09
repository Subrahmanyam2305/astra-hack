import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { proteinId, drugQuery } = await request.json();

    if (!proteinId) {
      return NextResponse.json(
        { error: "Protein PDB ID is required" },
        { status: 400 }
      );
    }

    const pdbRes = await fetch(
      `https://files.rcsb.org/download/${proteinId.toUpperCase()}.pdb`
    );
    if (!pdbRes.ok) {
      return NextResponse.json(
        { error: `Could not find protein with PDB ID: ${proteinId}` },
        { status: 404 }
      );
    }
    const proteinPdb = await pdbRes.text();

    let drugSdf: string | null = null;

    if (drugQuery && drugQuery.trim()) {
      try {
        const searchRes = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(drugQuery)}/SDF?record_type=3d`
        );
        if (searchRes.ok) {
          drugSdf = await searchRes.text();
        } else {
          const cidRes = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(drugQuery)}/SDF`
          );
          if (cidRes.ok) {
            drugSdf = await cidRes.text();
          }
        }
      } catch {
        // Drug fetch failed, proceed without it
      }
    }

    return NextResponse.json({
      proteinPdb,
      drugSdf,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch molecular data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
