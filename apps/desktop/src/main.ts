import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

interface ApprovalRequest {
  id: string;
  tool: {
    name: string;
    input: Record<string, unknown>;
  };
  input: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  summary: string;
}

const approvalsElement = getRequiredElement<HTMLDivElement>("#approvals");
const statusElement = getRequiredElement<HTMLDivElement>("#status");
const refreshButton = getRequiredElement<HTMLButtonElement>("#refresh");

refreshButton.addEventListener("click", () => {
  void renderApprovals();
});

void renderApprovals();

async function renderApprovals(): Promise<void> {
  setStatus("Loading pending approvals...");

  try {
    const approvals = await invoke<ApprovalRequest[]>("list_pending_approvals");
    approvalsElement.replaceChildren(...approvals.map(renderApproval));

    if (approvals.length === 0) {
      approvalsElement.replaceChildren(renderEmptyState());
      setStatus("No pending approvals.");
      return;
    }

    setStatus(`${approvals.length} pending approval${approvals.length === 1 ? "" : "s"}.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to load approvals.");
  }
}

function renderApproval(request: ApprovalRequest): HTMLElement {
  const article = document.createElement("article");
  article.className = "approval-card";

  const title = document.createElement("h2");
  title.textContent = request.tool.name;

  const summary = document.createElement("p");
  summary.textContent = request.summary;

  const metadata = document.createElement("dl");
  metadata.appendChild(renderMetadata("Created", new Date(request.createdAt).toLocaleString()));
  metadata.appendChild(renderMetadata("Expires", new Date(request.expiresAt).toLocaleString()));

  const input = document.createElement("pre");
  input.textContent = JSON.stringify(request.input, null, 2);

  const actions = document.createElement("div");
  actions.className = "actions";

  const approve = document.createElement("button");
  approve.type = "button";
  approve.className = "approve";
  approve.textContent = "Approve";
  approve.addEventListener("click", () => {
    void decide(request.id, true);
  });

  const deny = document.createElement("button");
  deny.type = "button";
  deny.className = "deny";
  deny.textContent = "Deny";
  deny.addEventListener("click", () => {
    void decide(request.id, false);
  });

  actions.append(approve, deny);
  article.append(title, summary, metadata, input, actions);

  return article;
}

function renderMetadata(label: string, value: string): HTMLElement {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");

  term.textContent = label;
  description.textContent = value;
  row.append(term, description);

  return row;
}

function renderEmptyState(): HTMLElement {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "No approval requests are waiting.";

  return empty;
}

async function decide(requestId: string, approved: boolean): Promise<void> {
  const reason = approved ? "Approved from desktop app." : "Denied from desktop app.";
  await invoke("decide_approval", { requestId, approved, reason });
  await renderApprovals();
}

function setStatus(message: string): void {
  statusElement.textContent = message;
}

function getRequiredElement<TElement extends HTMLElement>(selector: string): TElement {
  const element = document.querySelector<TElement>(selector);

  if (!element) {
    throw new Error(`Desktop approval UI failed to find ${selector}.`);
  }

  return element;
}
