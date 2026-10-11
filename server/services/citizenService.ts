import crypto from 'crypto';
import { query } from '../db/connection';
import { AppError } from '../middleware/error';

// In-memory verification sessions map (short-lived 2 hours)
const verificationSessions = new Map<string, { cardId: string; cardNumber: string; category: string; expiresAt: number }>();

export const citizenService = {
  /**
   * Verifies synthetic demo ration card and creates short-lived verification session.
   */
  async verifyDemoCard(cardNumber: string) {
    if ((process.env.DEMO_MODE || 'true') !== 'true') {
      throw new AppError('Demo card verification is disabled in non-demo environments.', 403, 'DEMO_MODE_DISABLED');
    }

    const cleanNumber = cardNumber.trim().toUpperCase();

    const res = await query(
      `
      SELECT 
        rc.id,
        rc.card_number as "cardNumber",
        rc.category,
        rc.head_name as "headName",
        rc.family_members as "familyMembers",
        rc.locality,
        rc.demo_mobile_masked as "demoMobileMasked",
        rc.is_demo as "isDemo",
        s.id as "shopId",
        s.shop_code as "shopCode",
        s.name as "shopName",
        s.district,
        s.address as "shopAddress"
      FROM ration_cards rc
      JOIN shops s ON s.id = rc.shop_id
      WHERE rc.card_number = $1
      LIMIT 1
      `,
      [cleanNumber]
    );

    if (res.rows.length === 0) {
      throw new AppError(
        'Card number not found in demonstration registry. Please use synthetic test cards DEMO-TN-0001 to DEMO-TN-0005.',
        404,
        'CARD_NOT_FOUND'
      );
    }

    const card = res.rows[0];
    const verificationId = crypto.randomUUID();
    
    verificationSessions.set(verificationId, {
      cardId: card.id,
      cardNumber: card.cardNumber,
      category: card.category,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    });

    return {
      verificationId,
      card,
      disclaimer: 'Synthetic demonstration record only — not an official government ration card.',
    };
  },

  /**
   * Calculates configured entitlements for a verified card.
   */
  async getCardEntitlements(cardNumberOrVerificationId: string) {
    let cardNumber = cardNumberOrVerificationId;
    const session = verificationSessions.get(cardNumberOrVerificationId);
    if (session) {
      cardNumber = session.cardNumber;
    }

    const cardRes = await query(
      `
      SELECT id, card_number as "cardNumber", category, family_members as "familyMembers", shop_id as "shopId"
      FROM ration_cards
      WHERE card_number = $1
      LIMIT 1
      `,
      [cardNumber]
    );

    if (cardRes.rows.length === 0) {
      throw new AppError('Ration card not found for entitlement lookup', 404, 'NOT_FOUND');
    }

    const card = cardRes.rows[0];

    // Fetch applicable policy rules for this card category
    const rulesRes = await query(
      `
      SELECT DISTINCT ON (c.code)
        pr.rule_code as "ruleCode",
        pr.version,
        c.code as "commodityCode",
        c.name_i18n as "nameI18n",
        c.unit,
        pr.rule_config as "ruleConfig",
        pr.explanation_i18n as "explanationI18n",
        pr.source_url as "sourceUrl",
        pr.source_note as "sourceNote",
        pr.valid_from as "validFrom"
      FROM policy_rules pr
      JOIN commodities c ON c.id = pr.commodity_id
      WHERE pr.card_category = $1
        AND pr.valid_from <= CURRENT_DATE
        AND (pr.valid_to IS NULL OR pr.valid_to >= CURRENT_DATE)
      ORDER BY c.code ASC, pr.version DESC
      `,
      [card.category]
    );

    // Calculate entitlement items
    const items = rulesRes.rows.map((rule: any) => {
      const config = rule.ruleConfig || {};
      let calculatedQuantity = 0;

      if (config.scale === 'PER_PERSON') {
        calculatedQuantity = (config.quantity || 0) * card.familyMembers;
      } else if (config.scale === 'PER_FAMILY') {
        calculatedQuantity = config.quantity || 0;
      }

      return {
        commodityCode: rule.commodityCode,
        nameI18n: rule.nameI18n,
        unit: rule.unit,
        scale: config.scale,
        quantity: calculatedQuantity,
        pricePerUnit: config.pricePerUnit || 0,
        ruleCode: rule.ruleCode,
        version: rule.version,
        sourceUrl: rule.sourceUrl,
        sourceNote: rule.sourceNote,
        explanationI18n: rule.explanationI18n,
      };
    });

    return {
      card: {
        cardNumber: card.cardNumber,
        category: card.category,
        familyMembers: card.familyMembers,
      },
      policyVersion: 'TN-PDS-2026-V1',
      isDemo: true,
      items,
    };
  },

  /**
   * Registers a citizen demonstration grievance and returns reference code.
   */
  async createComplaint(data: {
    category: string;
    subject: string;
    message: string;
    shopId?: string;
    demoContactHint?: string;
  }) {
    if (!data.subject?.trim() || !data.message?.trim()) {
      throw new AppError('Subject and detailed message are required.', 400, 'VALIDATION_ERROR');
    }

    const referenceCode = `CMP-TN-${Math.floor(100000 + Math.random() * 900000)}`;

    const res = await query(
      `
      INSERT INTO complaints (
        reference_code,
        category,
        subject,
        message,
        shop_id,
        demo_contact_hint,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'RECEIVED')
      RETURNING 
        id,
        reference_code as "referenceCode",
        category,
        subject,
        status,
        created_at as "createdAt"
      `,
      [
        referenceCode,
        data.category || 'COMMODITY_QUALITY',
        data.subject.trim(),
        data.message.trim(),
        data.shopId || null,
        data.demoContactHint?.trim() || null,
      ]
    );

    return res.rows[0];
  },

  /**
   * Look up complaint status by reference code.
   */
  async getComplaintByReference(referenceCode: string) {
    const res = await query(
      `
      SELECT 
        c.reference_code as "referenceCode",
        c.category,
        c.subject,
        c.status,
        c.response_note as "responseNote",
        c.created_at as "createdAt",
        s.shop_code as "shopCode",
        s.name as "shopName"
      FROM complaints c
      LEFT JOIN shops s ON s.id = c.shop_id
      WHERE c.reference_code = $1
      LIMIT 1
      `,
      [referenceCode.trim().toUpperCase()]
    );

    if (res.rows.length === 0) {
      throw new AppError('Complaint reference code not found', 404, 'COMPLAINT_NOT_FOUND');
    }

    return res.rows[0];
  },
};
