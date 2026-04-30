const apiKeyInput = document.getElementById("apiKey");
const contractText = document.getElementById("contractText");
const professionInput = document.getElementById("professionInput");
const fileUpload = document.getElementById("fileUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeLabel = themeToggle.querySelector(".theme-label");
const statusEl = document.getElementById("status");
const resultsSection = document.getElementById("resultsSection");
const riskyList = document.getElementById("riskyList");
const safeList = document.getElementById("safeList");
const missingList = document.getElementById("missingList");
const overallSummary = document.getElementById("overallSummary");
const riskScoreValue = document.getElementById("riskScoreValue");
const analysisContext = document.getElementById("analysisContext");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const DEFAULT_API_KEY = window.APP_CONFIG?.GROQ_API_KEY || "";
const THEME_KEY = "legal-analyzer-theme";
const PROFESSION_PROMPTS = {
  freelancers: "Focus on scope creep, revision limits, IP transfer, portfolio rights, usage rights, and payment milestones.",
  designers: "Focus on design ownership, source file handover, revision caps, brand asset licensing, and acceptance criteria.",
  writers: "Focus on plagiarism liability, editorial control, byline/credit rights, kill fees, and republishing rights.",
  photographers: "Focus on model releases, image licensing, exclusivity, usage territories, and cancellation fees.",
  "video editors": "Focus on raw footage rights, delivery formats, revision cycles, soundtrack licenses, and turnaround penalties.",
  musicians: "Focus on master rights, publishing splits, royalties, sync rights, and performance obligations.",
  startups: "Focus on founder/IP assignment, vesting, confidentiality, liability caps, and termination triggers.",
  "small businesses": "Focus on payment terms, service levels, warranties, indemnity, and dispute cost exposure.",
  "large corporations": "Focus on compliance, audit rights, data governance, liability caps, and procurement safeguards.",
  entrepreneurs: "Focus on ownership, investor protections, non-compete restrictions, and exit/termination clauses.",
  investors: "Focus on governance rights, liquidation preference impact, anti-dilution, and information rights.",
  "venture capitalists": "Focus on protective provisions, board control, drag/tag rights, and liquidation waterfall risk.",
  lawyers: "Focus on representation scope, privilege, conflicts, malpractice liability, and billing terms.",
  accountants: "Focus on liability limitations, standards compliance, audit scope, and document retention.",
  "financial advisors": "Focus on fiduciary duties, disclosure, fee transparency, and suitability obligations.",
  "insurance agents": "Focus on coverage disclaimers, policy exclusions, renewal duties, and E&O exposure.",
  banks: "Focus on covenants, security interests, default triggers, and interest/fee transparency.",
  landlords: "Focus on security deposits, repair obligations, rent escalation, and eviction rights.",
  tenants: "Focus on habitability, subletting limits, rent hikes, and early termination rights.",
  "real estate agents": "Focus on commission triggers, dual agency disclosures, and listing termination rights.",
  "property investors": "Focus on title risk, zoning, representations, and exit/liquidity constraints.",
  "mortgage brokers": "Focus on fee disclosures, rate lock terms, and broker liability limits.",
  "saas companies": "Focus on SLA uptime, data ownership, DPA, security commitments, and limitation of liability.",
  "software developers": "Focus on IP assignment, open source usage, warranty scope, and acceptance criteria.",
  "app developers": "Focus on app store compliance, privacy obligations, support scope, and release ownership.",
  "it consultants": "Focus on deliverables, change requests, dependency risk, and client cooperation duties.",
  "cybersecurity firms": "Focus on incident response duties, breach notification timelines, and liability for attacks.",
  doctors: "Focus on informed consent, malpractice exposure, emergency exceptions, and record confidentiality.",
  hospitals: "Focus on regulatory compliance, payer terms, credentialing, and patient data protections.",
  pharmacies: "Focus on controlled substance compliance, supplier warranties, and recall responsibilities.",
  "medical device companies": "Focus on regulatory approvals, product liability, post-market surveillance, and recalls.",
  "healthcare startups": "Focus on HIPAA compliance, clinical risk allocation, and medical data governance.",
  importers: "Focus on Incoterms, customs risk, inspection rights, and currency/FX volatility clauses.",
  exporters: "Focus on shipping risk transfer, sanctions compliance, force majeure, and payment security.",
  traders: "Focus on price adjustment formulas, delivery risk, and counterparty default protections.",
  wholesalers: "Focus on minimum orders, return rights, territorial exclusivity, and payment terms.",
  retailers: "Focus on supply continuity, defects/returns, consumer compliance, and marketing restrictions.",
  "e-commerce businesses": "Focus on platform dependency, chargebacks, privacy compliance, and logistics liability.",
  schools: "Focus on safeguarding, fees/refunds, performance obligations, and student privacy.",
  universities: "Focus on research IP, grant compliance, student conduct, and data protection.",
  "online course creators": "Focus on content licensing, refund policies, platform rights, and anti-piracy terms.",
  tutors: "Focus on scheduling/cancellation, payment defaults, and liability disclaimers.",
  "edtech companies": "Focus on student data processing, uptime, accessibility compliance, and content rights.",
  youtubers: "Focus on sponsorship disclosures, music/copyright risk, and exclusivity obligations.",
  influencers: "Focus on brand usage rights, FTC disclosure, morality clauses, and payment timing.",
  actors: "Focus on likeness rights, exclusivity, reshoot obligations, and royalty/credit rights.",
  "production companies": "Focus on chain of title, talent releases, completion risk, and insurance coverage.",
  "music labels": "Focus on royalty accounting, recoupment terms, masters ownership, and term length.",
  contractors: "Focus on scope variations, delay penalties, indemnity, and milestone payments.",
  architects: "Focus on design liability, code compliance, change approvals, and IP reuse rights.",
  engineers: "Focus on professional standard obligations, defect liability, and project dependency risk.",
  "construction companies": "Focus on subcontractor risk, delay damages, safety obligations, and retention payments.",
  restaurants: "Focus on supply chain continuity, hygiene compliance, lease obligations, and employment risk.",
  hotels: "Focus on franchise terms, guest liability, data privacy, and cancellation exposure.",
  "catering companies": "Focus on cancellation fees, dietary/allergen liability, and minimum guarantees.",
  "food suppliers": "Focus on quality standards, contamination liability, and recall procedures.",
  farmers: "Focus on crop failure force majeure, pricing formulas, delivery terms, and insurance obligations.",
  "agricultural businesses": "Focus on land use rights, commodity pricing, and seasonal performance obligations.",
  "food processing companies": "Focus on food safety compliance, supplier warranties, and recall indemnities.",
  factories: "Focus on production specs, quality thresholds, machinery downtime, and worker safety obligations.",
  suppliers: "Focus on delivery schedules, quality assurance, substitution rights, and payment protection.",
  distributors: "Focus on territory, exclusivity, return policies, and performance thresholds.",
  "logistics companies": "Focus on loss/damage risk, delay liability, insurance, and customs obligations.",
  ngos: "Focus on grant restrictions, governance duties, anti-bribery compliance, and donor reporting.",
  charities: "Focus on fund-use restrictions, trustee duties, and public accountability disclosures.",
  "government contractors": "Focus on procurement compliance, audit rights, penalties, and data security obligations.",
};

let latestAnalysis = null;

fileUpload.addEventListener("change", handleFileUpload);
analyzeBtn.addEventListener("click", analyzeDocument);
downloadPdfBtn.addEventListener("click", downloadPdfReport);
themeToggle.addEventListener("click", toggleTheme);

applySavedTheme();

if (DEFAULT_API_KEY) {
  apiKeyInput.value = DEFAULT_API_KEY;
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".txt")) {
    setStatus("Please upload a .txt file only.", "error");
    fileUpload.value = "";
    return;
  }

  try {
    const text = await file.text();
    contractText.value = text;
    setStatus(`Loaded file: ${file.name}`, "success");
  } catch (err) {
    setStatus(`Failed to read file: ${err.message}`, "error");
  }
}

