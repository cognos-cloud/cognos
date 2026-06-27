# Contributing to Cognos Cloud

Thanks for your interest. We're in early development — the best way to contribute right now is to:

1. **Request access** — [cloud.cognos.ai](https://cloud.cognos.ai) — deploy an agent and tell us what breaks
2. **Open issues** — bugs, missing features, confusing docs
3. **Share examples** — if you build an agent, add it to `/examples`

## Development setup

```bash
git clone https://github.com/cognos-cloud/cognos-cloud
cd cognos-cloud

# SDK
cd sdk
pip install -e ".[dev]"

# CLI
cd ../cli
pip install -e ".[dev]"
```

## Principles

- **Honest about what's live vs. coming soon.** No fake checkmarks.
- **One command to deploy.** Any complexity belongs inside Cognos, not in the developer's code.
- **Examples over documentation.** Working code beats wall-of-text docs.

## Contact

- X: [@CognosCloud](https://x.com/CognosCloud)
- GitHub: [github.com/cognos-cloud](https://github.com/cognos-cloud)
