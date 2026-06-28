# Cognos Cloud GitHub Repositories

Use this split when publishing the Cognos Cloud organization.

| Repo | Language | Purpose |
|---|---:|---|
| [`cognos`](https://github.com/cognos-cloud/cognos) | TypeScript | Main repo: website, dashboard UI, docs site, product demos |
| [`cognos-runtime`](https://github.com/cognos-cloud/cognos-runtime) | Python | Core runtime: deploy, run, restart, API endpoint, logs, execution timeline |
| [`cognos-sdk`](https://github.com/cognos-cloud/cognos-sdk) | Python | Python SDK: `Agent`, `tool`, memory, policy primitives |
| [`cognos-cli`](https://github.com/cognos-cloud/cognos-cli) | Python | CLI: `cognos init`, `cognos dev`, `cognos deploy`, `cognos logs`, `cognos monitor` |
| [`cognos-examples`](https://github.com/cognos-cloud/cognos-examples) | Python | Example agents: research, GitHub reviewer, crypto monitor |
| [`cognos-docs`](https://github.com/cognos-cloud/cognos-docs) | — | Documentation, guides, API reference, roadmap |

## Publish order

1. `cognos-runtime` — core demo and credibility.
2. `cognos-sdk` — package the Python API.
3. `cognos-cli` — expose `cognos deploy` as the main workflow.
4. `cognos-examples` — cloneable agents.
5. `cognos-docs` — docs and guides.
6. `cognos` — website, dashboard, landing page.

## Domain

- Website: https://cognoscloud.xyz
- API: https://api.cognoscloud.xyz/v1
