CREATE TABLE IF NOT EXISTS "users"
(
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(64)  NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    avatar              VARCHAR(64),
    password            TEXT,
    roles               SMALLINT[]   NOT NULL,
    phone               CHAR(11),
    access_token        TEXT,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications  BOOLEAN DEFAULT TRUE
);

CREATE INDEX user_email ON "users" (email);
CREATE INDEX user_name ON "users" (name);