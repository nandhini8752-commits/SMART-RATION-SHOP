-- Fictional sample data for local validation only.
-- Apply only after schema.sql and only in a disposable local demo database.
-- Staff password hashes must be generated through the app seed script with Argon2id/bcrypt.
INSERT INTO shops (shop_code, name, district, taluk, locality, address, pincode, opening_hours, is_demo)
VALUES
 ('DEMO-CHN-001', 'SRQMS Demo Fair Price Shop 001', 'Chennai', 'Anna Nagar', 'Anna Nagar East', '12 Sample Street, Anna Nagar East, Chennai', '600102', '{"mon":"09:00-17:00","tue":"09:00-17:00","wed":"09:00-17:00","thu":"09:00-17:00","fri":"09:00-17:00","sat":"09:00-13:00","sun":"closed"}'::jsonb, TRUE),
 ('DEMO-CHN-002', 'SRQMS Demo Fair Price Shop 002', 'Chennai', 'Ambattur', 'Mogappair Demo Zone', '5 Example Avenue, Mogappair, Chennai', '600037', '{"mon":"09:00-17:00","tue":"09:00-17:00","wed":"09:00-17:00","thu":"09:00-17:00","fri":"09:00-17:00","sat":"09:00-13:00","sun":"closed"}'::jsonb, TRUE),
 ('DEMO-TVM-001', 'SRQMS Demo Fair Price Shop 003', 'Tiruvallur', 'Avadi Demo Taluk', 'Sample Nagar', '8 Prototype Road, Sample Nagar', '600054', '{"mon":"09:00-17:00","tue":"09:00-17:00","wed":"09:00-17:00","thu":"09:00-17:00","fri":"09:00-17:00","sat":"09:00-13:00","sun":"closed"}'::jsonb, TRUE)
ON CONFLICT (shop_code) DO NOTHING;

INSERT INTO commodities (code, name_i18n, unit)
VALUES
 ('RICE', '{"en":"Rice","ta":"அரிசி","te":"బియ్యం","hi":"चावल"}'::jsonb, 'kg'),
 ('SUGAR', '{"en":"Sugar","ta":"சர்க்கரை","te":"చక్కెర","hi":"चीनी"}'::jsonb, 'kg'),
 ('WHEAT', '{"en":"Wheat","ta":"கோதுமை","te":"గోధుమలు","hi":"गेहूँ"}'::jsonb, 'kg'),
 ('TUR_DAL', '{"en":"Tur dal","ta":"துவரம் பருப்பு","te":"కందిపప్పు","hi":"अरहर दाल"}'::jsonb, 'kg'),
 ('PALMOLEIN_OIL', '{"en":"Palmolein oil","ta":"பாமாயில்","te":"పామాయిల్","hi":"पामोलीन तेल"}'::jsonb, 'litre'),
 ('KEROSENE', '{"en":"Kerosene","ta":"மண்ணெண்ணெய்","te":"కిరోసిన్","hi":"मिट्टी का तेल"}'::jsonb, 'litre')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ration_cards (card_number, category, head_name, family_members, shop_id, locality, demo_mobile_masked, is_demo)
SELECT v.card_number, v.category::card_category, v.head_name, v.family_members, s.id, v.locality, v.demo_mobile_masked, TRUE
FROM (VALUES
 ('DEMO-TN-0001','PHH','Demo Beneficiary One',4,'Anna Nagar East','Not collected'),
 ('DEMO-TN-0002','AAY','Demo Beneficiary Two',3,'Anna Nagar East','Not collected'),
 ('DEMO-TN-0003','NPHH','Demo Beneficiary Three',5,'Anna Nagar East','Not collected'),
 ('DEMO-TN-0004','PHH','Demo Beneficiary Four',2,'Mogappair Demo Zone','Not collected'),
 ('DEMO-TN-0005','OTHER_DEMO','Demo Beneficiary Five',1,'Sample Nagar','Not collected')
) AS v(card_number,category,head_name,family_members,locality,demo_mobile_masked)
JOIN shops s ON s.shop_code = CASE WHEN v.locality = 'Mogappair Demo Zone' THEN 'DEMO-CHN-002' WHEN v.locality = 'Sample Nagar' THEN 'DEMO-TVM-001' ELSE 'DEMO-CHN-001' END
ON CONFLICT (card_number) DO NOTHING;

INSERT INTO shop_inventory (shop_id, commodity_id, quantity_available, reorder_level)
SELECT s.id, c.id,
       CASE c.code WHEN 'RICE' THEN 200 WHEN 'SUGAR' THEN 40 WHEN 'WHEAT' THEN 50 WHEN 'TUR_DAL' THEN 30 WHEN 'PALMOLEIN_OIL' THEN 40 ELSE 20 END,
       CASE c.code WHEN 'RICE' THEN 30 WHEN 'SUGAR' THEN 8 ELSE 5 END
FROM shops s CROSS JOIN commodities c
WHERE s.is_demo = TRUE
ON CONFLICT (shop_id,commodity_id) DO NOTHING;

INSERT INTO queue_counters (shop_id, counter_no, display_name)
SELECT s.id, x.counter_no, 'Counter ' || x.counter_no::text
FROM shops s CROSS JOIN (VALUES (1),(2)) AS x(counter_no)
WHERE s.is_demo = TRUE
ON CONFLICT (shop_id,counter_no) DO NOTHING;

-- Intentionally no seeded entitlement quantities or official prices. Configure illustrative demo rules in the admin UI,
-- label them as demo policy, and include the source note/effective date before showing them.
