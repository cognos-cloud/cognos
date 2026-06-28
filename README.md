# Cognos Cloud

**The cloud operating system for autonomous AI agents.**

Deploy production-ready AI agents in minutes. Cognos Cloud gives every agent memory, observability, scheduling, retries, and a live API — the moment you run `cognos deploy`.

You write the agent logic. We keep it running.

---

## Why Cognos Cloud

| Capability | Cognos Cloud | AI Frameworks |
|---|---|---|
| Build agents | ✅ | ✅ |
| Deploy to production | ✅ | ⚠️ |
| Runtime management | ✅ | ❌ |
| Persistent memory | ✅ | ⚠️ |
| Observability | ✅ | ⚠️ |
| Scheduling | ✅ | ❌ |
| One-command deployment | ✅ | ❌ |

LangGraph, CrewAI, AutoGen, and the OpenAI Agents SDK are excellent tools for **building** agent logic. Cognos Cloud is the production layer those agents run on.

---

## Quickstart

```bash
pip install cognos
cognos login
cognos deploy
```

**Five minutes from zero to a live, managed AI agent.**

See [Getting Started](./docs/getting-started.md) for the full guide.

---

## The SDK

```python
from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",
    memory=True,
    tools=["web", "slack"],
    cron="0 9 * * *",
)

agent.deploy()
```

After deploy:

```
✓ Packaging agent
✓ Uploading source
✓ Creating runtime
✓ Provisioning memory
✓ Starting agent

Agent deployed.

Dashboard  https://cognoscloud.xyz/agents/research-agent
API        POST https://api.cognoscloud.xyz/v1/agents/research-agent/run
Status     Running
```

---

## Examples

Three ready-to-deploy agents in [`/examples`](./examples):

| Agent | What it does |
|---|---|
| [Research Agent](./examples/research-agent/) | Searches the web daily, posts a summary to Slack |
| [GitHub Agent](./examples/github-agent/) | Reviews PRs, flags stale issues, sends daily digest |
| [Crypto Agent](./examples/crypto-agent/) | Monitors wallets on Solana + Ethereum, alerts on large movements |

---

## GitHub Repository Structure

See [`GITHUB_REPOS.md`](./GITHUB_REPOS.md) for the publish order and repository split.

| Repo | Language | Purpose |
|---|---:|---|
| [`cognos`](https://github.com/cognos-cloud/cognos) | TypeScript | Main repo: website, dashboard UI, docs site, product demos |
| [`cognos-runtime`](https://github.com/cognos-cloud/cognos-runtime) | Python | Core runtime: deploy, run, restart, API endpoint, logs, execution timeline |
| [`cognos-sdk`](https://github.com/cognos-cloud/cognos-sdk) | Python | Python SDK: `Agent`, `tool`, memory, policy primitives |
| [`cognos-cli`](https://github.com/cognos-cloud/cognos-cli) | Python | CLI: `cognos init`, `cognos dev`, `cognos deploy`, `cognos logs`, `cognos monitor` |
| [`cognos-examples`](https://github.com/cognos-cloud/cognos-examples) | Python | Example agents: research, GitHub reviewer, crypto monitor |
| [`cognos-docs`](https://github.com/cognos-cloud/cognos-docs) | — | Documentation, guides, API reference, roadmap |

This repo mirrors the intended split. Move each folder into its own GitHub repository when you're ready to publish.

---

## Core Concepts

| Primitive | Status | Description |
|---|---|---|
| **Runtime** | ✅ Live | Continuous agent execution, auto-restart, API endpoint |
| **Memory** | 🔵 Coming Soon | Persistent context store across sessions |
| **Observe** | 🔵 Coming Soon | Execution traces, cost tracking, latency |
| **Workflow** | 🔵 Coming Soon | Multi-agent pipelines |
| **Policy** | 🔵 Coming Soon | Spending limits, RBAC, approval gates |
| **Tools** | ✅ Live | GitHub, Slack, Discord, PostgreSQL, Solana, Ethereum + more |

---

## Links

- **Website:** [cognoscloud.xyz](https://cognoscloud.xyz)
- **Docs:** [cognoscloud.xyz/docs](https://cognoscloud.xyz/docs)
- **X:** [@CognosCloud](https://x.com/CognosCloud)
- **Request access:** [cognoscloud.xyz/#signup](https://cognoscloud.xyz)

---

## License

MIT
