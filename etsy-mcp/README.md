# Etsy MCP Server for SaltyMnt Art

Connect Claude to your Etsy shop to monitor business health, manage listings, and track orders.

---

## What you can do once connected

| Ask Claude to… | Tool used |
|---|---|
| "Give me a business health summary" | `get_business_summary` |
| "List all my active listings" | `list_listings` |
| "Find listings with 'mountain' in the title" | `search_listings` |
| "Create a new print listing for $24.99" | `create_listing` |
| "Update the tags on listing 1234567" | `update_listing` |
| "How many unshipped orders do I have?" | `list_orders` |
| "Show my last 10 transactions" | `get_transactions` |
| "What shipping profiles do I have?" | `get_shipping_profiles` |

---

## Step 1 — Get an Etsy API key

1. Go to **https://www.etsy.com/developers/your-account**
2. Click **Manage Your Apps → Create a New App**
3. Fill in the app details (name it "SaltyMnt Claude" or similar)
4. Under **Callback URLs**, add: `http://localhost:3003/callback`
5. Copy the **Keystring** — that's your API key

---

## Step 2 — Install and configure

```bash
cd etsy-mcp
npm install
cp .env.example .env
```

Open `.env` and set:
```
ETSY_API_KEY=your_keystring_from_step_1
```

---

## Step 3 — Authorize your Etsy account (OAuth)

```bash
npm run auth
```

This opens a browser, you click "Allow", and tokens are saved automatically to `.tokens.json`.

The tokens auto-refresh — you only need to do this once.

---

## Step 4 — Choose your connection method

### Option A: Claude Desktop (local, stdio) — simplest

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "etsy": {
      "command": "node",
      "args": ["/absolute/path/to/etsy-mcp/server.js"],
      "env": {
        "ETSY_API_KEY": "your_key_here",
        "ETSY_SHOP_ID": "your_shop_id_here"
      }
    }
  }
}
```

Config file locations:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Restart Claude Desktop. You should see the Etsy tools available.

---

### Option B: Claude Code on the Web (deploy to Railway) — for web access

1. **Push to GitHub** (this repo)

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
   - Select `SaltyMnt-Art-` → choose the `etsy-mcp` service root (or add a service pointing to this folder)
   - Set environment variables in Railway:
     ```
     ETSY_API_KEY=your_key
     ETSY_ACCESS_TOKEN=from_tokens.json
     ETSY_REFRESH_TOKEN=from_tokens.json
     ETSY_SHOP_ID=your_shop_id
     TRANSPORT=http
     MCP_AUTH_TOKEN=pick_a_secret_token
     PORT=3001
     ```
   - Railway will give you a URL like `https://etsy-mcp-production.up.railway.app`

3. **Add to Claude Code on the Web**:
   - Go to **Settings → MCP Servers → Add Server**
   - Type: **SSE**
   - URL: `https://etsy-mcp-production.up.railway.app/sse`
   - Auth header: `Authorization: Bearer your_secret_token`

---

### Option C: Claude Code CLI (stdio, local)

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "etsy": {
      "command": "node",
      "args": ["/absolute/path/to/etsy-mcp/server.js"],
      "env": {
        "ETSY_API_KEY": "your_key"
      }
    }
  }
}
```

Or run the CLI with:
```bash
claude --mcp-server "node /path/to/etsy-mcp/server.js"
```

---

## Finding your Shop ID

If you don't know your shop ID, just leave `ETSY_SHOP_ID` blank — the server auto-detects it from your OAuth token. Or find it at:

`https://www.etsy.com/shop/YourShopName` → view page source → search for `"shop_id"`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ETSY_API_KEY is not set` | Copy `.env.example` to `.env` and add your key |
| `Token refresh failed` | Re-run `npm run auth` to get fresh tokens |
| `No shop found` | Set `ETSY_SHOP_ID` in your `.env` |
| 401 errors on write operations | Make sure you completed `npm run auth` with the right scopes |
| Server not showing in Claude | Restart Claude Desktop; check the config file path |

---

## Available tools

- `get_business_summary` — health snapshot (shop + listings + recent orders)
- `get_shop` — full shop details
- `list_listings` — list all listings (filter by state)
- `search_listings` — keyword search across active listings
- `get_listing` — single listing with images & shipping
- `create_listing` — post a new product
- `update_listing` — change price, tags, title, state, etc.
- `delete_listing` — remove a listing
- `list_orders` — recent orders with fulfillment status
- `get_order` — detailed single order
- `get_transactions` — financial transaction history
- `list_shop_sections` — shop categories
- `create_shop_section` — add a new category
- `get_listing_images` — images for a listing
- `get_shipping_profiles` — your configured shipping profiles
