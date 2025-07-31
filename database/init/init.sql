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
            'cancelled'
        )
    ) NOT NULL,
    sender_user_id INTEGER REFERENCES users(id),
    receiver_user_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS requests_books (
    request_id INTEGER REFERENCES requests(id),
    id_book INTEGER REFERENCES books(id),
    PRIMARY KEY (request_id, id_book)
);

CREATE TABLE IF NOT EXISTS loans (
    request_id INTEGER PRIMARY KEY REFERENCES requests(id),
    date_loan TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS returns (
    request_id INTEGER PRIMARY KEY REFERENCES requests(id),
    opinion TEXT NOT NULL,
    calification INTEGER CHECK (calification BETWEEN 1 AND 5)
);

INSERT INTO users (name, lastname, username, email, role, password) VALUES 
    ('Jorge', 'Melnik', 'melnik_1','jorgemelnik@gmail.com', 'admin', crypt('contraseña', gen_salt('bf'))),
    ('Martina', 'Guzmán', 'marti_42', 'martina@gmail.com', 'user', crypt('contraseña', gen_salt('bf'))),
    ('Luis', 'Di Muro', 'luis_89', 'luis@gmail.com', 'user', crypt('contraseña', gen_salt('bf'))),
    ('Lucas', 'Rodriguez', 'luquitas_77', 'lucas@gmail.com', 'user', crypt('contraseña', gen_salt('bf')))
;

INSERT INTO books (name, author, description, state, creation_date, location, owner_id) VALUES
  ('1984', 'George Orwell', 'Este libro se encuentra con ausencia de paginas', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('The Hobbit', 'J.R.R. Tolkien', 'Esta en delicadas condiciones tratar bien', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('Dune', 'Frank Herbert', 'Debe ser tratado con amor', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('El Principito', 'Antoine de Saint-Exupéry', 'Es para una lectura rapida pero sabia', 'available', CURRENT_TIMESTAMP, 'Localización 1', 1),
  ('Harry Potter', 'J.K. Rowling', 'Libro en excelente estado', 'available', CURRENT_TIMESTAMP, 'Localización 2', 2),
  ('Crónica de una muerte anunciada', 'Gabriel García Márquez', 'Novela clásica latinoamericana', 'available', CURRENT_TIMESTAMP, 'Localización 2', 2);

INSERT INTO genres (name) VALUES
  ('Science Fiction'),
  ('Fantasy'),
  ('Classic'),
  ('Children');

  INSERT INTO requests (creation_date, state, sender_user_id, receiver_user_id) VALUES
  (CURRENT_TIMESTAMP, 'pending', 3, 1),   -- Luis → Jorge
  (CURRENT_TIMESTAMP, 'accepted', 2, 1),  -- Martina → Jorge
  (CURRENT_TIMESTAMP, 'declined', 4, 1),   -- Lucas → Jorge
  (CURRENT_TIMESTAMP, 'pending', 1, 2),   -- Jorge → Martina
  (CURRENT_TIMESTAMP, 'accepted', 3, 2),  -- Luis → Martina
  (CURRENT_TIMESTAMP, 'declined', 4, 2);  -- Lucas → Martina

  INSERT INTO requests_books (id_request, id_book) VALUES
    -- Solicitudes dirigidas a Jorge (usuario 1) - sus libros son 1,2,3,4
    (1, 1),  -- Luis pide "1984" a Jorge
    (1, 2),  -- Luis pide "The Hobbit" a Jorge
    (2, 3),  -- Martina pide "Dune" a Jorge
    (3, 1),  -- Lucas pide "1984" a Jorge
    -- Solicitudes dirigidas a Martina (usuario 2) - sus libros son 5,6
    (4, 5),  -- Jorge pide "Harry Potter" a Martina
    (4, 6),  -- Jorge pide "Crónica de una muerte anunciada" a Martina
    (5, 5),  -- Luis pide "Harry Potter" a Martina
    (6, 6); 