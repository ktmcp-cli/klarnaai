# AGENT.md — Klarna AI CLI for AI Agents

This document explains how to use the Klarna AI CLI as an AI agent.

## Overview

The `klarnaai` CLI provides access to Klarna's AI Product Search API. Use it to search for products, get recommendations, and help users discover shopping items.

## Authentication

The public product search endpoint does not require authentication. The CLI can be used immediately after installation.

## All Commands

### Products

```bash
# Search for products
klarnaai products search <query>
klarnaai products search <query> --size 20
klarnaai products search <query> --budget 500
klarnaai products search <query> --json
```

**Parameters**:
- `query` (required) - Search query for products
- `--size <n>` - Number of results to return (default: 10)
- `--budget <amount>` - Maximum price filter in local currency
- `--json` - Output as JSON

### Shopping

```bash
# Find products (alternative interface)
klarnaai shopping find <query>
klarnaai shopping find <query> --size 10
klarnaai shopping find <query> --max-price 300
klarnaai shopping find <query> --json
```

**Parameters**:
- `query` (required) - Search query
- `--size <n>` - Number of results
- `--max-price <amount>` - Maximum price filter
- `--json` - Output as JSON

### Recommendations

```bash
# Get product recommendations by category
klarnaai recommendations get <category>
klarnaai recommendations get <category> --budget 200
klarnaai recommendations get <category> --count 5
klarnaai recommendations get <category> --json
```

**Parameters**:
- `category` (required) - Product category or type
- `--budget <amount>` - Budget constraint
- `--count <n>` - Number of recommendations (default: 5)
- `--json` - Output as JSON

### Configuration

```bash
# Set API key (optional)
klarnaai config set --api-key <key>

# Show configuration
klarnaai config show
```

## JSON Output

Always use `--json` when you need to parse results programmatically:

```bash
klarnaai products search "laptop" --json
klarnaai shopping find "headphones" --json
klarnaai recommendations get "smartphone" --json
```

## Response Format

The API returns a response with a `products` array:

```json
{
  "products": [
    {
      "name": "Product Name",
      "price": "$299.99",
      "url": "https://...",
      "attributes": ["attribute1", "attribute2"]
    }
  ]
}
```

## Example Workflows

### Search for products in a price range

```bash
# Find laptops under $1000
klarnaai products search "laptop" --budget 1000 --size 20 --json
```

### Get gift recommendations

```bash
# Get gift ideas for a category
klarnaai recommendations get "gifts for men" --budget 50 --count 10 --json
```

### Compare products

```bash
# Search for multiple product categories
klarnaai shopping find "wireless mouse" --json
klarnaai shopping find "bluetooth keyboard" --json
```

## Query Tips

- Use specific, singular product names (e.g., "laptop" not "laptops")
- Avoid qualifiers like "best", "cheapest", "premium" in the query
- Use --budget parameter for price filtering instead of including price in query
- Keep queries focused on product category or specific item

## Error Handling

The CLI exits with code 1 on error. Common errors:

- `Bad request` — Invalid parameters
- `Service unavailable` — Klarna services are down
- `Rate limit exceeded` — Too many requests, wait before retrying

## Tips for Agents

1. Always use `--json` when parsing results programmatically
2. Use the `--budget` parameter to filter by price instead of mentioning price in the query
3. The `products search` and `shopping find` commands are aliases - use whichever fits your use case
4. The API works best with specific, focused queries rather than broad searches
5. No authentication is required for the public product search endpoint
