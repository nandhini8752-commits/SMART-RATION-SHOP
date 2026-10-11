import bcrypt from 'bcryptjs';
import { query, transaction, DbClient } from '../db/connection.js';
import { AppError } from '../middleware/error.js';

export const adminService = {
  /**
   * System-wide dashboard statistics
   */
  async getDashboardSummary() {
    const [shopsCount, usersCount, commoditiesCount, policiesCount, noticesCount, complaintsCount, auditCount] =
      await Promise.all([
        query(`SELECT COUNT(*) as count FROM shops WHERE is_active = TRUE`),
        query(`SELECT COUNT(*) as count FROM app_users WHERE is_active = TRUE`),
        query(`SELECT COUNT(*) as count FROM commodities WHERE is_active = TRUE`),
        query(`SELECT COUNT(*) as count FROM policy_rules`),
        query(`SELECT COUNT(*) as count FROM notices WHERE status = 'PUBLISHED'`),
        query(`SELECT COUNT(*) as count FROM complaints WHERE status IN ('RECEIVED', 'IN_REVIEW')`),
        query(`SELECT COUNT(*) as count FROM audit_logs`),
      ]);

    return {
      activeShops: parseInt(shopsCount.rows[0].count, 10),
      activeStaffUsers: parseInt(usersCount.rows[0].count, 10),
      activeCommodities: parseInt(commoditiesCount.rows[0].count, 10),
      versionedPolicies: parseInt(policiesCount.rows[0].count, 10),
      publishedNotices: parseInt(noticesCount.rows[0].count, 10),
      pendingComplaints: parseInt(complaintsCount.rows[0].count, 10),
      totalAuditEvents: parseInt(auditCount.rows[0].count, 10),
    };
  },

  /**
   * Shops management
   */
  async getShops() {
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
        s.opening_hours as "openingHours",
        s.is_active as "isActive",
        s.created_at as "createdAt",
        (SELECT COUNT(*) FROM ration_cards rc WHERE rc.shop_id = s.id) as "assignedCardsCount"
      FROM shops s
      ORDER BY s.shop_code ASC
      `
    );
    return {
      shops: res.rows.map((row: any) => ({
        ...row,
        assignedCardsCount: parseInt(row.assignedCardsCount || '0', 10),
      })),
    };
  },

  async createShop(input: any, actorUserId: string) {
    const { shopCode, name, district, taluk, locality, address, pincode, phoneDisplay, openingHours } = input;
    if (!shopCode || !name || !district || !address) {
      throw new AppError('shopCode, name, district, and address are mandatory fields.', 400, 'VALIDATION_ERROR');
    }

    const res = await query(
      `
      INSERT INTO shops (
        shop_code, name, district, taluk, locality, address, pincode, phone_display, opening_hours, is_demo, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, TRUE)
      RETURNING 
        id, shop_code as "shopCode", name, district, taluk, locality, address, pincode, is_active as "isActive"
      `,
      [
        shopCode.trim().toUpperCase(),
        name.trim(),
        district.trim(),
        taluk?.trim() || null,
        locality?.trim() || null,
        address.trim(),
        pincode?.trim() || null,
        phoneDisplay?.trim() || null,
        JSON.stringify(openingHours || {}),
      ]
    );

    const created = res.rows[0];

    // Audit log
    await query(
      `
      INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'CREATE_SHOP', 'shops', $2, $3)
      `,
      [actorUserId, created.id, JSON.stringify(created)]
    );

    return created;
  },

  /**
   * Users management (RBAC)
   */
  async getUsers() {
    const res = await query(
      `
      SELECT 
        u.id,
        u.username,
        u.full_name as "fullName",
        u.role,
        u.shop_id as "shopId",
        s.shop_code as "shopCode",
        s.name as "shopName",
        u.is_active as "isActive",
        u.last_login_at as "lastLoginAt",
        u.created_at as "createdAt"
      FROM app_users u
      LEFT JOIN shops s ON s.id = u.shop_id
      ORDER BY u.created_at DESC
      `
    );
    return { users: res.rows };
  },

  async createUser(input: any, actorUserId: string) {
    const { username, fullName, password, role, shopId } = input;
    if (!username || !fullName || !password || !role) {
      throw new AppError('username, fullName, password, and role are required.', 400, 'VALIDATION_ERROR');
    }

    if (['SHOP_OPERATOR', 'SHOP_SUPERVISOR'].includes(role) && !shopId) {
      throw new AppError('Operators and Supervisors must be assigned to an active shop.', 400, 'SHOP_REQUIRED');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const res = await query(
      `
      INSERT INTO app_users (username, full_name, password_hash, role, shop_id, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING 
        id, username, full_name as "fullName", role, shop_id as "shopId", is_active as "isActive", created_at as "createdAt"
      `,
      [username.trim().toLowerCase(), fullName.trim(), passwordHash, role, shopId || null]
    );

    const created = res.rows[0];

    await query(
      `
      INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'CREATE_USER', 'app_users', $2, $3)
      `,
      [actorUserId, created.id, JSON.stringify({ username: created.username, role: created.role, shopId: created.shopId })]
    );

    return created;
  },

  async updateUserStatus(userId: string, isActive: boolean, actorUserId: string) {
    const res = await query(
      `
      UPDATE app_users
      SET is_active = $1, updated_at = NOW()
      WHERE id::text = $2
      RETURNING id, username, is_active as "isActive"
      `,
      [isActive, userId]
    );

    if (res.rows.length === 0) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    await query(
      `
      INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'UPDATE_USER_STATUS', 'app_users', $2, $3)
      `,
      [actorUserId, userId, JSON.stringify({ isActive })]
    );

    return res.rows[0];
  },

  /**
   * Commodity Catalogue
   */
  async getCommodities() {
    const res = await query(
      `
      SELECT 
        id,
        code,
        name_i18n as "nameI18n",
        unit,
        is_active as "isActive",
        created_at as "createdAt"
      FROM commodities
      ORDER BY code ASC
      `
    );
    return { commodities: res.rows };
  },

  async createCommodity(input: any, actorUserId: string) {
    const { code, nameI18n, unit } = input;
    if (!code || !nameI18n || !unit) {
      throw new AppError('code, nameI18n, and unit are required.', 400, 'VALIDATION_ERROR');
    }

    const res = await query(
      `
      INSERT INTO commodities (code, name_i18n, unit, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, code, name_i18n as "nameI18n", unit, is_active as "isActive"
      `,
      [code.trim().toUpperCase(), JSON.stringify(nameI18n), unit.trim().toLowerCase()]
    );

    const created = res.rows[0];

    await query(
      `
      INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'CREATE_COMMODITY', 'commodities', $2, $3)
      `,
      [actorUserId, created.id, JSON.stringify(created)]
    );

    return created;
  },

  /**
   * Versioned Policy Rules
   */
  async getPolicies() {
    const res = await query(
      `
      SELECT 
        p.id,
        p.rule_code as "ruleCode",
        p.version,
        p.card_category as "cardCategory",
        c.code as "commodityCode",
        c.name_i18n as "commodityNameI18n",
        p.rule_config as "ruleConfig",
        p.explanation_i18n as "explanationI18n",
        p.source_url as "sourceUrl",
        p.source_note as "sourceNote",
        p.valid_from as "validFrom",
        p.valid_to as "validTo",
        p.created_at as "createdAt"
      FROM policy_rules p
      JOIN commodities c ON c.id = p.commodity_id
      ORDER BY p.rule_code ASC, p.version DESC
      `
    );
    return { policies: res.rows };
  },

  async createPolicyRule(input: any, actorUserId: string) {
    const { ruleCode, cardCategory, commodityCode, ruleConfig, explanationI18n, sourceUrl, sourceNote, validFrom, validTo } = input;

    if (!ruleCode || !cardCategory || !commodityCode || !ruleConfig || !validFrom) {
      throw new AppError('ruleCode, cardCategory, commodityCode, ruleConfig, and validFrom are required.', 400, 'VALIDATION_ERROR');
    }

    // Lookup commodity
    const comRes = await query(`SELECT id FROM commodities WHERE code = $1`, [commodityCode]);
    if (comRes.rows.length === 0) {
      throw new AppError(`Commodity '${commodityCode}' not found.`, 404, 'NOT_FOUND');
    }
    const commodityId = comRes.rows[0].id;

    // Monotonic version calculation for this rule_code
    const verRes = await query(
      `SELECT COALESCE(MAX(version), 0) + 1 as "nextVer" FROM policy_rules WHERE rule_code = $1`,
      [ruleCode.trim()]
    );
    const nextVer = parseInt(verRes.rows[0].nextVer, 10);

    const res = await query(
      `
      INSERT INTO policy_rules (
        rule_code, version, card_category, commodity_id, rule_config, explanation_i18n,
        source_url, source_note, verified_at, valid_from, valid_to, is_demo, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, TRUE, $11)
      RETURNING 
        id, rule_code as "ruleCode", version, card_category as "cardCategory", 
        rule_config as "ruleConfig", valid_from as "validFrom"
      `,
      [
        ruleCode.trim(),
        nextVer,
        cardCategory,
        commodityId,
        JSON.stringify(ruleConfig),
        JSON.stringify(explanationI18n || {}),
        sourceUrl || null,
        sourceNote || 'Administrative policy update',
        validFrom,
        validTo || null,
        actorUserId,
      ]
    );

    const created = res.rows[0];

    await query(
      `
      INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, new_values)
      VALUES ($1, 'CREATE_POLICY_RULE', 'policy_rules', $2, $3)
      `,
      [actorUserId, created.id, JSON.stringify(created)]
    );

    return created;
  },

  /**
   * Department Notices
   */
  async getNotices() {
    const res = await query(
      `
      SELECT 
        id,
        title_i18n as "titleI18n",
        body_i18n as "bodyI18n",
        category,
        status,
        starts_at as "startsAt",
        ends_at as "endsAt",
        created_at as "createdAt"
      FROM notices
      ORDER BY created_at DESC
      `
    );
    return { notices: res.rows };
  },

  async createNotice(input: any, actorUserId: string) {
    const { titleI18n, bodyI18n, category, status } = input;
    if (!titleI18n || !bodyI18n) {
      throw new AppError('titleI18n and bodyI18n are mandatory.', 400, 'VALIDATION_ERROR');
    }

    const res = await query(
      `
      INSERT INTO notices (title_i18n, body_i18n, category, status, starts_at, created_by)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id, title_i18n as "titleI18n", category, status, created_at as "createdAt"
      `,
      [JSON.stringify(titleI18n), JSON.stringify(bodyI18n), category || 'GENERAL', status || 'PUBLISHED', actorUserId]
    );

    return res.rows[0];
  },

  /**
   * Complaints Triage
   */
  async getComplaints(status?: string) {
    const conditions = [];
    const values: any[] = [];

    if (status && status !== 'ALL') {
      values.push(status);
      conditions.push(`c.status = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `
      SELECT 
        c.id,
        c.reference_code as "referenceCode",
        c.category,
        c.subject,
        c.message,
        c.status,
        c.shop_id as "shopId",
        s.shop_code as "shopCode",
        s.name as "shopName",
        c.demo_contact_hint as "demoContactHint",
        c.response_note as "responseNote",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM complaints c
      LEFT JOIN shops s ON s.id = c.shop_id
      ${whereClause}
      ORDER BY c.created_at DESC
      `,
      values
    );

    return { complaints: res.rows };
  },

  async updateComplaint(complaintId: string, status: string, responseNote?: string, actorUserId?: string) {
    if (!['RECEIVED', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) {
      throw new AppError('Invalid complaint status.', 400, 'VALIDATION_ERROR');
    }

    const res = await query(
      `
      UPDATE complaints
      SET status = $1,
          response_note = COALESCE($2, response_note),
          updated_at = NOW()
      WHERE id::text = $3
      RETURNING 
        id, reference_code as "referenceCode", status, response_note as "responseNote", updated_at as "updatedAt"
      `,
      [status, responseNote || null, complaintId]
    );

    if (res.rows.length === 0) {
      throw new AppError('Complaint not found.', 404, 'NOT_FOUND');
    }

    const updated = res.rows[0];

    if (actorUserId) {
      await query(
        `
        INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, reason, new_values)
        VALUES ($1, 'TRIAGE_COMPLAINT', 'complaints', $2, $3, $4)
        `,
        [actorUserId, complaintId, responseNote || 'Status update', JSON.stringify({ status })]
      );
    }

    return updated;
  },

  /**
   * Audit Logs stream
   */
  async getAuditLogs(limit = 100, offset = 0) {
    const l = Math.min(Math.max(limit, 1), 500);
    const o = Math.max(offset, 0);

    const res = await query(
      `
      SELECT 
        a.id,
        a.action,
        a.resource_type as "resourceType",
        a.resource_id as "resourceId",
        a.reason,
        a.old_values as "oldValues",
        a.new_values as "newValues",
        a.created_at as "timestamp",
        u.username as "actorUsername",
        u.full_name as "actorFullName"
      FROM audit_logs a
      LEFT JOIN app_users u ON u.id = a.actor_id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [l, o]
    );

    return {
      auditLogs: res.rows,
      limit: l,
      offset: o,
    };
  },
};
