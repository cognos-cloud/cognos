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

Dashboard  https://cloud.cognos.ai/agents/research-agent
API        POST https://api.cognos.ai/v1/agents/research-agent/run
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

## Repository Structure

```
cognos-cloud/
├── README.md
│
├── sdk/                    # Python SDK
│   ├── cognos/
│   │   ├── __init__.py
│   │   ├── agent.py        # Agent class
│   │   ├── tool.py         # @tool decorator
│   │   ├── memory.py       # Memory client
│   │   ├── policy.py       # Policy config
│   │   └── client.py       # API client
│   ├── pyproject.toml
│   └── README.md
│
├── cli/                    # CLI (cognos deploy, logs, etc.)
│   ├── cognos_cli/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── commands/
│   │   │   ├── deploy.py
│   │   │   ├── logs.py
│   │   │   ├── dev.py
│   │   │   └── monitor.py
│   │   └── config.py
│   ├── pyproject.toml
│   └── README.md
│
├── runtime/                # Agent runtime engine
│   ├── runtime/
│   │   ├── executor.py     # Agent execution loop
│   │   ├── scheduler.py    # Cron + webhook scheduling
│   │   ├── restart.py      # Auto-restart policy
│   │   └── api.py          # REST API exposure
│   ├── Dockerfile
│   └── README.md
│
├── examples/               # Ready-to-deploy example agents
│   ├── research-agent/
│   ├── github-agent/
│   └── crypto-agent/
│
└── docs/                   # Documentation
    ├── getting-started.md
    ├── sdk.md
    ├── cli.md
    ├── runtime.md
    ├── memory.md
    ├── observe.md
    ├── tools.md
    └── api-reference.md
```

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

- **Website:** [cloud.cognos.ai](https://cloud.cognos.ai)
- **Docs:** [cloud.cognos.ai/docs](https://cloud.cognos.ai/docs)
- **X:** [@CognosCloud](https://x.com/CognosCloud)
- **Request access:** [cloud.cognos.ai/#signup](https://cloud.cognos.ai)

---

## License

MIT
