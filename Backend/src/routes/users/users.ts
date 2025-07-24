import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { query } from "../../services/database.js";
import { UserIdSchema, UserSchema, UserPostType, UserPostSchema } from '../../schemas/user/userSchema.js';
import { RequestBaseSchema } from '../../schemas/requests/requestSchema.js';
import bcrypt from 'bcryptjs';

const usersRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/:id',  {
    schema: {
      tags: ['users'],
      summary: 'Ruta para obtener un usuario por ID',
      description: 'Permite obtener un usuario',
      params: UserIdSchema,
      response: {
        200: UserSchema,
        404: Type.Object({message: Type.String()}),
      }
    },
    handler: async function (request, reply){
      const {id} = request.params as { id: number };
      const res = await query (
        `SELECT * FROM users WHERE id = $1`,
        [id]
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "Usuario no encontrado" });
      }
      const user = res.rows[0];
      return user;
    }
  });

  fastify.get('/:id/sent-requests', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para obtener las solicitudes enviadas por un usuario',
      description: 'Permite obtener las solicitudes enviadas por un usuario',
      params: UserIdSchema,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: RequestBaseSchema.properties
          },
          description: "Lista de solicitudes enviadas por el usuario"
        },
        404: Type.Object({message: Type.String()})
      }
    },
    handler: async function (request, reply) {
      const { id } = request.params as { id: number };
      const res = await query(
        `SELECT * FROM requests WHERE requester_user_id = $1`,
        [id]
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "No se encontraron solicitudes enviadas por este usuario" });
      }
      return res.rows;
    }
  });

  fastify.get('/:id/received-requests', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para obtener las solicitudes recibidas por un usuario',
      description: 'Permite obtener las solicitudes recibidas por un usuario',
      params: UserIdSchema,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: RequestBaseSchema.properties
          },
          description: "Lista de solicitudes recibidas por el usuario"
        },
        404: Type.Object({message: Type.String()})
      }
    },
    handler: async function (request, reply) {
      const { id } = request.params as { id: number };
      const res = await query(
        `SELECT * FROM requests WHERE receiver_user_id = $1`,
        [id]
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ message: "No se encontraron solicitudes recibidas por este usuario" });
      }
      return res.rows;
    }
  });

  fastify.post('/register', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para registrar un usuario',
      description: "Permite a un usuario registrarse",
      body: UserPostSchema,
      response: {
        201: {
          type: "object",
          properties: UserSchema.properties,
        },
        404: { description: "Error al registrar usuario" },
      }
    },
    handler: async function (request, reply) {
      const userPost = request.body as UserPostType;
      const name = userPost.name;
      const lastname = userPost.lastname;
      const username = userPost.username;
      const email = userPost.email;
      const password = userPost.password;
      const role = userPost.role;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const res = await query(
          `INSERT INTO users (name, lastname, username, email, password, role) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [name, lastname, username, email, hashedPassword, role]
        );
        if (res.rowCount === 0) {
          reply.code(404).send({ message: "Failed to insert user" });
          return;
        }
        const id = res.rows[0].id;
        reply.code(201).send({
          id,
          name,
          lastname,
          email,
          role,
        });
      }catch (error){
        console.error("Error al registrar al usuario:", error);
        reply.code(500).send({
          message: "Error al registrar al usuario en la base de datos",
        });
      }
    }
  });
}

export default usersRoute;