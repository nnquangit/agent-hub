/**
 * Generate the agent.[slug].md file content — shared by the server (writing) and client (preview).
 * contextPrefix: relative path from the agents dir to the context dir.
 */
export function agentToMd(a, contextPrefix = "../context") {
  const date = new Date().toISOString().slice(0, 10);
  const list = a.knowledge.length
    ? a.knowledge.map((k) => `- [${k}](${contextPrefix}/${k})`).join("\n")
    : "_(no knowledge assigned)_";
  const sys = String(a.systemPrompt || "").trim();
  const model = String(a.model || "").trim();
  return `---
name: ${a.name}
role: ${a.role}
${model ? `model: ${model}\n` : ""}updated: ${date}
---

# Agent: ${a.name}

**Role:** ${a.role}

## Knowledge — load these files before starting

${list}
${sys ? `\n## System prompt\n\n${sys}\n` : ""}`;
}
