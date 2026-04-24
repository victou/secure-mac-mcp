use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ToolRequest {
    name: String,
    input: serde_json::Value,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ApprovalRequest {
    id: String,
    tool: ToolRequest,
    input: serde_json::Value,
    created_at: String,
    expires_at: String,
    summary: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoredApprovalDecision {
    request_id: String,
    approved: bool,
    reason: Option<String>,
    decided_at: String,
}

#[tauri::command]
fn list_pending_approvals() -> Result<Vec<ApprovalRequest>, String> {
    let pending_dir = approval_root().join("pending");

    if !pending_dir.exists() {
        return Ok(Vec::new());
    }

    let mut approvals = Vec::new();

    for entry in fs::read_dir(pending_dir).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();

        if path.extension().and_then(|extension| extension.to_str()) != Some("json") {
            continue;
        }

        let raw = fs::read_to_string(path).map_err(|error| error.to_string())?;
        let approval = serde_json::from_str::<ApprovalRequest>(&raw)
            .map_err(|error| error.to_string())?;
        approvals.push(approval);
    }

    approvals.sort_by(|left, right| left.created_at.cmp(&right.created_at));

    Ok(approvals)
}

#[tauri::command]
fn decide_approval(request_id: String, approved: bool, reason: Option<String>) -> Result<(), String> {
    let decisions_dir = approval_root().join("decisions");
    fs::create_dir_all(&decisions_dir).map_err(|error| error.to_string())?;

    let decision = StoredApprovalDecision {
        request_id: request_id.clone(),
        approved,
        reason,
        decided_at: Utc::now().to_rfc3339(),
    };
    let path = decisions_dir.join(format!("{request_id}.json"));
    let raw = serde_json::to_string_pretty(&decision).map_err(|error| error.to_string())?;

    fs::write(path, format!("{raw}\n")).map_err(|error| error.to_string())
}

fn approval_root() -> PathBuf {
    if let Ok(path) = env::var("SECURE_MAC_MCP_APPROVAL_DIR") {
        return PathBuf::from(path);
    }

    let current_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let repo_root = current_dir
        .ancestors()
        .find(|path| path.join("pnpm-workspace.yaml").exists())
        .map(PathBuf::from)
        .unwrap_or(current_dir);

    repo_root.join(".secure-mac-mcp/approvals")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_pending_approvals,
            decide_approval
        ])
        .run(tauri::generate_context!())
        .expect("failed to run secure-mac-mcp desktop app");
}
