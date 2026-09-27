# QILA: Sovereign On-Premise Agentic AI Workbench

> **Your AI. Your fort. Zero leaks.**
> SIH 2026 · Problem Statement 26117 · Team **Crew Infinity**

QILA (किला, "fort") is a self-hosted, air-gapped AI workbench for industrial work. Open-weight multimodal models, local RAG and tool-using agents run entirely on your own GPU server.

This repository is a **clickable UI prototype**. All AI behaviour is **simulated with realistic mock data**, so it can be demoed on any laptop without a GPU or internet connection.

## Run

```bash
npm install
npm run dev        # open http://localhost:5173
```

## Demo accounts (RBAC)

| Role | Can do |
| --- | --- |
| **Engineer** (Rohan Sharma) | Agent runs, sandbox, upload, export |
| **Admin** (Anita Iyer) | Everything above, plus loading and unloading models |
| **Viewer** (Priya Nair) | Chat and search only. Export, upload and sandbox are blocked |

## PPT feature → prototype screen

| PPT feature | Where to see it |
| --- | --- |
| Air-gapped local infrastructure | Sidebar egress counter · **Air-Gap Security** · **System Map** |
| Dynamic multi-model routing | **Model Router** (registry, VRAM budget, router playground, policy) · router step in every agent run · manual override in the composer |
| Multimodal & local RAG (scans, handwriting, P&IDs) | **Knowledge Base**: ingestion pipeline, P&ID vision parsing, handwriting OCR, hybrid search |
| Autonomous agentic workflow (plan → act → verify) | **Agent Workbench**: live Route → Plan → Retrieve → Act → Verify → Deliver trace |
| Sandbox code execution | **Tools & Sandbox**: tool registry, isolated console, container limits. The coding demo shows the agent correcting its own error |
| Tools: File, Python, Excel, Word/PPT, Calculator | **Tools & Sandbox** registry · Calculator used in the maintenance-report demo |
| Real deliverables (DOCX, XLSX, PPTX, PDF, code) | **Deliverables** with in-app previews, plus file cards inside each agent run |
| Verification layer & human review | Verification step and **Approve / Request changes** after each run |
| Security: RBAC, egress control, audit logs | **Air-Gap Security**: live firewall log, audit trail, RBAC. RBAC is enforced across the app |
| Risks: prompt injection, excessive agency, supply chain | **Guardrail demo** in the Workbench · AI guardrails and supply-chain checks on the Security page · model SHA-256 on model cards |
| System architecture & methodology (8 steps) | **System Map** |
| Impact & benefits | **Overview**: Impact panel (security, productivity, economic, social, environmental) |

## Suggested demo script (≈ 5 min)

1. **Login** as Engineer → **Overview** (KPIs, Impact panel).
2. **System Map**: explain the architecture, which is all inside the fort.
3. **Agent Workbench** → *Extract P&ID tag list* → preview the Excel file → **Approve**.
4. *Heat-exchanger efficiency script*: the agent fixes its own code error in the sandbox.
5. *Guardrail demo*: a poisoned PDF tries to leak data and is **blocked**.
6. **Air-Gap Security**: 0 bytes of egress, live firewall log, audit trail.
7. Sign out → log in as **Viewer** → try Download → **blocked by RBAC**.

Typed prompts are matched to the closest demo scenario by keywords.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · lucide-react · fonts bundled locally (no CDN calls).