async function analyzeDocument() {
  const apiKey = apiKeyInput.value.trim();
  const content = contractText.value.trim();
  const profile = getSelectedProfile();

  if (!apiKey) {
    setStatus("Please enter your Groq API key.", "error");
    return;
  }
  if (!content) {
    setStatus("Please paste contract text or upload a .txt file.", "error");
    return;
  }
  if (!profile) {
    setStatus("Please select a profession from the searchable dropdown.", "error");
    return;
  }

  analyzeBtn.disabled = true;
  setStatus("Analyzing contract with Groq AI...");

  try {
    const payload = {
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an elite legal contract reviewer for global industries. Return strict JSON with keys riskyClauses, safeClauses, missingTerms, and summary. Each list must contain concise business-usable bullets.",
        },
        {
          role: "user",
          content: `Analyze this contract for "${profile.profession}" in "${profile.category}".

Specialized checks to prioritize:
${getSpecializedPrompt(profile.profession)}

Review the contract and identify risky clauses, safe clauses, and missing important terms for this profession.

Return JSON exactly in this shape:
{
  "riskyClauses": ["..."],
  "safeClauses": ["..."],
  "missingTerms": ["..."],
  "summary": "..."
}

Contract:
${content}`,
        },
      ],
    };

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error("Empty response from Groq API.");
    }

    const parsed = parseAnalysis(message);
    renderResults(parsed);
    setStatus("Analysis completed successfully.", "success");
  } catch (err) {
    setStatus(`Analysis failed: ${err.message}`, "error");
    resultsSection.classList.add("hidden");
  } finally {
    analyzeBtn.disabled = false;
  }
}

