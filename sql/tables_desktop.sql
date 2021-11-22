DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    avatar VARCHAR(128),
    username VARCHAR(64) NOT NULL,
    facebook_id VARCHAR(64) UNIQUE,
    google_id VARCHAR(64)UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS decks CASCADE;
CREATE TABLE decks(
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT,
    deck_name VARCHAR(32) NOT NULL UNIQUE,
    kingdom SMALLINT NOT NULL DEFAULT 0,
    num_cards SMALLINT NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS edens;
CREATE TABLE edens(
    deck_id INT,
    card_id INT,
    qty INT,
    PRIMARY KEY(deck_id, card_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS registers;
CREATE TABLE registers(
    deck_id INT,
    card_id INT,
    qty INT,
    PRIMARY KEY(deck_id, card_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS holy_books;
CREATE TABLE holy_books(
    deck_id INT,
    card_id INT,
    qty INT,
    PRIMARY KEY(deck_id, card_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS types;
CREATE TABLE types(
    id INT,
    lang VARCHAR(5),
    type_name VARCHAR(16),
    PRIMARY KEY(id, lang)
);

DROP TABLE IF EXISTS rarities;
CREATE TABLE rarities(
    id INT,
    lang VARCHAR(5),
    raritie_name VARCHAR(16),
    PRIMARY KEY(id, lang)
);

DROP TABLE IF EXISTS kingdoms;
CREATE TABLE kingdoms(
    id INT,
    lang VARCHAR(5),
    kingdom_name VARCHAR(32),
    short_name VARCHAR(8),
    PRIMARY KEY(id, lang)
);

DROP TABLE IF EXISTS extensions;
CREATE TABLE extensions(
    id INT,
    lang VARCHAR(5),
    extension_name VARCHAR(32),
    short_name VARCHAR(8),
    PRIMARY KEY(id, lang)
);

CREATE OR REPLACE FUNCTION update_decks_qty() RETURNS TRIGGER AS $$
BEGIN
UPDATE decks SET num_cards = (SELECT SUM(qty) FROM (
SELECT SUM(qty) FROM edens AS e WHERE e.deck_id = OLD.deck_id
UNION ALL
SELECT SUM(qty) FROM registers AS r WHERE r.deck_id = OLD.deck_id
UNION ALL
SELECT SUM(qty) FROM holy_books AS h WHERE h.deck_id = OLD.deck_id 
) AS sub
) WHERE decks.id = OLD.deck_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_decks
AFTER UPDATE OR INSERT OR DELETE
ON edens
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

CREATE TRIGGER trigger_update_decks
AFTER UPDATE OR INSERT OR DELETE
ON registers
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

CREATE TRIGGER trigger_update_decks
AFTER UPDATE OR INSERT OR DELETE
ON holy_books
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

GRANT SELECT, INSERT, DELETE, UPDATE, TRUNCATE, TRIGGER ON users, decks, edens, holy_books, registers, types, rarities, kingdoms, extensions TO pablo;