import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(__dirname, '.tokens.json');
const BASE = 'https://openapi.etsy.com/v3';

function loadTokens() {
  const fromEnv = {
    access_token: process.env.ETSY_ACCESS_TOKEN || '',
    refresh_token: process.env.ETSY_REFRESH_TOKEN || '',
    expires_at: 0,
  };
  if (existsSync(TOKEN_FILE)) {
    const saved = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'));
    // env vars take precedence if explicitly set
    return {
      access_token: fromEnv.access_token || saved.access_token || '',
      refresh_token: fromEnv.refresh_token || saved.refresh_token || '',
      expires_at: saved.expires_at || 0,
    };
  }
  return fromEnv;
}

export class EtsyClient {
  constructor() {
    this.apiKey = process.env.ETSY_API_KEY;
    this.shopId = process.env.ETSY_SHOP_ID || null;
    this.tokens = loadTokens();

    if (!this.apiKey) throw new Error('ETSY_API_KEY is not set. Run: cp .env.example .env and fill it in.');
  }

  // ── Token management ────────────────────────────────────────────────────────

  async getToken() {
    if (this.tokens.access_token && Date.now() < this.tokens.expires_at) {
      return this.tokens.access_token;
    }
    if (this.tokens.refresh_token) {
      await this.refreshToken();
      return this.tokens.access_token;
    }
    return this.tokens.access_token || null;
  }

