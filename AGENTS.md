

<!-- agent-hub:mapping:start -->
# AI Agent Instructions

Role instruction files:

- `coder` → `.agents/agents/agent.coder.md`
- `designer` → `.agents/agents/agent.designer.md`

## Loading Rules

Before starting any task:

1. Determine which role(s) are required for the task.
2. Locate the corresponding agent instruction file by matching the **role** value.
3. Read the matched agent instruction file completely before planning or writing code.
4. The agent instruction file contains additional knowledge files that must also be read before performing the task.
5. If the task spans multiple roles, load every matching agent instruction file.
6. Do not load instruction files for unrelated roles.
7. If instructions conflict, the most specific role instruction takes precedence.
<!-- agent-hub:mapping:end -->
