import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { exec, query, closeDb } from './connection';

dotenv.config();

export async function runSeed() {
  console.log('[Seed] Starting database seeding...');

  if (process.env.DEMO_MODE !== 'true' && process.env.NODE_ENV === 'production') {
    throw new Error('[Seed] Refusing to seed database: DEMO_MODE must be "true".');
  }

  // 1. Execute SQL seed script for base entities (shops, commodities, cards, inventory, counters)
  const seedSqlPath = path.resolve(process.cwd(), 'database', 'seed.demo.sql');
  if (fs.existsSync(seedSqlPath)) {
    const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');
    await exec(seedSql);
    console.log('[Seed] Executed base database/seed.demo.sql');
  }

  // 2. Fetch the primary demo shop
  const shopRes = await query(`SELECT id FROM shops WHERE shop_code = 'DEMO-CHN-001' LIMIT 1`);
  const primaryShopId = shopRes.rows[0]?.id;

  if (!primaryShopId) {
    throw new Error('[Seed] Primary shop DEMO-CHN-001 not found after seed.demo.sql');
  }

  // 3. Seed demo staff and admin users with bcrypt hashed passwords
  const salt = await bcrypt.genSalt(10);
  const operatorPasswordHash = await bcrypt.hash('DemoOperator@123', salt);
  const supervisorPasswordHash = await bcrypt.hash('DemoSupervisor@123', salt);
  const adminPasswordHash = await bcrypt.hash('DemoAdmin@123', salt);

  const users = [
    {
      username: 'operator_anna',
      fullName: 'K. Rajavel (FPS Operator)',
      passwordHash: operatorPasswordHash,
      role: 'SHOP_OPERATOR',
      shopId: primaryShopId,
    },
    {
      username: 'supervisor_anna',
      fullName: 'M. Shanthi (Area Supervisor)',
      passwordHash: supervisorPasswordHash,
      role: 'SHOP_SUPERVISOR',
      shopId: primaryShopId,
    },
    {
      username: 'admin_tn',
      fullName: 'TNPDS State System Administrator',
      passwordHash: adminPasswordHash,
      role: 'SYSTEM_ADMIN',
      shopId: null,
    },
  ];

  for (const user of users) {
    await query(
      `
      INSERT INTO app_users (username, full_name, password_hash, role, shop_id, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        shop_id = EXCLUDED.shop_id
      `,
      [user.username, user.fullName, user.passwordHash, user.role, user.shopId]
    );
  }
  console.log('[Seed] Seeded 3 demo app users with hashed credentials.');

  // 4. Seed illustrative versioned policy rules with source notes and effective dates
  const commoditiesRes = await query(`SELECT id, code FROM commodities`);
  const commodityMap = new Map(commoditiesRes.rows.map((r: any) => [r.code, r.id]));

  const adminUserRes = await query(`SELECT id FROM app_users WHERE username = 'admin_tn' LIMIT 1`);
  const adminId = adminUserRes.rows[0]?.id;

  const policyRules = [
    {
      code: 'RICE_PHH_V1',
      version: 1,
      category: 'PHH',
      commodityCode: 'RICE',
      ruleConfig: { scale: 'PER_PERSON', quantity: 5.0, unit: 'kg', pricePerUnit: 0.0 },
      explanation: {
        en: 'PHH: 5 kg rice per person free of cost under NFSA / State scheme.',
        ta: 'முன்னுரிமை அட்டை (PHH): நபருக்கு தலா 5 கிலோ இலவச அரிசி.',
        te: 'PHH: వ్యక్తికి 5 కిలోల ఉచిత బియ్యం.',
        hi: 'PHH: प्रति व्यक्ति 5 किग्रा चावल निःशुल्क।',
      },
      sourceUrl: 'https://www.consumer.tn.gov.in/fairprice.htm',
      sourceNote: 'Tamil Nadu PDS official entitlement scale — illustrative demo rule',
    },
    {
      code: 'RICE_AAY_V1',
      version: 1,
      category: 'AAY',
      commodityCode: 'RICE',
      ruleConfig: { scale: 'PER_FAMILY', quantity: 35.0, unit: 'kg', pricePerUnit: 0.0 },
      explanation: {
        en: 'AAY: Flat 35 kg foodgrains per family per month free of cost.',
        ta: 'அந்தியோதயா அட்டை (AAY): குடும்பத்திற்கு தலா 35 கிலோ இலவச உணவு தானியங்கள்.',
        te: 'AAY: కుటుంబానికి 35 కిలోల ఉచిత ఆహార ధాన్యాలు.',
        hi: 'AAY: प्रति परिवार 35 किग्रा खाद्यान्न निःशुल्क।',
      },
      sourceUrl: 'https://www.consumer.tn.gov.in/fairprice.htm',
      sourceNote: 'Antyodaya Anna Yojana national entitlement scale',
    },
    {
      code: 'SUGAR_UNIVERSAL_V1',
      version: 1,
      category: 'PHH',
      commodityCode: 'SUGAR',
      ruleConfig: { scale: 'PER_FAMILY', quantity: 1.0, unit: 'kg', pricePerUnit: 25.0 },
      explanation: {
        en: 'Sugar: 1 kg per card per month at subsidized rate ₹25/kg.',
        ta: 'சர்க்கரை: குடும்ப அட்டைக்கு மாதம் 1 கிலோ, மானிய விலை ₹25/கிலோ.',
        te: 'చక్కెర: కార్డుకు నెలకు 1 కిలో, ₹25/కిలో.',
        hi: 'चीनी: प्रति कार्ड प्रति माह 1 किग्रा, रियायती दर ₹25/किग्रा।',
      },
      sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
      sourceNote: 'State subsidized commodity tariff',
    },
    {
      code: 'DAL_UNIVERSAL_V1',
      version: 1,
      category: 'PHH',
      commodityCode: 'TUR_DAL',
      ruleConfig: { scale: 'PER_FAMILY', quantity: 1.0, unit: 'kg', pricePerUnit: 30.0 },
      explanation: {
        en: 'Tur Dal: 1 kg per card per month at subsidized rate ₹30/kg.',
        ta: 'துவரம் பருப்பு: குடும்ப அட்டைக்கு மாதம் 1 கிலோ, மானிய விலை ₹30/கிலோ.',
        te: 'కందిపప్పు: కార్డుకు నెలకు 1 కిలో, ₹30/కిలో.',
        hi: 'अरहर दाल: प्रति कार्ड प्रति माह 1 किग्रा, ₹30/किग्रा।',
      },
      sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
      sourceNote: 'State special PDS pulse allocation',
    },
    {
      code: 'OIL_UNIVERSAL_V1',
      version: 1,
      category: 'PHH',
      commodityCode: 'PALMOLEIN_OIL',
      ruleConfig: { scale: 'PER_FAMILY', quantity: 1.0, unit: 'litre', pricePerUnit: 25.0 },
      explanation: {
        en: 'Fortified Palmolein Oil: 1 sealed litre packet at ₹25.',
        ta: 'செறிவூட்டப்பட்ட பாமாயில்: 1 லிட்டர் பாக்கெட் ₹25.',
        te: 'పామాయిల్: 1 లీటర్ ప్యాకెట్ ₹25.',
        hi: 'पामोलीन तेल: 1 लीटर पैकेट ₹25।',
      },
      sourceUrl: 'https://tncsc.tn.gov.in/en/PDS.html',
      sourceNote: 'Special PDS cooking oil distribution scheme',
    },
  ];

  for (const rule of policyRules) {
    const commodityId = commodityMap.get(rule.commodityCode);
    if (!commodityId) continue;

    await query(
      `
      INSERT INTO policy_rules (
        rule_code, version, card_category, commodity_id, rule_config, 
        explanation_i18n, source_url, source_note, verified_at, 
        valid_from, valid_to, is_demo, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), '2026-01-01', NULL, TRUE, $9)
      ON CONFLICT (rule_code, version) DO UPDATE SET
        rule_config = EXCLUDED.rule_config,
        explanation_i18n = EXCLUDED.explanation_i18n,
        source_url = EXCLUDED.source_url,
        source_note = EXCLUDED.source_note
      `,
      [
        rule.code,
        rule.version,
        rule.category,
        commodityId,
        JSON.stringify(rule.ruleConfig),
        JSON.stringify(rule.explanation),
        rule.sourceUrl,
        rule.sourceNote,
        adminId,
      ]
    );
  }
  console.log(`[Seed] Seeded ${policyRules.length} versioned policy rules.`);

  // 5. Seed initial published notices
  const notices = [
    {
      title: {
        en: 'Regular Fair Price Shop Distribution Timings',
        ta: 'நியாயவிலைக் கடை வழக்கமான விநியோக நேரங்கள்',
        te: 'రేషన్ దుకాణం సాధారణ పంపిణీ సమయాలు',
        hi: 'उचित मूल्य दुकान नियमित वितरण समय',
      },
      body: {
        en: 'Morning session: 08:30 AM to 12:30 PM. Afternoon session: 03:00 PM to 07:00 PM. First Friday of every month is a maintenance holiday.',
        ta: 'காலை நேரம்: 08:30 முதல் 12:30 வரை. மாலை நேரம்: 03:00 முதல் 07:00 வரை. ஒவ்வொரு மாதத்தின் முதல் வெள்ளிக்கிழமை பராமரிப்பு விடுமுறை.',
        te: 'ఉదయం: 08:30 నుండి 12:30 వరకు. సాయంత్రం: 03:00 నుండి 07:00 వరకు. ప్రతి నెల మొదటి శుక్రవారం సెలవు.',
        hi: 'प्रातः सत्र: 08:30 से 12:30 तक। सायंकाल सत्र: 03:00 से 07:00 तक। प्रत्येक माह का पहला शुक्रवार अवकाश।',
      },
      category: 'TIMINGS',
      status: 'PUBLISHED',
    },
    {
      title: {
        en: 'Fortified Rice Quality & Nutritional Guidelines',
        ta: 'செறிவூட்டப்பட்ட அரிசி தரம் மற்றும் ஊட்டச்சத்து வழிகாட்டுதல்கள்',
        te: 'ఫోర్టిఫైడ్ బియ్యం నాణ్యత మార్గదర్శకాలు',
        hi: 'फोर्टिफाइड चावल गुणवत्ता एवं पोषण दिशा-निर्देश',
      },
      body: {
        en: 'Food Corporation of India fortified rice grains are enriched with Iron, Folic Acid, and Vitamin B12. Beneficiaries are advised not to wash grains excessively.',
        ta: 'இந்திய உணவுக் கழகத்தால் வழங்கப்படும் செறிவூட்டப்பட்ட அரிசியில் இரும்புச்சத்து, போலிக் அமிலம் மற்றும் வைட்டமின் பி12 சேர்க்கப்பட்டுள்ளது.',
        te: 'ఫోర్టిఫైడ్ బియ్యంలో ఐరన్, ఫోలిక్ యాసిడ్ మరియు విటమిన్ బి12 ఉంటాయి.',
        hi: 'फोर्टिफाइड चावल में आयरन, फोलिक एसिड एवं विटामिन बी12 शामिल है।',
      },
      category: 'QUALITY',
      status: 'PUBLISHED',
    },
  ];

  for (const n of notices) {
    await query(
      `
      INSERT INTO notices (title_i18n, body_i18n, category, status, starts_at, created_by)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      `,
      [JSON.stringify(n.title), JSON.stringify(n.body), n.category, n.status, adminId]
    );
  }
  console.log(`[Seed] Seeded ${notices.length} published department notices.`);

  console.log('[Seed] Seeding completed successfully.');
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(async () => {
      await closeDb();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed] Fatal error:', err);
      await closeDb();
      process.exit(1);
    });
}