  async refreshToken() {
    const res = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.apiKey,
        refresh_token: this.tokens.refresh_token,
      }),
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
    const data = await res.json();
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60_000,
    };
    writeFileSync(TOKEN_FILE, JSON.stringify(this.tokens, null, 2));
  }

  // ── HTTP helper ─────────────────────────────────────────────────────────────

  async req(path, opts = {}) {
    const token = await this.getToken();
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    };
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    if (res.status === 204 || res.headers.get('content-length') === '0') return { success: true };
    const text = await res.text();
    if (!res.ok) throw new Error(`Etsy ${res.status}: ${text}`);
    return JSON.parse(text);
  }

  // ── Shop helpers ─────────────────────────────────────────────────────────────

  async resolveShopId() {
    if (this.shopId) return this.shopId;
    const me = await this.req('/application/users/me');
    if (!me?.shop_id) throw new Error('No shop linked to this Etsy account. Please set ETSY_SHOP_ID in your .env.');
    this.shopId = me.shop_id;
    return this.shopId;
  }

  // ── Public API methods ───────────────────────────────────────────────────────

  async getShop() {
    const id = await this.resolveShopId();
    return this.req(`/application/shops/${id}`);
  }

  async listListings(params = {}) {
    const id = await this.resolveShopId();
    const q = new URLSearchParams();
    if (params.state) q.set('state', params.state);
    q.set('limit', String(Math.min(params.limit || 25, 100)));
    if (params.offset) q.set('offset', String(params.offset));
    if (params.sort_on) q.set('sort_on', params.sort_on);
    if (params.sort_order) q.set('sort_order', params.sort_order);
    return this.req(`/application/shops/${id}/listings?${q}`);
  }

  async getListing(listingId) {
    return this.req(`/application/listings/${listingId}?includes[]=images&includes[]=shipping_profile`);
  }

  async createListing(p) {
    const id = await this.resolveShopId();
    const body = {
      title: p.title,
      description: p.description,
      price: p.price,
      quantity: p.quantity,
      who_made: p.who_made,
      when_made: p.when_made,
      taxonomy_id: p.taxonomy_id,
    };
    if (p.tags?.length) body.tags = p.tags;
    if (p.materials?.length) body.materials = p.materials;
    if (p.shipping_profile_id) body.shipping_profile_id = p.shipping_profile_id;
    if (p.shop_section_id) body.shop_section_id = p.shop_section_id;
    if (p.is_supply !== undefined) body.is_supply = p.is_supply;
    if (p.is_digital) body.type = 'download';
    return this.req(`/application/shops/${id}/listings`, { method: 'POST', body: JSON.stringify(body) });
  }

  async updateListing(listingId, updates) {
    const id = await this.resolveShopId();
    const allowed = ['title', 'description', 'price', 'quantity', 'tags', 'materials',
      'state', 'who_made', 'when_made', 'is_supply', 'shop_section_id', 'featured_rank'];
    const body = Object.fromEntries(allowed.filter(k => updates[k] !== undefined).map(k => [k, updates[k]]));
    return this.req(`/application/shops/${id}/listings/${listingId}`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async deleteListing(listingId) {
    const id = await this.resolveShopId();
    await this.req(`/application/shops/${id}/listings/${listingId}`, { method: 'DELETE' });
    return { success: true, deleted: listingId };
  }

  async listOrders(params = {}) {
    const id = await this.resolveShopId();
    const q = new URLSearchParams();
    q.set('limit', String(Math.min(params.limit || 25, 100)));
    if (params.offset) q.set('offset', String(params.offset));
    if (params.was_paid !== undefined) q.set('was_paid', String(params.was_paid));
    if (params.was_shipped !== undefined) q.set('was_shipped', String(params.was_shipped));
    if (params.was_delivered !== undefined) q.set('was_delivered', String(params.was_delivered));
    return this.req(`/application/shops/${id}/receipts?${q}`);
  }

  async getOrder(receiptId) {
    const id = await this.resolveShopId();
    return this.req(`/application/shops/${id}/receipts/${receiptId}`);
  }

  async listShopSections() {
    const id = await this.resolveShopId();
    return this.req(`/application/shops/${id}/sections`);
  }

  async createShopSection(title) {
    const id = await this.resolveShopId();
    return this.req(`/application/shops/${id}/sections`, { method: 'POST', body: JSON.stringify({ title }) });
  }

  async getListingImages(listingId) {
    return this.req(`/application/listings/${listingId}/images`);
  }

  async getShippingProfiles() {
    const id = await this.resolveShopId();
    return this.req(`/application/shops/${id}/shipping-profiles`);
  }

  async getTransactions(params = {}) {
    const id = await this.resolveShopId();
    const q = new URLSearchParams();
    q.set('limit', String(Math.min(params.limit || 25, 100)));
    if (params.offset) q.set('offset', String(params.offset));
    return this.req(`/application/shops/${id}/transactions?${q}`);
  }

  async searchListings(keywords, params = {}) {
    const id = await this.resolveShopId();
    const q = new URLSearchParams({ keywords });
    q.set('limit', String(Math.min(params.limit || 25, 100)));
    if (params.offset) q.set('offset', String(params.offset));
    return this.req(`/application/shops/${id}/listings/active?${q}`);
  }

  async getBusinessSummary() {
    const id = await this.resolveShopId();
    const [shop, activeListings, recentOrders] = await Promise.all([
      this.getShop(),
      this.listListings({ state: 'active', limit: 100 }),
      this.listOrders({ limit: 25 }),
    ]);

    const revenue = recentOrders.results?.reduce((sum, r) => sum + (r.grandtotal?.amount || 0) / (r.grandtotal?.divisor || 100), 0) || 0;
    const paidOrders = recentOrders.results?.filter(r => r.is_paid) || [];
    const unshipped = recentOrders.results?.filter(r => r.is_paid && !r.is_shipped) || [];

    return {
      shop: {
        name: shop.shop_name,
        title: shop.title,
        num_favorers: shop.num_favorers,
        num_sales: shop.num_sales,
        review_average: shop.review_average,
        review_count: shop.review_count,
        is_vacation: shop.is_vacation,
        currency_code: shop.currency_code,
      },
      listings: {
        active_count: activeListings.count || 0,
        sample_titles: activeListings.results?.slice(0, 5).map(l => l.title) || [],
      },
      recent_orders: {
        total_fetched: recentOrders.count || 0,
        paid: paidOrders.length,
        awaiting_shipment: unshipped.length,
        recent_revenue_usd: revenue.toFixed(2),
      },
    };
  }
}
