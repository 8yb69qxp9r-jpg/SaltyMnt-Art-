// Tool definitions and handler — shared by both stdio and HTTP servers

export const TOOL_LIST = [
  {
    name: 'get_business_summary',
    description: 'Get a high-level business health snapshot: shop info, active listing count, recent order stats, and revenue from your last 25 orders.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_shop',
    description: 'Get full Etsy shop details including name, description, sales count, review average, and currency.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_listings',
    description: 'List your shop listings, optionally filtered by state.',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: ['active', 'inactive', 'draft', 'sold_out', 'expired'],
          description: 'Filter by listing state (omit for all)',
        },
        limit: { type: 'number', description: 'Results per page, max 100 (default 25)' },
        offset: { type: 'number', description: 'Pagination offset' },
        sort_on: { type: 'string', enum: ['created', 'price', 'updated', 'score'] },
        sort_order: { type: 'string', enum: ['asc', 'desc'] },
      },
    },
  },
  {
    name: 'search_listings',
    description: 'Search your active listings by keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: 'Search keywords' },
        limit: { type: 'number', description: 'Max results (default 25)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'get_listing',
    description: 'Get full details for a single listing including images and shipping profile.',
    inputSchema: {
      type: 'object',
      properties: {
        listing_id: { type: 'number', description: 'Etsy listing ID' },
      },
      required: ['listing_id'],
    },
  },
  {
    name: 'create_listing',
    description: 'Create a new listing in your Etsy shop. Requires OAuth write access.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Listing title (max 140 chars)' },
        description: { type: 'string', description: 'Full listing description' },
        price: { type: 'number', description: 'Price in your shop currency' },
        quantity: { type: 'number', description: 'Quantity available' },
        who_made: {
          type: 'string',
          enum: ['i_did', 'someone_else', 'collective'],
          description: 'Who made the item',
        },
        when_made: {
          type: 'string',
          description: 'When it was made — e.g. "made_to_order", "2020_2024", "2010_2019", "before_1990"',
        },
        taxonomy_id: {
          type: 'number',
          description: 'Etsy category taxonomy ID. Use 2078 for Art > Prints > Digital Prints as a starting point.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Up to 13 search tags (max 20 chars each)',
        },
        materials: {
          type: 'array',
          items: { type: 'string' },
          description: 'Materials used',
        },
        shipping_profile_id: {
          type: 'number',
          description: 'Shipping profile ID (required for physical items, skip for digital)',
        },
        shop_section_id: { type: 'number', description: 'Shop section ID to place listing in' },
        is_digital: { type: 'boolean', description: 'Set true for digital downloads' },
        is_supply: { type: 'boolean', description: 'Set true for craft supplies' },
      },
      required: ['title', 'description', 'price', 'quantity', 'who_made', 'when_made', 'taxonomy_id'],
    },
  },
  {
    name: 'update_listing',
    description: 'Update fields of an existing listing. Only pass the fields you want to change.',
    inputSchema: {
      type: 'object',
      properties: {
        listing_id: { type: 'number', description: 'Listing ID to update' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
        materials: { type: 'array', items: { type: 'string' } },
        state: { type: 'string', enum: ['active', 'inactive', 'draft'] },
        who_made: { type: 'string', enum: ['i_did', 'someone_else', 'collective'] },
        when_made: { type: 'string' },
        is_supply: { type: 'boolean' },
        shop_section_id: { type: 'number' },
        featured_rank: { type: 'number', description: 'Set to 1 to feature this listing' },
      },
      required: ['listing_id'],
    },
  },
  {
    name: 'delete_listing',
    description: 'Permanently delete a listing from your shop.',
    inputSchema: {
      type: 'object',
      properties: {
        listing_id: { type: 'number', description: 'Listing ID to delete' },
      },
      required: ['listing_id'],
    },
  },
  {
    name: 'list_orders',
    description: 'Get recent orders/receipts. Useful for tracking sales, revenue, and fulfillment status.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 25, max 100)' },
        offset: { type: 'number', description: 'Pagination offset' },
        was_paid: { type: 'boolean', description: 'Filter paid orders only' },
        was_shipped: { type: 'boolean', description: 'Filter shipped orders only' },
        was_delivered: { type: 'boolean', description: 'Filter delivered orders only' },
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get full details for a specific order including items, buyer, and totals.',
    inputSchema: {
      type: 'object',
      properties: {
        receipt_id: { type: 'number', description: 'Order/receipt ID' },
      },
      required: ['receipt_id'],
    },
  },
  {
    name: 'get_transactions',
    description: 'Get financial transactions — useful for revenue tracking and bookkeeping.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 25, max 100)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'list_shop_sections',
    description: 'List all sections/categories in your shop.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'create_shop_section',
    description: 'Create a new section/category in your shop.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Section title (max 24 chars)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_listing_images',
    description: 'Get all images attached to a listing.',
    inputSchema: {
      type: 'object',
      properties: {
        listing_id: { type: 'number', description: 'Listing ID' },
      },
      required: ['listing_id'],
    },
  },
  {
    name: 'get_shipping_profiles',
    description: 'Get all shipping profiles configured in your shop.',
    inputSchema: { type: 'object', properties: {} },
  },
];

export async function callTool(client, name, args = {}) {
  switch (name) {
    case 'get_business_summary':  return client.getBusinessSummary();
    case 'get_shop':              return client.getShop();
    case 'list_listings':         return client.listListings(args);
    case 'search_listings':       return client.searchListings(args.keywords, args);
    case 'get_listing':           return client.getListing(args.listing_id);
    case 'create_listing':        return client.createListing(args);
    case 'update_listing': {
      const { listing_id, ...updates } = args;
      return client.updateListing(listing_id, updates);
    }
    case 'delete_listing':        return client.deleteListing(args.listing_id);
    case 'list_orders':           return client.listOrders(args);
    case 'get_order':             return client.getOrder(args.receipt_id);
    case 'get_transactions':      return client.getTransactions(args);
    case 'list_shop_sections':    return client.listShopSections();
    case 'create_shop_section':   return client.createShopSection(args.title);
    case 'get_listing_images':    return client.getListingImages(args.listing_id);
    case 'get_shipping_profiles': return client.getShippingProfiles();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
