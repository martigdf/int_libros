CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    lastname TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'user')) NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    state VARCHAR(15) CHECK (
        state IN (
            'available',
            'unavailable'
        )
    ) NOT NULL,
    creation_date TIMESTAMP DEFAULT NOW() NOT NULL,
    location TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Agregamos esta tabla para que exista una relacion N:M correcta
CREATE TABLE IF NOT EXISTS books_genres (
    id_book INTEGER REFERENCES books(id),
    id_genre INTEGER REFERENCES genres(id),
    PRIMARY KEY (id_book, id_genre)
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    creation_date TIMESTAMP DEFAULT NOW() NOT NULL,
    state VARCHAR(20) CHECK (
        state IN (
            'pending',
            'accepted',
            'declined', 
            'completed',
            'cancelled'
        )
    ) NOT NULL,
    sender_user_id INTEGER REFERENCES users(id),
    receiver_user_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS requests_books (
    id_request INTEGER REFERENCES requests(id),
    id_book INTEGER REFERENCES books(id),
    PRIMARY KEY (id_request, id_book)
);

CREATE TABLE IF NOT EXISTS loans (
    id_request INTEGER PRIMARY KEY REFERENCES requests(id),
    date_loan TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS returns (
    id_request INTEGER PRIMARY KEY REFERENCES requests(id),
    opinion TEXT NOT NULL,
    calification INTEGER CHECK (calification BETWEEN 1 AND 5)
);

INSERT INTO users (name, lastname, username, email, role, password) VALUES 
    ('Jorge', 'Melnik', 'melnik_1','jorgemelnik@gmail.com', 'admin', crypt('contraseña', gen_salt('bf'))),
    ('Martina', 'Guzmán', 'marti_42', 'martina@gmail.com', 'user', crypt('contraseña', gen_salt('bf'))),
    ('Luis', 'Di Muro', 'luis_89', 'luis@gmail.com', 'user', crypt('contraseña', gen_salt('bf'))),
    ('Carlitos', 'Tave', 'carlito_89', 'carlito@gmail.com', 'user', crypt('contraseña', gen_salt('bf'))),
    ('Ana', 'Pérez', 'ana_admin', 'ana.perez@gmail.com', 'admin', crypt('contraseña', gen_salt('bf')))
;

INSERT INTO books (name, author, description, state, creation_date, location, owner_id) VALUES
  ('1984', 'George Orwell', 'Este libro se encuentra con ausencia de paginas', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('The Hobbit', 'J.R.R. Tolkien', 'Esta en delicadas condiciones tratar bien', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('Dune', 'Frank Herbert', 'Debe ser tratado con amor', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('El Principito', 'Antoine de Saint-Exupéry', 'Es para una lectura rapida pero sabia', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('Harry Potter', 'J.K. Rowling', 'Libro en excelente estado', 'available', CURRENT_TIMESTAMP, 'Localización 2', 2),
  ('Crónica de una muerte anunciada', 'Gabriel García Márquez', 'Novela clásica latinoamericana', 'available', CURRENT_TIMESTAMP, 'Localización 2', 2);

INSERT INTO genres (name) VALUES
  ('Drama'),     
  ('Aventura'),        
  ('Romance'),        
  ('Misterio'),       
  ('Histórico'),     
  ('Terror'),      
  ('Biografía'),       
  ('Poesía');


INSERT INTO books_genres (id_book, id_genre) VALUES
-- 1984
(1, 1), (1, 5),
-- The Hobbit
(2, 2), (2, 6),
-- Dune
(3, 1), (3, 8),
-- El Principito
(4, 4), (4, 3),
-- Harry Potter
(5, 2), (5, 8),
-- Crónica de una muerte anunciada
(6, 3), (6, 5);