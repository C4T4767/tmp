CREATE TYPE user_role AS ENUM (
  'USER',
  'ADMIN'
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  role user_role NOT NULL DEFAULT 'USER'
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER,
  image_url TEXT
);

CREATE TABLE product_analysis_histories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
