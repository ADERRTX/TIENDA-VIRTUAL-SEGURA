process.env['DATABASE_URL'] =
  process.env['DATABASE_URL'] ||
  'postgresql://tvs_user:tvs_dev_password_2026@127.0.0.1:5433/tienda_virtual_segura_test?schema=public';
process.env['NODE_ENV'] = 'test';
process.env['CORS_ORIGINS'] = 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173';
process.env['JWT_SECRET'] =
  process.env['JWT_SECRET'] || 'test_jwt_secret_super_secure_32_characters_long!';
