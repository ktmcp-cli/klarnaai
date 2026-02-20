> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Klarna AI CLI

A command-line interface for the Klarna AI Product Search API. Search and discover products from Klarna's shopping catalog directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by Klarna.

## Features

- **Product Search** — Search Klarna's product catalog with natural language queries
- **Budget Filtering** — Filter results by maximum price
- **Recommendations** — Get product recommendations by category
- **Shopping Assistant** — AI-powered product discovery
- **JSON output** — All commands support `--json` for scripting and piping

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/klarnaai
```

## Usage

### Product Search

```bash
# Search for products
klarnaai products search "laptop"

# Limit results
klarnaai products search "headphones" --size 5

# Filter by budget
klarnaai products search "smartphone" --budget 500

# Get JSON output
klarnaai products search "camera" --json
```

### Shopping Commands

```bash
# Find products (alias for search)
klarnaai shopping find "running shoes"

# With max price filter
klarnaai shopping find "tablet" --max-price 300
```

### Recommendations

```bash
# Get product recommendations
klarnaai recommendations get "gaming laptop"

# With budget constraint
klarnaai recommendations get "wireless earbuds" --budget 100 --count 10
```

## Commands

### Products

```bash
# Search products
klarnaai products search <query> [--size <n>] [--budget <amount>] [--json]
```

### Shopping

```bash
# Find products (alternative interface)
klarnaai shopping find <query> [--size <n>] [--max-price <amount>] [--json]
```

### Recommendations

```bash
# Get recommendations by category
klarnaai recommendations get <category> [--budget <amount>] [--count <n>] [--json]
```

### Configuration

```bash
# Set API key (optional - public endpoint)
klarnaai config set --api-key <key>

# Show configuration
klarnaai config show
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get products as JSON
klarnaai products search "laptop" --json

# Pipe to jq for filtering
klarnaai products search "camera" --json | jq '.products[] | select(.price < "500")'
```

## Examples

### Find the best budget laptop

```bash
klarnaai products search "laptop" --budget 800 --size 5
```

### Get wireless headphone recommendations

```bash
klarnaai recommendations get "wireless headphones" --count 10
```

### Search with price filter and JSON output

```bash
klarnaai shopping find "4k monitor" --max-price 600 --json
```

## API

This CLI uses the Klarna AI Product Search API, which provides access to Klarna's product catalog for AI-powered shopping assistance.

**Base URL**: `https://www.klarna.com/us/shopping`

**Endpoints**:
- `GET /public/openai/v0/products` - Search products

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/klarnaai](https://github.com/ktmcp-cli/klarnaai).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