function parseAnalysis(rawText) {
  // Primary path: strict JSON from model.
  try {
    const json = JSON.parse(rawText);
    return normalizeResult(json);
  } catch (jsonErr) {
    // Fallback for models that wrap JSON with markdown fences.
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");
    const json = JSON.parse(cleaned);
    return normalizeResult(json);
  }
}

function normalizeResult(json) {
  return {
    riskyClauses: sanitizeArray(json.riskyClauses),
    safeClauses: sanitizeArray(json.safeClauses),
    missingTerms: sanitizeArray(json.missingTerms),
    summary: typeof json.summary === "string" ? json.summary : "No summary provided.",
  };
}

function sanitizeArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return ["No items detected."];
  }
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);
}

function renderResults(result) {
  latestAnalysis = result;
  const profile = getSelectedProfile();
  const score = computeRiskScore(result);
  fillList(riskyList, result.riskyClauses);
  fillList(safeList, result.safeClauses);
  fillList(missingList, result.missingTerms);
  riskScoreValue.textContent = `${score}%`;
  riskScoreValue.classList.remove("low", "medium", "high");
  riskScoreValue.classList.add(score >= 67 ? "high" : score >= 34 ? "medium" : "low");
  analysisContext.textContent = profile
    ? `${profile.profession} Risk Score`
    : "Risk Score";
  overallSummary.textContent = result.summary;
  resultsSection.classList.remove("hidden");
}

function fillList(listElement, items) {
  listElement.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listElement.appendChild(li);
  });
}

function computeRiskScore(result) {
  const riskyCount = countRealItems(result.riskyClauses);
  const safeCount = countRealItems(result.safeClauses);
  const missingCount = countRealItems(result.missingTerms);
  const signalTotal = riskyCount + safeCount + missingCount;

  if (signalTotal === 0) return 0;

  const weightedRisk = riskyCount * 1 + missingCount * 0.7;
  const score = Math.round((weightedRisk / signalTotal) * 100);
  return Math.max(0, Math.min(100, score));
}

function countRealItems(items) {
  return items.filter((item) => item !== "No items detected.").length;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggle(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
  updateThemeToggle(nextTheme);
}

function updateThemeToggle(theme) {
  if (!themeIcon || !themeLabel) return;
  if (theme === "dark") {
    themeIcon.textContent = "🌙";
    themeLabel.textContent = "Dark";
  } else {
    themeIcon.textContent = "☀️";
    themeLabel.textContent = "Light";
  }
}

function downloadPdfReport() {
  if (!latestAnalysis) {
    setStatus("Please run an analysis before downloading the PDF report.", "error");
    return;
  }

  if (!window.jspdf?.jsPDF) {
    setStatus("PDF library failed to load. Refresh and try again.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const score = computeRiskScore(latestAnalysis);
  const profile = getSelectedProfile();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 20;
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("AI Legal Document Analyzer Report", 10, y);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  if (profile) {
    doc.text(`Profile: ${profile.category} - ${profile.profession}`, 10, y);
    y += 7;
  }
  doc.text(`Risk Score: ${score}%`, 10, y);
  y += 8;

  y = writeSection(doc, "Risky Clauses", latestAnalysis.riskyClauses, y, maxWidth);
  y = writeSection(doc, "Safe Clauses", latestAnalysis.safeClauses, y, maxWidth);
  y = writeSection(doc, "Missing Important Terms", latestAnalysis.missingTerms, y, maxWidth);

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.text("Overall Summary", 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(latestAnalysis.summary, maxWidth);
  doc.text(summaryLines, 10, y);

  doc.save("legal-analysis-report.pdf");
  setStatus("PDF report downloaded.", "success");
}

function getSelectedProfile() {
  const value = professionInput.value.trim();
  if (!value.includes(" - ")) return null;
  const [category, profession] = value.split(" - ");
  if (!category || !profession) return null;
  return { category: category.trim(), profession: profession.trim() };
}

function getSpecializedPrompt(profession) {
  const key = profession.toLowerCase();
  return (
    PROFESSION_PROMPTS[key] ||
    "Focus on payment security, liability allocation, termination rights, IP/data rights, compliance obligations, and dispute mechanisms."
  );
}

function writeSection(doc, title, items, y, maxWidth) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (y > pageHeight - 24) {
    doc.addPage();
    y = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.text(title, 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");

  items.forEach((item) => {
    const lines = doc.splitTextToSize(`- ${item}`, maxWidth);
    if (y > pageHeight - 16) {
      doc.addPage();
      y = 16;
    }
    doc.text(lines, 10, y);
    y += lines.length * 5;
  });

  return y + 2;
}
