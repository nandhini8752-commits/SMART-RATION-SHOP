import { query } from '../db/connection';

export interface ShopFilterParams {
  q?: string;
  district?: string;
  taluk?: string;
  pincode?: string;
  page?: number;
  pageSize?: number;
}

export const shopService = {
  async getPublicConfig() {
    return {
      service: 'SRQMS Tamil Nadu',
      version: '1.0.0-prototype',
      demoMode: (process.env.DEMO_MODE || 'true') === 'true',
      locales: ['en', 'ta', 'te', 'hi'],
      defaultLocale: 'ta',
      helplines: {
        tollFree: '1967',
        alternate: '1800-425-5901',
        hours: '08:00 - 20:00 (All days)',
      },
      prototypeNotice: 'Validation prototype — not an official government website. Uses sample data.',
      officialLinks: {
        tnpds: 'https://www.tnpds.gov.in/home.xhtml',
        civilSupplies: 'https://www.consumer.tn.gov.in/',
        tncsc: 'https://tncsc.tn.gov.in/en/PDS.html',
        nfsa: 'https://nfsa.gov.in/State/TN',
      },
    };
  },

  async getShops(params: ShopFilterParams = {}) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['s.is_active = TRUE'];
    const values: any[] = [];

    if (params.district && params.district !== 'ALL') {
      values.push(params.district);
      conditions.push(`s.district = $${values.length}`);
    }

    if (params.taluk) {
      values.push(`%${params.taluk}%`);
      conditions.push(`s.taluk ILIKE $${values.length}`);
    }

    if (params.pincode) {
      values.push(params.pincode);
      conditions.push(`s.pincode = $${values.length}`);
    }

    if (params.q) {
      values.push(`%${params.q}%`);
      const idx = values.length;
      conditions.push(`(s.name ILIKE $${idx} OR s.shop_code ILIKE $${idx} OR s.locality ILIKE $${idx} OR s.address ILIKE $${idx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query<{ total: string }>(
      `SELECT COUNT(*) as total FROM shops s ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const dataQuery = `
      SELECT 
        s.id,
        s.shop_code as "shopCode",
        s.name,
        s.district,
        s.taluk,
        s.locality,
        s.address,
        s.pincode,
        s.phone_display as "phoneDisplay",
        s.opening_hours as "openingHours",
        s.is_demo as "isDemo",
        s.is_active as "isActive",
        COALESCE(
          (SELECT COUNT(*) FROM queue_tokens qt 
           WHERE qt.shop_id = s.id 
             AND qt.service_date = CURRENT_DATE 
             AND qt.status = 'WAITING'), 
          0
        ) as "waitingCount"
      FROM shops s
      ${whereClause}
      ORDER BY s.district ASC, s.shop_code ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const shopsRes = await query(dataQuery, [...values, pageSize, offset]);

    return {
      data: shopsRes.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getShopById(shopIdOrCode: string) {
    const res = await query(
      `
      SELECT 
        s.id,
        s.shop_code as "shopCode",
        s.name,
        s.district,
        s.taluk,
        s.locality,
        s.address,
        s.pincode,
        s.phone_display as "phoneDisplay",
        s.latitude,
        s.longitude,
        s.opening_hours as "openingHours",
        s.is_demo as "isDemo",
        s.is_active as "isActive"
      FROM shops s
      WHERE s.id::text = $1 OR s.shop_code = $1
      LIMIT 1
      `,
      [shopIdOrCode]
    );

    return res.rows[0] || null;
  },

  async getShopAvailability(shopIdOrCode: string) {
    const shop = await this.getShopById(shopIdOrCode);
    if (!shop) return null;

    // Get stock snapshot
    const stockRes = await query(
      `
      SELECT 
        c.code as "commodityCode",
        c.name_i18n as "nameI18n",
        c.unit,
        si.quantity_available as "quantityAvailable",
        si.reorder_level as "reorderLevel",
        si.updated_at as "updatedAt"
      FROM shop_inventory si
      JOIN commodities c ON c.id = si.commodity_id
      WHERE si.shop_id = $1
      ORDER BY c.code ASC
      `,
      [shop.id]
    );

    // Get queue summary
    const queueSummaryRes = await query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'WAITING') as "waitingCount",
        COUNT(*) FILTER (WHERE status = 'SERVING') as "servingCount",
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as "completedCount"
      FROM queue_tokens
      WHERE shop_id = $1 AND service_date = CURRENT_DATE
      `,
      [shop.id]
    );

    // Get active serving tokens
    const servingTokensRes = await query(
      `
      SELECT 
        token_number as "tokenNumber",
        counter_no as "counterNo",
        serving_started_at as "servingStartedAt"
      FROM queue_tokens
      WHERE shop_id = $1 AND service_date = CURRENT_DATE AND status = 'SERVING'
      ORDER BY counter_no ASC
      `,
      [shop.id]
    );

    // Get next waiting tokens in FIFO order
    const nextWaitingRes = await query(
      `
      SELECT 
        token_number as "tokenNumber",
        sequence_no as "sequenceNo",
        created_at as "createdAt"
      FROM queue_tokens
      WHERE shop_id = $1 AND service_date = CURRENT_DATE AND status = 'WAITING'
      ORDER BY sequence_no ASC
      LIMIT 8
      `,
      [shop.id]
    );

    return {
      shop,
      stock: stockRes.rows,
      queue: {
        waitingCount: parseInt(queueSummaryRes.rows[0]?.waitingCount || '0', 10),
        servingCount: parseInt(queueSummaryRes.rows[0]?.servingCount || '0', 10),
        completedCount: parseInt(queueSummaryRes.rows[0]?.completedCount || '0', 10),
        currentlyServing: servingTokensRes.rows,
        nextWaiting: nextWaitingRes.rows,
      },
      timestamp: new Date().toISOString(),
    };
  },

  async getCommodities() {
    const res = await query(
      `
      SELECT 
        id,
        code,
        name_i18n as "nameI18n",
        unit,
        is_active as "isActive"
      FROM commodities
      WHERE is_active = TRUE
      ORDER BY code ASC
      `
    );
    return res.rows;
  },

  async getCurrentPolicies() {
    const res = await query(
      `
      SELECT 
        pr.id,
        pr.rule_code as "ruleCode",
        pr.version,
        pr.card_category as "cardCategory",
        c.code as "commodityCode",
        c.unit,
        pr.rule_config as "ruleConfig",
        pr.explanation_i18n as "explanationI18n",
        pr.source_url as "sourceUrl",
        pr.source_note as "sourceNote",
        pr.verified_at as "verifiedAt",
        pr.valid_from as "validFrom",
        pr.valid_to as "validTo",
        pr.is_demo as "isDemo"
      FROM policy_rules pr
      JOIN commodities c ON c.id = pr.commodity_id
      WHERE pr.valid_to IS NULL OR pr.valid_to >= CURRENT_DATE
      ORDER BY pr.card_category ASC, c.code ASC
      `
    );
    return res.rows;
  },

  async getPublishedNotices(category?: string) {
    const values: any[] = [];
    let whereClause = `WHERE status = 'PUBLISHED'`;

    if (category && category !== 'ALL') {
      values.push(category);
      whereClause += ` AND category = $1`;
    }

    const res = await query(
      `
      SELECT 
        id,
        title_i18n as "titleI18n",
        body_i18n as "bodyI18n",
        category,
        starts_at as "startsAt",
        ends_at as "endsAt",
        created_at as "createdAt"
      FROM notices
      ${whereClause}
      ORDER BY created_at DESC
      `,
      values
    );
    return res.rows;
  },
};
