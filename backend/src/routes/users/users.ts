import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { query } from "../../services/database.js";
import { UserIdSchema, UserSchema, UserPostType, UserPostSchema, UserPutType, UserPutSchema } from '../../schemas/user/userSchema.js';
import { RequestSchema } from '../../schemas/requests/requestSchema.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MultipartFile } from '@fastify/multipart';
import { writeFile } from 'fs/promises';

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
    onRequest: fastify.verifySelfOrAdmin,
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

  fastify.put('/:id', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para actualizar un usuario',
      description: 'Permite actualizar los datos de un usuario existente, usuario propio o admin.',
      params: UserIdSchema,
      body: UserPutSchema,
      response: {
        200: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() }),
        500: Type.Object({ message: Type.String() }),
      }
    },
    //onRequest: fastify.verifySelfOrAdmin,
    handler: async function (request, reply) {
      const { id } = request.params as { id: number };
      const userUpdate = request.body as UserPutType;

      try {
        if (userUpdate.password) {
          userUpdate.password = await bcrypt.hash(userUpdate.password, 10);
        }

        const fields = Object.keys(userUpdate);
        if (fields.length === 0) {
          return reply.status(400).send({ message: "No se enviaron datos para actualizar" });
        }

        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = Object.values(userUpdate);

        const res = await query(
          `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`,
          [...values, id]
        );

        if (res.rowCount === 0) {
          return reply.status(404).send({ message: "Usuario no encontrado" });
        }

        reply.code(200).send({ message: "Usuario actualizado correctamente" });

      } catch (err) {
        console.error("Error al actualizar usuario:", err);
        reply.code(500).send({ message: "Error interno al actualizar usuario" });
      }
    }
  });


  fastify.get('/all', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para obtener todos los usuarios',
      description: 'Devuelve una lista con todos los usuarios registrados',
      response: {
        200: Type.Array(UserSchema)
      }
    },
    handler: async function (request, reply) {
      const res = await query(`SELECT * FROM users`);
      console.log("Usuarios:", res.rows);
      return res.rows;
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
            properties: RequestSchema.properties
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
            properties: RequestSchema.properties
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
        
        //fastify.websocketServer.clients.forEach( (cliente) => {
          //cliente.send("usuario");
        //});

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

  fastify.put('/photo', {
    schema: {
      tags: ['users'],
      summary: 'Ruta para modificar la foto de usuario',
      description: "Permite a un usuario modificar su foto de perfil",
      params: Type.Object({ id_user: Type.Integer() }),
      //body:
      response: {
        201: { description: "Foto modificada correctamente" },
        404: { description: "Error al registrar usuario" },
      }
    },
    handler: async function (request, reply) {
      
      const data: MultipartFile | undefined = await request.file();

      if (!data) {

        throw new Error("No se pudo acceder al archivo")

      }

      const __filename = fileURLToPath(import.meta.filename);
      const __dirname = dirname(__filename);
      const baseDir = process.cwd();

      console.log({__dirname, __filename, baseDir})

      const savePath = join(
        baseDir,
        "public",
        "usuarios",
        "fotos",
        request.params.id_user + ".jpg"
      );

      console.log({savePath})

      const buffer = await data.toBuffer();

      await writeFile(savePath, buffer);

    }
  });

}

export default usersRoute;