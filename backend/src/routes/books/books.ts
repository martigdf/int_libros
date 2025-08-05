import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { query } from "../../services/database.js";
import { BookIdSchema, BookPostSchema, BookPostType, BookSchema } from '../../schemas/book/bookSchema.js';
import { UserType } from '../../schemas/user/userSchema.js';
import { GenresResponseSchema } from '../../schemas/book/bookSchema.js';
import { WebSocket } from 'ws';

const bookRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {

  fastify.get('/', {
    schema: {
      tags: ['books'],
      summary: "Ruta para listar todos los libros publicados",
      description: "Muestra todos los libros publicados",
      response: {
        //Devolver lista de libros
        200: Type.Array(BookSchema, {
          description: "Lista de libros publicados"
        }),
        404: Type.Object({ message: Type.String() }),
      }
    },
  handler: async (request, reply) => {
      const res = await query (
        `SELECT b.id, b.name, b.author, b.description, b.state, b.location, b.owner_id,
          COALESCE(array_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '{}') AS genres
        FROM books b
        LEFT JOIN books_genres bg ON b.id = bg.id_book
        LEFT JOIN genres g ON g.id = bg.id_genre
        GROUP BY b.id`
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "No hay ningún libro publicado" });
      }
      const all_books = res.rows;
      return all_books;
    }
  });

  fastify.get('/:id', {
    schema: {
      tags: ['books'],
      summary: "Ruta para obtener un libro por ID",
      description: "Permite al usuario obtener los datos de un libro por su ID",
      params: BookIdSchema,
      response: {
        200: BookSchema,
        404: Type.Object({message: Type.String()}),
      }
    },
    handler: async (request, reply) => {
      const {id} = request.params as { id: number };
      const res = await query (
        `SELECT b.id, b.name, b.author, b.description, b.state, b.location, b.owner_id,
          COALESCE(array_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '{}') AS genres
        FROM books b
        LEFT JOIN books_genres bg ON b.id = bg.id_book
        LEFT JOIN genres g ON g.id = bg.id_genre
        WHERE b.id = $1
        GROUP BY b.id`,
        [id]
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "Libro no encontrado" });
      }
      const book = res.rows[0];
      return book;
    }
  });

  fastify.get('/my-books', {
    schema: {
      tags: ['books'],
      summary: "Ruta para mostrar todos los libros publicados por el usuario",
      description: "Muestra los libros que hayan sido publicados por el usuario",
      response: {
        200: {
          type: 'array',
          params: BookSchema,
          description: "Lista de libros publicados por el usuario"
        },
        401: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() }),
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      
      await request.jwtVerify();
            
      const user = request.user as UserType;

      const res = await query(
        `SELECT b.id, b.name, b.author, b.description, b.state, b.location, b.owner_id,
          COALESCE(array_agg(g.name) FILTER (WHERE g.name IS NOT NULL), '{}') AS genres
        FROM books b
        LEFT JOIN books_genres bg ON b.id = bg.id_book
        LEFT JOIN genres g ON g.id = bg.id_genre
        WHERE b.owner_id = $1
        GROUP BY b.id
        `,
        [user.id]
      );

      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "No hay ningún libro publicado por el usuario" });
      }

      return res.rows;
      
    }
  });

  fastify.post('/publish', {
    schema: {
      tags: ['books'],
      summary: "Ruta para publicar un nuevo libro",
      description: "Permite al usuario publicar un libro y asociarlo a un genero",
      body: BookPostSchema,
      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" },
            bookId: { type: "number" }
          }
        },
        404: {
          description: "Error al publicar libro",
          type: "object",
          properties: {
            message: { type: "string" }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async function (request, reply) {
      try {
        await request.jwtVerify();

        const user = request.user as { id: number };
        const { name, description, author, genres, location } = request.body as BookPostType;
        const state = 'available';

        // Validar que todos los campos requeridos estén presentes
        if (!name || !description || !location || !author || !genres?.length) {
          return reply.status(400).send({ message: "Todos los campos son obligatorios" });
        }

        const res = await query(
          `INSERT INTO books (name, author, description, state, location, owner_id) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [name, author, description, state, location, user.id]
        );

        const bookId = res.rows[0].id;

        for (const genreId of genres) {
          await query(`INSERT INTO books_genres (id_book, id_genre) VALUES ($1,$2)`, [bookId, genreId]);
        }

        fastify.websocketServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("books");
          }
        });

        reply.code(201).send({
          message: 'Libro publicado correctamente',
          bookId: res.rows[0].id
        });
      } catch (error) {
        console.error("Error al publicar el libro:", error);
        reply.status(500).send({ message: "Error al publicar el libro" });
      }
    }
  })

  fastify.delete('/:id', {
    schema: {
      tags: ['books'],
      summary: "Eliminar un libro publicado por el usuario autenticado",
      description: "Permite a un usuario eliminar uno de sus libros publicados. Solo el propietario puede eliminarlo.",
      params: BookIdSchema,
      response: {
        200: Type.Object({ message: Type.String() }),
        401: Type.Object({ message: Type.String() }),
        403: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() })
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        await request.jwtVerify();

        const user = request.user as UserType;
        const { id } = request.params as { id: number };

        // Verifica que el libro pertenece al usuario
        const check = await query(
          `SELECT id
           FROM books
           WHERE id = $1 AND owner_id = $2`,
          [id, user.id]
        );

        if (check.rowCount === 0) {
          return reply.status(403).send({ message: "No tienes permiso para eliminar este libro o no existe" });
        }

        // Elimina registros relacionados (FK con books_genres, etc.)
        await query(`DELETE FROM books_genres WHERE id_book = $1`, [id]);
        await query(`DELETE FROM books WHERE id = $1`, [id]);

        return reply.status(200).send({ message: "Libro eliminado correctamente" });
      } catch (error) {
        console.error("Error al eliminar libro:", error);
        return reply.status(500).send({ message: "Error interno al eliminar el libro" });
      }
    }
  });


  fastify.get('/genres', {
    schema: {
      tags: ['genres'],
      summary: 'Obtener todos los géneros',
      response: { 200: GenresResponseSchema }
    },
    handler: async () => {
      const res = await query('SELECT id, name FROM genres ORDER BY name');
      return res.rows;
    }
  });
};

export default bookRoutes