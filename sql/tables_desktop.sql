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
    cards TEXT[][],
    qty INT,
    PRIMARY KEY(deck_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS registers;
CREATE TABLE registers(
    deck_id INT,
    cards TEXT[][],
    qty INT,
    PRIMARY KEY(deck_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS holy_books;
CREATE TABLE holy_books(
    deck_id INT,
    cards TEXT[][],
    qty INT,
    PRIMARY KEY(deck_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_decks_qty() RETURNS TRIGGER AS $$
BEGIN
UPDATE decks SET num_cards = (SELECT SUM(qty) FROM (
SELECT qty FROM edens AS e WHERE e.deck_id = OLD.deck_id
UNION ALL
SELECT qty FROM registers AS r WHERE r.deck_id = OLD.deck_id
UNION ALL
SELECT qty FROM holy_books AS h WHERE h.deck_id = OLD.deck_id 
) AS sub
) WHERE decks.id = OLD.deck_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_decks
AFTER UPDATE
ON edens
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

CREATE TRIGGER trigger_update_decks
AFTER UPDATE
ON registers
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

CREATE TRIGGER trigger_update_decks
AFTER UPDATE
ON holy_books
FOR EACH ROW
EXECUTE PROCEDURE update_decks_qty();

GRANT SELECT, INSERT, DELETE, UPDATE, TRIGGER ON users, decks, edens, holy_books, registers TO pablo;