/* ==========================================================================
   PrismaCoder — page data
   Every number and quoted item on the page lives here, with its source in
   the paper noted per block. Update here, never inline in the HTML.
   ========================================================================== */
window.PrismaData = {

  /* ---------------------------------------------------------------- forge
     The pipeline map follows paper Figure 2 (three bands); the worked
     example is Appendix C's Web UI reconstruction (Fig. 9, Table 5). */
  forge: {
    bands: [
      { id: "cur", name: "Data curation: the rubric as filter", color: "109, 138, 190", nodes: [
        { id: "curate", col: 1, name: "Curation model", note: "completion, replenishment", icon: "curate", step: "3" },
        { id: "exec", col: 2, name: "Execution", note: "failures to a repair pool", icon: "execute", step: "3" },
        { id: "judge", col: 3, name: "Judge", note: "code score, visual score", icon: "judge", step: "4" },
        { id: "route", col: 4, name: "Routing", note: "discard, re-synthesize, retain", icon: "route", step: "5" },
        { id: "data", col: 5, name: "PrismaCoder-2M", note: "curated training data", icon: "data", step: "5" }
      ] },
      { id: "rub", name: "Rubric synthesis", color: "142, 106, 168", nodes: [
        { id: "instr", col: 1, name: "Instruction", note: "text-centric or vision-centric", icon: "instruction", step: "1" },
        { id: "gen", col: 2, name: "Rubric generator", note: "criteria and weights, by difficulty", icon: "generator", step: "2" },
        { id: "rubric", col: 3, span: 3, name: "Rubric", note: "code and visual criteria, domain-shared and sample-specific", icon: "rubric", step: "2 4 7", wide: true }
      ] },
      { id: "rl", name: "Reinforcement learning: the rubric as reward", color: "215, 140, 110", nodes: [
        { id: "policy", col: 1, name: "Policy", note: "K rollouts", icon: "policy", step: "6" },
        { id: "exec2", col: 2, name: "Execution", note: "failed render, reward 0", icon: "execute", step: "6" },
        { id: "judge2", col: 3, name: "Judge", note: "the same rubric", icon: "judge", step: "7" },
        { id: "adv", col: 4, name: "Advantage", note: "group-relative", icon: "advantage", step: "8" },
        { id: "update", col: 5, name: "Policy update", note: "", icon: "update", step: "8" }
      ] }
    ],
    wires: [
      { from: "curate", to: "exec", steps: [3] },
      { from: "exec", to: "judge", steps: [3, 4] },
      { from: "judge", to: "route", steps: [4, 5] },
      { from: "route", to: "data", steps: [5], label: "high: retain" },
      { from: "route", to: "curate", route: "loop", fromSide: "top", toSide: "top", steps: [5], label: "mid: re-synthesize", dashed: true },
      { from: "instr", to: "gen", steps: [2] },
      { from: "gen", to: "rubric", steps: [2] },
      { from: "instr", to: "curate", route: "up", fromSide: "top", toSide: "bottom", steps: [1, 3] },
      { from: "instr", to: "policy", route: "down", fromSide: "bottom", toSide: "top", steps: [6] },
      { from: "rubric", to: "judge", route: "up", fromSide: "top", toSide: "bottom", steps: [4], label: "same rubric" },
      { from: "rubric", to: "judge2", route: "down", fromSide: "bottom", toSide: "top", steps: [7], label: "same rubric" },
      { from: "policy", to: "exec2", steps: [6] },
      { from: "exec2", to: "judge2", steps: [6, 7] },
      { from: "judge2", to: "adv", steps: [7, 8] },
      { from: "adv", to: "update", steps: [8] }
    ],
    steps: [
      { kind: "instruction", title: "A seed becomes an instruction",
        note: "Seeds from plotting corpora, research figures, repositories, web pages, interactive demos and chemical structures are turned into self-contained tasks, text-centric or vision-centric." },
      { kind: "rubric", title: "A rubric is written for it",
        note: "Reusable domain-level checks plus requirements specific to this instruction, each a yes/no criterion with a weight; the number of criteria follows the estimated difficulty." },
      { kind: "candidate", title: "A candidate is generated and executed",
        note: "A curation model completes or replenishes the sample. The format's gatekeeper executes and renders it; a candidate that fails goes to a repair pool." },
      { kind: "judge", title: "The judge scores code and render separately",
        note: "Code-level criteria are checked on the program, visual-level criteria on the render. Each modality's weighted pass rate is a score, and the two are combined into S." },
      { kind: "routing", title: "Routing by two thresholds",
        note: "Below τ₁ the sample is discarded; between τ₁ and τ₂ it is re-synthesized with the failed criteria as feedback; above τ₂ it enters PrismaCoder-2M." },
      { kind: "rollouts", title: "The policy rolls out",
        note: "For each held-out instruction the policy samples K rollouts. A rollout that fails to execute or render receives reward 0." },
      { kind: "reward", title: "The same rubric scores each rollout",
        note: "Every rollout that executes is scored by the rubric written for its instruction, code and render apart, and the combined score is its reward. The reward is dense, and it tells the rollouts of one group apart." },
      { kind: "advantage", title: "Rollouts are compared within their group",
        note: "Each rollout's reward is measured against the others for the same instruction, and the policy moves toward the ones that scored higher. RL instructions are chosen where the policy sometimes succeeds and sometimes fails, so every group has something to compare." }
    ],
    /* Appendix C: the Web UI reconstruction example (Fig. 9, Table 5), the rubric
       dimension lists of the code-rubric prompt (Fig. 7), K and the per-family
       reward weights from the training details and Table 6. The paper prints no
       instruction text, no numeric thresholds and no overall S for the example. */
    example: {
      "task": "Web UI reconstruction",
      "input": "vision-centric: the input is a reference screenshot; the target is HTML/CSS that reproduces it",
      "reference": "public/forge/example_reference.webp",
      "candidate": "public/forge/example_candidate.webp",
      "dimensions": {
        "code": {
          "shared": ["Screenshot faithfulness", "Render safety and structural integrity", "Placeholder image handling"],
          "specific": ["Layout mapping and section structure", "Content element coverage", "Self-contained implementation"]
        },
        "visual": {
          "shared": ["Screenshot faithfulness", "Visual integrity", "Text legibility"],
          "specific": ["Layout structure and alignment", "Content element coverage", "Placeholder image normality"]
        }
      },
      "weightBands": [
        [
          "critical",
          "0.8–1.0"
        ],
        [
          "important",
          "0.4–0.7"
        ],
        [
          "minor",
          "0.1–0.3"
        ]
      ],
      "rubric": [
        {
          "level": "code",
          "text": "The three Product blocks use a teal-like background.",
          "weight": 0.8,
          "pass": true,
          "evidence": "The buttons explicitly use background-color: #008080."
        },
        {
          "level": "code",
          "text": "The three Product items are stacked vertically.",
          "weight": 0.8,
          "pass": true,
          "evidence": "The shared button class uses display: block."
        },
        {
          "level": "code",
          "text": "The “Technology Company” heading is horizontally centered.",
          "weight": 0.8,
          "pass": true,
          "evidence": "The header uses text-align: center."
        },
        {
          "level": "code",
          "text": "The footer containing the copyright text has a dark background.",
          "weight": 0.7,
          "pass": true,
          "evidence": "The footer explicitly uses background-color: #333."
        },
        {
          "level": "code",
          "text": "The footer contains the required copyright statement.",
          "weight": 0.9,
          "pass": true,
          "evidence": "The exact statement is present, with &copy; encoding the copyright symbol."
        },
        {
          "level": "visual",
          "text": "The page preserves the centered vertical hierarchy from the main heading through the footer.",
          "weight": 1.0,
          "pass": false,
          "evidence": "The footer overlaps the Services section instead of following it at the bottom."
        },
        {
          "level": "visual",
          "text": "All primary content is horizontally centered without unintended horizontal scrolling.",
          "weight": 0.8,
          "pass": true,
          "evidence": "The content is centered and no horizontal scrollbar is visible."
        },
        {
          "level": "visual",
          "text": "The teal and purple buttons form vertically stacked blocks with rounded corners.",
          "weight": 0.9,
          "pass": false,
          "evidence": "The buttons are stacked, but their corners are sharp rather than rounded."
        },
        {
          "level": "visual",
          "text": "The footer is a dark, full-width bar at the bottom with centered white text.",
          "weight": 0.9,
          "pass": false,
          "evidence": "Although its color and width are correct, the footer is placed over the last service item rather than at the bottom."
        },
        {
          "level": "visual",
          "text": "Exactly three teal Product buttons and three purple Service buttons are visible.",
          "weight": 0.8,
          "pass": false,
          "evidence": "The misplaced footer obscures and clips the third Service button."
        }
      ],
      "scores": {
        "code": 1.0,
        "visual": 0.182
      },
      "holistic": {
        "score": 78,
        "percentile": "78.6%"
      },
      "K": 8,
      "lambdas": [
        [
          "charts",
          "0.5 / 0.5"
        ],
        [
          "web pages",
          "0.4 / 0.6"
        ]
      ]
    }
  },

  /* -------------------------------------------------------------- results
     Tables 2 (vision-centric) and 3 (text-centric), parsed from the paper's
     Tables/main_vision.tex and Tables/main_text.tex. marks: b = best, s = second
     among open models, as printed. headline: one metric per benchmark drawn in
     the range chart. */
  results: {"vision": {"table": {"source": "Tables/main_vision.tex", "columns": [{"group": "ChartMimic", "metric": "Low-Level", "lower": false}, {"group": "ChartMimic", "metric": "High-Level", "lower": false}, {"group": "WebCode2M", "metric": "LLM Score", "lower": false}, {"group": "WebCode2M", "metric": "Visual", "lower": false}, {"group": "WebCode2M", "metric": "CLIP", "lower": false}, {"group": "DesignBench", "metric": "Gen.", "lower": false}, {"group": "DesignBench", "metric": "Edit.", "lower": false}, {"group": "Design2Code", "metric": "LLM Score", "lower": false}, {"group": "Design2Code", "metric": "Visual", "lower": false}, {"group": "InteractSci.", "metric": "VQT", "lower": false}, {"group": "UniSVG", "metric": "ISVGen", "lower": false}, {"group": "ChemDraw", "metric": "Validity", "lower": false}, {"group": "ChemDraw", "metric": "Tani. Sim.", "lower": false}], "rows": [{"model": "Qwen3-VL-8B-Instruct", "group": "open", "ours": false, "values": [65.92, 62.81, 53.67, 73.55, 79.16, 55.12, 8.38, 57.47, 82.81, 34.06, 66.27, 78.91, 54.79], "printed": ["65.92", "62.81", "53.67", "73.55", "79.16", "55.12", "8.38", "57.47", "82.81", "34.06", "66.27", "78.91%", "54.79"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Qwen3-VL-30B-A3B-Instruct", "group": "open", "ours": false, "values": [71.04, 67.3, 54.8, 77.4, 79.42, 51.58, 8.07, 57.94, 85.11, 37.67, 74.3, 82.03, 54.55], "printed": ["71.04", "67.30", "54.80", "77.40", "79.42", "51.58", "8.07", "57.94", "85.11", "37.67", "74.30", "82.03%", "54.55"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Qwen3.5-9B", "group": "open", "ours": false, "values": [58.35, 55.55, 51.74, 81.6, 79.93, 50.73, 8.19, 53.12, 85.6, 27.28, 63.09, 88.28, 66.79], "printed": ["58.35", "55.55", "51.74", "81.60", "79.93", "50.73", "8.19", "53.12", "85.60", "27.28", "63.09", "88.28%", "66.79"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Qwen3.5-35B-A3B", "group": "open", "ours": false, "values": [70.22, 63.9, 65.32, 88.64, 85.94, 64.7, 8.66, 67.49, 90.98, 29.33, 62.91, 92.97, 79.86], "printed": ["70.22", "63.90", "65.32", "88.64", "85.94", "64.70", "8.66", "67.49", "90.98", "29.33", "62.91", "92.97%", "79.86"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "JanusCoderV-7B", "group": "open", "ours": false, "values": [75.12, 68.97, 40.92, 72.9, 76.0, 40.37, 7.44, 36.49, 70.81, 27.67, 61.6, 84.75, 72.81], "printed": ["75.12", "68.97", "40.92", "72.90", "76.00", "40.37", "7.44", "36.49", "70.81", "27.67", "61.60", "84.75%", "72.81"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "JanusCoderV-8B", "group": "open", "ours": false, "values": [76.54, 69.23, 35.17, 65.95, 73.04, 34.3, 7.26, 34.53, 68.61, 33.32, 62.47, 86.1, 76.91], "printed": ["76.54", "69.23", "35.17", "65.95", "73.04", "34.30", "7.26", "34.53", "68.61", "33.32", "62.47", "86.10%", "76.91"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "VinciCoder-7B", "group": "open", "ours": false, "values": [78.3, 66.09, 43.11, 72.42, 78.59, 43.24, 1.4, 42.3, 76.64, 0.0, 85.72, 93.18, 92.15], "printed": ["78.30", "66.09", "43.11", "72.42", "78.59", "43.24", "1.40", "42.30", "76.64", "0.00", "85.72", "93.18%", "92.15"], "marks": [null, null, null, null, null, null, null, null, null, null, "second", null, null]}, {"model": "VinciCoder-8B", "group": "open", "ours": false, "values": [77.59, 66.44, 46.16, 78.26, 80.79, 48.09, 1.71, 45.72, 81.89, 2.33, 87.18, 94.21, 91.02], "printed": ["77.59", "66.44", "46.16", "78.26", "80.79", "48.09", "1.71", "45.72", "81.89", "2.33", "87.18", "94.21%", "91.02"], "marks": [null, null, null, null, null, null, null, null, null, null, "best", null, null]}, {"model": "PrismaCoder-9B", "group": "open", "ours": true, "values": [81.57, 73.82, 69.72, 90.41, 88.46, 69.95, 8.93, 70.51, 91.54, 51.87, 69.64, 96.88, 95.94], "printed": ["81.57", "73.82", "69.72", "90.41", "88.46", "69.95", "8.93", "70.51", "91.54", "51.87", "69.64", "96.88%", "95.94"], "marks": ["second", "second", "best", "best", "best", "best", "best", "best", "best", "second", null, "second", "second"]}, {"model": "PrismaCoder-35B-A3B", "group": "open", "ours": true, "values": [83.42, 80.69, 67.78, 89.66, 87.78, 68.98, 8.89, 67.55, 91.22, 53.54, 84.14, 100.0, 97.56], "printed": ["83.42", "80.69", "67.78", "89.66", "87.78", "68.98", "8.89", "67.55", "91.22", "53.54", "84.14", "100.00%", "97.56"], "marks": ["best", "best", "second", "second", "second", "second", "second", "second", "second", "best", null, "best", "best"]}, {"model": "GPT-4o", "group": "proprietary", "ours": false, "values": [76.38, 72.02, 54.94, 83.45, 80.22, 52.64, 8.89, 58.48, 88.23, 46.01, 70.98, 92.19, 57.8], "printed": ["76.38", "72.02", "54.94", "83.45", "80.22", "52.64", "8.89", "58.48", "88.23", "46.01", "70.98", "92.19%", "57.80"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Gemini 3 Flash", "group": "proprietary", "ours": false, "values": [85.12, 83.04, 69.63, 90.41, 87.34, 69.28, 9.45, 70.12, 92.18, 65.25, 82.24, 63.28, 81.39], "printed": ["85.12", "83.04", "69.63", "90.41", "87.34", "69.28", "9.45", "70.12", "92.18", "65.25", "82.24", "63.28%", "81.39"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Gemini 3.1 Pro", "group": "proprietary", "ours": false, "values": [77.96, 81.73, 70.97, 89.96, 87.64, 69.47, 9.57, 70.9, 90.7, 71.05, 76.85, 93.12, 92.45], "printed": ["77.96", "81.73", "70.97", "89.96", "87.64", "69.47", "9.57", "70.90", "90.70", "71.05", "76.85", "93.12%", "92.45"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Claude Sonnet 4.6", "group": "proprietary", "ours": false, "values": [80.23, 80.73, 68.19, 87.76, 86.8, 66.53, 9.24, 67.99, 90.83, 77.36, 80.38, 88.28, 85.43], "printed": ["80.23", "80.73", "68.19", "87.76", "86.80", "66.53", "9.24", "67.99", "90.83", "77.36", "80.38", "88.28%", "85.43"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}, {"model": "Claude Opus 4.6", "group": "proprietary", "ours": false, "values": [81.11, 79.68, 66.38, 88.25, 87.11, 65.69, 9.55, 66.75, 90.19, 76.25, 78.7, 96.88, 77.71], "printed": ["81.11", "79.68", "66.38", "88.25", "87.11", "65.69", "9.55", "66.75", "90.19", "76.25", "78.70", "96.88%", "77.71"], "marks": [null, null, null, null, null, null, null, null, null, null, null, null, null]}], "footnote": "Best / second among open models."}, "headline": [{"name": "ChartMimic", "metric": "high-level score", "col": 1}, {"name": "WebCode2M", "metric": "judge score", "col": 2}, {"name": "DesignBench", "metric": "generation", "col": 5}, {"name": "Design2Code", "metric": "judge score", "col": 7}, {"name": "InteractScience", "metric": "visual tests (VQT)", "col": 9}, {"name": "UniSVG", "metric": "image to SVG", "col": 10}, {"name": "ChemDraw", "metric": "Tanimoto similarity", "col": 12}]}, "text": {"table": {"source": "Tables/main_text.tex", "columns": [{"group": "ArtifactsBench", "metric": "Overall", "lower": false}, {"group": "PandasPlotBench", "metric": "Incorr. Code", "lower": true}, {"group": "PandasPlotBench", "metric": "Visual", "lower": false}, {"group": "PandasPlotBench", "metric": "Task", "lower": false}, {"group": "InteractSci.", "metric": "PFT", "lower": false}, {"group": "UniSVG", "metric": "TSVGen", "lower": false}, {"group": "VisPlotBench", "metric": "ExecPass", "lower": false}, {"group": "VisPlotBench", "metric": "Mean", "lower": false}, {"group": "VisPlotBench", "metric": "Good ≥75", "lower": false}], "rows": [{"model": "Qwen3-VL-8B-Instruct", "group": "open", "ours": false, "values": [34.71, 16.0, 60.01, 73.67, 15.47, 68.13, 56.52, 40.25, 33.62], "printed": ["34.71", "16.00%", "60.01", "73.67", "15.47%", "68.13", "56.52%", "40.25", "33.62"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Qwen3-VL-30B-A3B-Instruct", "group": "open", "ours": false, "values": [41.7, 11.43, 60.05, 80.58, 24.4, 69.33, 64.38, 49.28, 42.88], "printed": ["41.70", "11.43%", "60.05", "80.58", "24.40%", "69.33", "64.38%", "49.28", "42.88"], "marks": [null, null, null, "best", null, null, null, null, null]}, {"model": "Qwen3.5-9B", "group": "open", "ours": false, "values": [41.24, 24.57, 52.98, 65.47, 22.4, 69.28, 52.22, 41.18, 36.71], "printed": ["41.24", "24.57%", "52.98", "65.47", "22.40%", "69.28", "52.22%", "41.18", "36.71"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Qwen3.5-35B-A3B", "group": "open", "ours": false, "values": [44.98, 15.43, 60.16, 75.17, 26.67, 72.15, 63.01, 51.45, 48.51], "printed": ["44.98", "15.43%", "60.16", "75.17", "26.67%", "72.15", "63.01%", "51.45", "48.51"], "marks": [null, null, null, null, "second", "best", null, null, null]}, {"model": "JanusCoderV-7B", "group": "open", "ours": false, "values": [31.16, 23.43, 53.05, 65.77, 17.73, 66.43, 58.42, 48.1, 32.15], "printed": ["31.16", "23.43%", "53.05", "65.77", "17.73%", "66.43", "58.42%", "48.10", "32.15"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "JanusCoderV-8B", "group": "open", "ours": false, "values": [32.0, 26.3, 56.3, 70.91, 17.6, 62.17, 56.21, 47.22, 30.87], "printed": ["32.00", "26.30%", "56.30", "70.91", "17.60%", "62.17", "56.21%", "47.22", "30.87"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "VinciCoder-7B", "group": "open", "ours": false, "values": [11.35, 9.14, 25.37, 51.57, 0.4, 64.06, 64.1, 23.95, 10.11], "printed": ["11.35", "9.14%", "25.37", "51.57", "0.40%", "64.06", "64.10%", "23.95", "10.11"], "marks": [null, "best", null, null, null, null, null, null, null]}, {"model": "VinciCoder-8B", "group": "open", "ours": false, "values": [11.97, 12.0, 25.47, 60.79, 0.54, 63.45, 63.92, 12.55, 2.8], "printed": ["11.97", "12.00%", "25.47", "60.79", "0.54%", "63.45", "63.92%", "12.55", "2.80"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "VisCoder2-7B", "group": "open", "ours": false, "values": [17.51, 20.0, 59.48, 67.59, 1.0, 65.44, 66.73, 49.84, 42.5], "printed": ["17.51", "20.00%", "59.48", "67.59", "1.00%", "65.44", "66.73%", "49.84", "42.50"], "marks": [null, null, null, null, null, null, "second", null, null]}, {"model": "PrismaCoder-9B", "group": "open", "ours": true, "values": [45.28, 10.29, 60.54, 77.94, 24.8, 68.49, 65.3, 53.99, 52.62], "printed": ["45.28", "10.29%", "60.54", "77.94", "24.80%", "68.49", "65.30%", "53.99", "52.62"], "marks": ["second", null, "second", null, null, null, null, "second", "second"]}, {"model": "PrismaCoder-35B-A3B", "group": "open", "ours": true, "values": [46.01, 9.29, 62.38, 79.85, 28.0, 70.72, 71.14, 62.47, 61.49], "printed": ["46.01", "9.29%", "62.38", "79.85", "28.00%", "70.72", "71.14%", "62.47", "61.49"], "marks": ["best", "second", "best", "second", "best", "second", "best", "best", "best"]}, {"model": "GPT-4o", "group": "proprietary", "ours": false, "values": [33.54, 8.0, 67.63, 82.46, 31.07, 72.8, 67.99, 56.01, 52.75], "printed": ["33.54", "8.00%", "67.63", "82.46", "31.07%", "72.80", "67.99%", "56.01", "52.75"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Gemini 3 Flash", "group": "proprietary", "ours": false, "values": [51.42, 3.43, 69.95, 91.21, 28.13, 74.64, 76.25, 60.92, 58.54], "printed": ["51.42", "3.43%", "69.95", "91.21", "28.13%", "74.64", "76.25%", "60.92", "58.54"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Gemini 3.1 Pro", "group": "proprietary", "ours": false, "values": [53.04, 1.71, 78.41, 94.7, 44.13, 74.52, 79.57, 69.47, 69.15], "printed": ["53.04", "1.71%", "78.41", "94.70", "44.13%", "74.52", "79.57%", "69.47", "69.15"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Claude Sonnet 4.6", "group": "proprietary", "ours": false, "values": [64.65, 3.43, 74.59, 91.93, 37.33, 74.93, 73.0, 62.2, 61.06], "printed": ["64.65", "3.43%", "74.59", "91.93", "37.33%", "74.93", "73.00%", "62.20", "61.06"], "marks": [null, null, null, null, null, null, null, null, null]}, {"model": "Claude Opus 4.6", "group": "proprietary", "ours": false, "values": [62.47, 1.71, 76.03, 94.97, 35.47, 75.47, 73.09, 65.94, 66.03], "printed": ["62.47", "1.71%", "76.03", "94.97", "35.47%", "75.47", "73.09%", "65.94", "66.03"], "marks": [null, null, null, null, null, null, null, null, null]}], "footnote": "Best / second among open models."}, "headline": [{"name": "ArtifactsBench", "metric": "overall score", "col": 0}, {"name": "PandasPlotBench", "metric": "visual score", "col": 2}, {"name": "InteractScience", "metric": "program tests (PFT)", "col": 4}, {"name": "UniSVG", "metric": "text to SVG", "col": 5}, {"name": "VisPlotBench", "metric": "mean score", "col": 7}]}},
  settings: {
      "models": "PrismaCoder-9B and PrismaCoder-35B-A3B are post-trained from Qwen3.5-9B and Qwen3.5-35B-A3B.",
      "pipeline": "Data synthesis used frontier models: Claude Opus 4.6 as the curation model, Gemini 3 Pro as the rubric generator, and Gemini 3 Flash as the judge for data gating and RL.",
      "evaluation": "Evaluation follows each benchmark's official protocol, including its designated judge where one is specified; deterministic metrics are reported alongside judge scores."
  },

  /* ------------------------------------------------------------- analysis
     Fig. 4 (Tables/judge_ablation.tex: SFT on equal-size subsets filtered by a
     direct judge vs by the PrismaForge rubric), Fig. 5 (per-stage gains on two
     other backbones; DesignBench Edit is on a 0-10 scale, its gains x10 in the
     paper figure, here raw), Fig. 6 / Table 19 (human study, n = 100). */
  analysis: {"filter": {"train": "Qwen3.5-9B", "metric": "LLM score", "rows": [{"benchmark": "ChartMimic", "lens": "vision", "direct": 75.1675, "rubric": 76.5886}, {"benchmark": "DesignBench", "lens": "vision", "direct": 65.31, "rubric": 67.76}, {"benchmark": "WebCode2M", "lens": "vision", "direct": 67.13, "rubric": 68.46}, {"benchmark": "Design2Code", "lens": "vision", "direct": 67.97, "rubric": 68.22}, {"benchmark": "Python", "lens": "text", "direct": 62.5, "rubric": 66.6}, {"benchmark": "Mermaid", "lens": "text", "direct": 72.7, "rubric": 75.4}, {"benchmark": "Vega-Lite", "lens": "text", "direct": 48.5, "rubric": 72.6}, {"benchmark": "Asymptote", "lens": "text", "direct": 30.0, "rubric": 35.1}]}, "backbones": {"Gemma-4-31B-it": [{"benchmark": "ChartMimic", "metric": "Overall", "lens": "vision", "base": 77.9486, "sft": 81.94415, "sft_rl": 83.8972, "gain_sft": 3.9955, "gain_rl": 1.9531, "scaled": false}, {"benchmark": "WebCode2M", "metric": "LLM Score", "lens": "vision", "base": 64.26, "sft": 63.6, "sft_rl": 67.13, "gain_sft": -0.66, "gain_rl": 3.53, "scaled": false}, {"benchmark": "WebCode2M", "metric": "Visual", "lens": "vision", "base": 85.81, "sft": 86.4, "sft_rl": 87.95, "gain_sft": 0.59, "gain_rl": 1.55, "scaled": false}, {"benchmark": "WebCode2M", "metric": "CLIP", "lens": "vision", "base": 85.02, "sft": 85.9, "sft_rl": 87.29, "gain_sft": 0.88, "gain_rl": 1.39, "scaled": false}, {"benchmark": "DesignBench", "metric": "Gen.", "lens": "vision", "base": 63.61, "sft": 63.92, "sft_rl": 67.36, "gain_sft": 0.31, "gain_rl": 3.44, "scaled": false}, {"benchmark": "DesignBench", "metric": "Edit.", "lens": "vision", "base": 9.26, "sft": 8.94, "sft_rl": 9.66, "gain_sft": -3.2, "gain_rl": 7.2, "scaled": false}, {"benchmark": "Design2Code", "metric": "LLM Score", "lens": "vision", "base": 67.82, "sft": 66.2, "sft_rl": 68.92, "gain_sft": -1.62, "gain_rl": 2.72, "scaled": false}, {"benchmark": "Design2Code", "metric": "Visual", "lens": "vision", "base": 89.43, "sft": 89.72, "sft_rl": 91.24, "gain_sft": 0.29, "gain_rl": 1.52, "scaled": false}, {"benchmark": "VisPlotBench (Python)", "metric": "Visual", "lens": "text", "base": 69.4, "sft": 73.3, "sft_rl": 75.0, "gain_sft": 3.9, "gain_rl": 1.7, "scaled": false}, {"benchmark": "VisPlotBench (Python)", "metric": "Task", "lens": "text", "base": 87.2, "sft": 89.5, "sft_rl": 91.0, "gain_sft": 2.3, "gain_rl": 1.5, "scaled": false}, {"benchmark": "VisPlotBench (HTML)", "metric": "Visual", "lens": "text", "base": 46.6, "sft": 55.6, "sft_rl": 64.5, "gain_sft": 9.0, "gain_rl": 8.9, "scaled": false}, {"benchmark": "VisPlotBench (HTML)", "metric": "Task", "lens": "text", "base": 78.8, "sft": 76.2, "sft_rl": 84.0, "gain_sft": -2.6, "gain_rl": 7.8, "scaled": false}], "Qwen3-VL-30B-A3B-Instruct": [{"benchmark": "ChartMimic", "metric": "Overall", "lens": "vision", "base": 69.17, "sft": 77.25, "sft_rl": 81.03, "gain_sft": 8.08, "gain_rl": 3.78, "scaled": false}, {"benchmark": "WebCode2M", "metric": "LLM Score", "lens": "vision", "base": 54.8, "sft": 58.12, "sft_rl": 59.56, "gain_sft": 3.32, "gain_rl": 1.44, "scaled": false}, {"benchmark": "WebCode2M", "metric": "Visual", "lens": "vision", "base": 77.4, "sft": 77.22, "sft_rl": 79.16, "gain_sft": -0.18, "gain_rl": 1.94, "scaled": false}, {"benchmark": "WebCode2M", "metric": "CLIP", "lens": "vision", "base": 79.42, "sft": 81.3, "sft_rl": 82.5, "gain_sft": 1.88, "gain_rl": 1.2, "scaled": false}, {"benchmark": "DesignBench", "metric": "Gen.", "lens": "vision", "base": 51.58, "sft": 52.89, "sft_rl": 56.76, "gain_sft": 1.31, "gain_rl": 3.87, "scaled": false}, {"benchmark": "DesignBench", "metric": "Edit.", "lens": "vision", "base": 8.07, "sft": 8.59, "sft_rl": 9.13, "gain_sft": 5.2, "gain_rl": 5.4, "scaled": false}, {"benchmark": "Design2Code", "metric": "LLM Score", "lens": "vision", "base": 57.94, "sft": 59.89, "sft_rl": 63.58, "gain_sft": 1.95, "gain_rl": 3.69, "scaled": false}, {"benchmark": "Design2Code", "metric": "Visual", "lens": "vision", "base": 85.11, "sft": 86.25, "sft_rl": 88.0, "gain_sft": 1.14, "gain_rl": 1.75, "scaled": false}, {"benchmark": "VisPlotBench (Python)", "metric": "Visual", "lens": "text", "base": 64.6, "sft": 66.25, "sft_rl": 69.0, "gain_sft": 1.65, "gain_rl": 2.75, "scaled": false}, {"benchmark": "VisPlotBench (Python)", "metric": "Task", "lens": "text", "base": 84.2, "sft": 85.4, "sft_rl": 88.2, "gain_sft": 1.2, "gain_rl": 2.8, "scaled": false}, {"benchmark": "VisPlotBench (HTML)", "metric": "Visual", "lens": "text", "base": 41.7, "sft": 44.5, "sft_rl": 49.58, "gain_sft": 2.8, "gain_rl": 5.08, "scaled": false}, {"benchmark": "VisPlotBench (HTML)", "metric": "Task", "lens": "text", "base": 74.6, "sft": 75.9, "sft_rl": 77.5, "gain_sft": 1.3, "gain_rl": 1.6, "scaled": false}]}, "human": {"n": 100, "rows": [{"judge": "Claude Sonnet 5", "direct": {"krippendorff_alpha": 0.386, "kendall_tau_b": 0.292}, "rubric": {"krippendorff_alpha": 0.889, "kendall_tau_b": 0.67}}, {"judge": "Gemini 3.5 Flash", "direct": {"krippendorff_alpha": 0.303, "kendall_tau_b": 0.282}, "rubric": {"krippendorff_alpha": 0.861, "kendall_tau_b": 0.643}}, {"judge": "GPT-5.5", "direct": {"krippendorff_alpha": 0.514, "kendall_tau_b": 0.442}, "rubric": {"krippendorff_alpha": 0.918, "kendall_tau_b": 0.657}}]}},

  /* ---------------------------------------------------------------- cases
     Appendix I case studies, in the paper's order; labels and captions as
     printed. Instructions exist only for the two editing cases (paraphrased in
     the tex). Images from Figures/case_studies/, resized to 720 px wide. */
  cases: [{"id": "case2", "title": "HTML bar chart", "benchmark": "VisPlotBench", "format": "HTML", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case2_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 574}, {"src": "public/cases/case2_baseline.webp", "label": "PrismaCoder-35B w/o RL", "role": "baseline", "w": 720, "h": 540}, {"src": "public/cases/case2_ours.webp", "label": "PrismaCoder-35B", "role": "ours", "w": 720, "h": 608}], "caption": "HTML bar chart. The SFT-only model renders the bars as hairlines; the RL model recovers bar geometry and value labels."}]}, {"id": "case5", "title": "Python heatmap", "benchmark": "VisPlotBench", "format": "Python", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case5_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 590}, {"src": "public/cases/case5_baseline.webp", "label": "PrismaCoder-35B w/o RL", "role": "baseline", "w": 720, "h": 540}, {"src": "public/cases/case5_ours.webp", "label": "PrismaCoder-35B", "role": "ours", "w": 720, "h": 540}], "caption": "Python heatmap. The SFT-only output runs and passes as code yet renders the radial field onto a diagonal; the RL model restores it."}]}, {"id": "case3", "title": "LaTeX stacked bars", "benchmark": "VisPlotBench", "format": "LaTeX", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case3_gold.webp", "label": "Gold", "role": "gold", "w": 659, "h": 586}, {"src": "public/cases/case3_baseline.webp", "label": "Qwen3.5-9B", "role": "baseline", "w": 694, "h": 664}, {"src": "public/cases/case3_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 720, "h": 592}], "caption": "LaTeX stacked bars. The base model mis-stacks the categories and drops bars; PrismaCoder-9B reproduces the per-tool composition."}]}, {"id": "case4", "title": "SVG pie chart", "benchmark": "VisPlotBench", "format": "SVG", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case4_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 724}, {"src": "public/cases/case4_baseline.webp", "label": "Qwen3.5-9B", "role": "baseline", "w": 400, "h": 400}, {"src": "public/cases/case4_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 500, "h": 500}], "caption": "SVG pie chart. The base model's sectors collapse into overlapping wedges; PrismaCoder-9B closes the pie with correct shares and labels."}]}, {"id": "case6", "title": "Mermaid sequence diagram", "benchmark": "VisPlotBench", "format": "Mermaid", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case6_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 414}, {"src": "public/cases/case6_baseline.webp", "label": "Qwen3.5-9B", "role": "baseline", "w": 720, "h": 427}, {"src": "public/cases/case6_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 720, "h": 427}], "caption": "Mermaid sequence diagram. The base model draws participants as plain boxes; PrismaCoder-9B reproduces the actor figures and the message order."}]}, {"id": "case7", "title": "Chart-to-code", "benchmark": "ChartMimic", "format": "Python (matplotlib)", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case7_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 902}, {"src": "public/cases/case7_base.webp", "label": "Qwen3.5-9B", "role": "base", "w": 720, "h": 902}, {"src": "public/cases/case7_sft.webp", "label": "PrismaCoder-9B w/o RL", "role": "sft", "w": 720, "h": 900}, {"src": "public/cases/case7_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 720, "h": 900}], "caption": "Chart-to-code on ChartMimic across training stages, where SFT recovers one of the line chart's two cycles and RL restores both."}, {"panels": [{"src": "public/cases/case7_vincicoder.webp", "label": "VinciCoder-7B", "role": "open-reference", "w": 720, "h": 864}, {"src": "public/cases/case7_opus5.webp", "label": "Claude Opus 5", "role": "proprietary-reference", "w": 720, "h": 900}, {"src": "public/cases/case7_gemini35flash.webp", "label": "Gemini 3.5 Flash", "role": "proprietary-reference", "w": 720, "h": 900}], "caption": "The same case for an open and two proprietary references, of which only the proprietary models reproduce the line chart."}]}, {"id": "case8", "title": "Front-end generation", "benchmark": "Design2Code", "format": "HTML", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case8_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 405}, {"src": "public/cases/case8_base.webp", "label": "Qwen3.5-9B", "role": "base", "w": 720, "h": 405}, {"src": "public/cases/case8_sft.webp", "label": "PrismaCoder-9B w/o RL", "role": "sft", "w": 720, "h": 405}, {"src": "public/cases/case8_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 720, "h": 405}], "caption": "Front-end generation on Design2Code, where the base and SFT-only models break the title layout and PrismaCoder-9B reproduces the page."}]}, {"id": "case9", "title": "Front-end generation", "benchmark": "Design2Code", "format": "HTML", "instruction": null, "figures": [{"panels": [{"src": "public/cases/case9_gold.webp", "label": "Gold", "role": "gold", "w": 720, "h": 412}, {"src": "public/cases/case9_base.webp", "label": "Qwen3.5-35B-A3B", "role": "base", "w": 720, "h": 490}, {"src": "public/cases/case9_sft.webp", "label": "PrismaCoder-35B w/o RL", "role": "sft", "w": 720, "h": 863}, {"src": "public/cases/case9_ours.webp", "label": "PrismaCoder-35B", "role": "ours", "w": 720, "h": 483}], "caption": "Front-end generation on Design2Code, where only PrismaCoder-35B reproduces the layout."}]}, {"id": "case10", "title": "Front-end editing", "benchmark": "DesignBench (editing split)", "format": "HTML", "instruction": "add a story-point number to each card, a per-column sum, and a header with a menu", "figures": [{"panels": [{"src": "public/cases/case10_src.webp", "label": "Source", "role": "source", "w": 720, "h": 360}, {"src": "public/cases/case10_dst.webp", "label": "Target", "role": "target", "w": 720, "h": 360}, {"src": "public/cases/case10_base.webp", "label": "Qwen3.5-9B", "role": "base", "w": 720, "h": 405}, {"src": "public/cases/case10_sft.webp", "label": "PrismaCoder-9B w/o RL", "role": "sft", "w": 720, "h": 490}, {"src": "public/cases/case10_ours.webp", "label": "PrismaCoder-9B", "role": "ours", "w": 720, "h": 405}], "caption": "Front-end editing on DesignBench, where only PrismaCoder-9B adds the requested story points, per-column sums, and header menu while keeping the board."}]}, {"id": "case11", "title": "Front-end editing", "benchmark": "DesignBench (editing split)", "format": "HTML", "instruction": "rename the couple to Cesar and Dayana, round the corners, make the countdown look better", "figures": [{"panels": [{"src": "public/cases/case11_src.webp", "label": "Source", "role": "source", "w": 720, "h": 564}, {"src": "public/cases/case11_dst.webp", "label": "Target", "role": "target", "w": 720, "h": 523}, {"src": "public/cases/case11_base.webp", "label": "Qwen3.5-35B-A3B", "role": "base", "w": 720, "h": 777}, {"src": "public/cases/case11_sft.webp", "label": "PrismaCoder-35B w/o RL", "role": "sft", "w": 720, "h": 652}, {"src": "public/cases/case11_ours.webp", "label": "PrismaCoder-35B", "role": "ours", "w": 720, "h": 639}], "caption": "Front-end editing on DesignBench, where only PrismaCoder-35B applies the requested renaming, rounded corners, and countdown restyling."}]}]
};
