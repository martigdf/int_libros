import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { UserIdSchema, UserIdType, UserSchema, UserType } from '../../schemas/user/userSchema.js'
import { query } from '../../services/database.js'

// Mas adelante agregar verificacion de si es admin o no mediante 
// el prepasing sacando del token el id de usuario.   
const adminRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/users', {
      schema: {
        tags: ['admin'],
        summary: 'Ruta siendo admin para ver todos los usuarios',
        description: 'Admin puede ver todos los usuarios',
        response: {
          200: Type.Array(UserSchema)
        }
      },
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
      params: UserIdSchema,
      response: {
        200: UserSchema,
        404: Type.Object({ message: Type.String() })
      }
    },
    handler: async function (request, reply) {
      const { id } = request.params as UserIdType;
      const res = await query('SELECT * FROM users WHERE id = $1', [id]);

      if (res.rowCount === 0) {
        return reply.status(404).send({ message: 'Usuario no encontrado' });
      }

      return res.rows[0] as UserType;
    }
  })

  fastify.delete('/users/:id/', {
    schema: {
      tags: ['admin'],
      summary: 'Ruta para eliminar un usuario por ID',
      params: UserIdSchema,
      response: {
        200: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() })
      }
    },
    handler: async function (request, reply) {
      const { id } = request.params as UserIdType;

      const check = await query('SELECT id FROM users WHERE id = $1', [id]);
      if (check.rowCount === 0) {
        return reply.status(404).send({ message: 'Usuario no encontrado' });
      }

      await query('DELETE FROM users WHERE id = $1', [id]);
      return reply.send({ message: 'Usuario eliminado correctamente' });
    }
  })


}

export default adminRoute
