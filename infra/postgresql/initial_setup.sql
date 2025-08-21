-- Create user
DO
$do$
    BEGIN
        IF NOT EXISTS (SELECT
                       FROM pg_catalog.pg_roles
                       WHERE rolname = 'sysvisual') THEN
            CREATE ROLE sysvisual LOGIN PASSWORD 'strong_password';
        END IF;
    END
$do$;

-- Create Schema
CREATE SCHEMA IF NOT EXISTS sysvisual;
ALTER SCHEMA sysvisual OWNER TO sysvisual;

-- Create tables
CREATE TABLE IF NOT EXISTS sysvisual.users
(
    id       VARCHAR PRIMARY KEY,
    email    VARCHAR UNIQUE,
    password VARCHAR
);
CREATE TABLE IF NOT EXISTS sysvisual.projects
(
    id              VARCHAR PRIMARY KEY,
    subscription_id VARCHAR,
    name            VARCHAR
);
CREATE TABLE IF NOT EXISTS sysvisual.subscriptions
(
    id          VARCHAR PRIMARY KEY,
    name        VARCHAR,
    cost        INT,
    description VARCHAR
);
CREATE TABLE IF NOT EXISTS sysvisual.payments
(
    id                  VARCHAR PRIMARY KEY,
    project_id          VARCHAR,
    subscription_id     VARCHAR,
    authorization_token VARCHAR
);
CREATE TABLE IF NOT EXISTS sysvisual.extensions
(
    id             VARCHAR PRIMARY KEY,
    author_project VARCHAR,
    name           VARCHAR UNIQUE,
    description    VARCHAR,
    price          INT,
    category       VARCHAR
);
CREATE TABLE IF NOT EXISTS sysvisual.extension_categories
(
    id          VARCHAR PRIMARY KEY,
    name        VARCHAR UNIQUE,
    description VARCHAR
);

-- Grant permissions
GRANT USAGE ON SCHEMA sysvisual TO sysvisual;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sysvisual TO sysvisual;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sysvisual TO sysvisual;

ALTER DEFAULT PRIVILEGES FOR ROLE sysvisual IN SCHEMA sysvisual
    GRANT SELECT ON SEQUENCES TO sysvisual;

ALTER DEFAULT PRIVILEGES FOR ROLE sysvisual IN SCHEMA sysvisual
    GRANT USAGE, SELECT ON SEQUENCES TO sysvisual;

-- Seed data
INSERT INTO sysvisual.extension_categories (id, name, description) VALUES
    (gen_random_uuid(), 'Feature', 'Extensions that add more functionality to your project.'),
    (gen_random_uuid(), 'Service', 'Service offers for your project.')
ON CONFLICT (name) DO NOTHING;
