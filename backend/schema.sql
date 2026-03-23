-- SNAP Database Schema
-- Run this in Neon SQL Editor to set up tables

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    tier VARCHAR(10) DEFAULT 'free' CHECK (tier IN ('free', 'pro'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_links_user_id_created ON links(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);

CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT now(),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(10) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id_clicked_at ON clicks(link_id, clicked_at);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_suffix VARCHAR(4) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
