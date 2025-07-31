import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { UserIdSchema, UserIdType, UserSchema, UserType } from '../../schemas/user/userSchema.js'
import { query } from '../../services/database.js';
import { BookIdType } from '../../schemas/book/bookSchema.js';

// Mas adelante agregar verificacion de si es admin o no mediante 
// el prepasing sacando del token el id de usuario.   
const adminRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {

  fastify.get('/users', {
      schema: {
        tags: ['admin'],
        summary: 'Ruta siendo admin para ver todos los usuarios',
        description: 'Admin puede ver todos los usuarios',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'array',
            params: UserSchema,
            description: "Lista de todos los usuarios registrados"
          },
        }
      },
      onRequest: fastify.verifyAdmin,
      handler: async function (request, reply) {
        const res = await query('SELECT * FROM users');
        return res.rows as UserType[];
      }
  });

  fastify.get('/users/:id', {
    schema: {
      tags: ['admin'],
      summary: 'Ruta para obtener un usuario por ID',
      description: 'Obtener un solo usuario mediante ID',
      security: [{ bearerAuth: [] }],
      params: UserIdSchema,
      response: {
        200: UserSchema,
        404: Type.Object({ message: Type.String() })
      }
    },
    onRequest: fastify.verifyAdmin,
    handler: async function (request, reply) {

      const { id } = request.params as UserIdType;
      const res = await query('SELECT * FROM users WHERE id = $1', [id]);

      if (res.rowCount === 0) {
        return reply.status(404).send({ message: 'Usuario no encontrado' });
      }

      return res.rows[0] as UserType;
    }
  });

  fastify.delete('/users/:id', {
    schema: {
      tags: ['admin'],
      summary: 'Ruta para eliminar un usuario por ID',
      security: [{ bearerAuth: [] }],
      params: UserIdSchema,
      response: {
        200: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() })
      }
    },
    onRequest: fastify.verifySelfOrAdmin,
    handler: async function (request, reply) {
      const { id } = request.params as UserIdType;

      const check = await query('SELECT id FROM users WHERE id = $1', [id]);
      if (check.rowCount === 0) {
        return reply.status(404).send({ message: 'Usuario no encontrado' });
      }
      await query(`
      WITH deleted_requests_books AS (
        DELETE FROM requests_books
        WHERE id_request IN (
          SELECT id FROM requests WHERE sender_user_id = $1 OR receiver_user_id = $1
        )
      ),
      deleted_requests AS (
        DELETE FROM requests
        WHERE sender_user_id = $1 OR receiver_user_id = $1
        RETURNING id
      ),
      deleted_books AS (
        DELETE FROM books
        WHERE owner_id = $1
      )
      DELETE FROM users WHERE id = $1;
    `, [id]);

      return reply.send({ message: 'Usuario eliminado correctamente' });
    }
  });

  fastify.delete('/books/:id', {
        schema: {
        tags: ['admin'],
        summary: "Ruta para eliminar un libro por ID",
        description: "Elimina un libro por su ID",
        security: [{ bearerAuth: [] }],
        params: {
            type: 'object',
            properties: {
                id: { type: 'string' }
            },
            required: ['id']
        }
        },
        onRequest: fastify.verifyAdmin,
        handler: async (request, reply) => {
        
          const { id } = request.params as BookIdType;

          const check = await query('SELECT id FROM books WHERE id = $1', [id]);
          if (check.rowCount === 0) {
            return reply.status(404).send({ message: 'Libro no encontrado' });
          }

          await query('DELETE FROM books WHERE id = $1', [id]);
         
          return reply.send({ message: 'Libro eliminado correctamente' });
          
        }
  });

}

export default adminRoutes
