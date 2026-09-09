import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are MolSight, an AI expert in structural biology and pharmacology. You analyze protein-drug interactions.

Given a protein PDB ID and a drug name, provide a detailed analysis of their interaction. You MUST return ONLY valid JSON (no markdown, no code fences) in this format:
{
  "proteinName": "full protein name",
  "proteinFunction": "brief description of protein's biological role",
  "drugName": "drug name (generic)",
  "drugMechanism": "how the drug works at molecular level",
  "bindingSite": "where the drug binds on the protein (e.g. active site, allosteric pocket)",
  "bindingAffinity": "known or estimated binding affinity (Ki, IC50, or qualitative)",
  "interactions": [
    "specific molecular interactions like hydrogen bonds, hydrophobic contacts, pi-stacking, etc."
  ],
  "clinicalRelevance": "what disease/condition this targets and clinical significance",
  "suggestedModifications": [
    "potential drug modifications that could improve binding or reduce side effects"
  ],
  "summary": "2-3 sentence overview of the protein-drug interaction"
}

If the protein-drug pair is well-known, provide specific details. If not well-characterized, provide your best scientific analysis based on the protein structure and drug chemistry.

Be scientifically rigorous but accessible. Include specific residue numbers where possible.`;

export async function POST(request: NextRequest) {
  try {
    const { proteinId, drugQuery } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-6-astra",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the interaction between protein PDB ID "${proteinId}" and the drug "${drugQuery || "unknown"}". Provide a detailed molecular interaction analysis. Return ONLY valid JSON.`,
          },
        ],
        max_completion_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `API returned ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(cleaned);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
