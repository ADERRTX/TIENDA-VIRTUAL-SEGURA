SELECT (SELECT count(*) FROM "user") AS users,
       (SELECT count(*) FROM seller) AS sellers,
       (SELECT count(*) FROM category) AS cats,
       (SELECT count(*) FROM product) AS products,
       (SELECT count(*) FROM variant) AS variants,
       (SELECT count(*) FROM "order") AS orders,
       (SELECT count(*) FROM refund) AS refunds,
       (SELECT count(*) FROM audit_log) AS audits;
SELECT tgname FROM pg_trigger WHERE NOT tgisinternal;
