import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
//import { query } from "../../services/database.js";
import { join } from 'path';
import multipart from '@fastify/multipart'
import { MultipartFile } from '@fastify/multipart';
import { readFile, writeFile } from 'fs/promises';
import { BookIdSchema } from '../../schemas/book/bookSchema.js';
import { UserIdSchema } from '../../schemas/user/userSchema.js';
import { query } from '../../services/database.js';
//import { WebSocket } from 'ws'

const photoRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {

    fastify.register(multipart, {
        limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 10,         // Max number of non-file fields
        fileSize: 1000000,  // For multipart forms, the max file size in bytes
        files: 1,           // Max number of file fields
        headerPairs: 2000,  // Max number of header key=>value pairs
        parts: 1000         // For multipart forms, the max number of parts (fields + files)
        }
    });


    fastify.put('/users/:id', {
        schema: {
            tags: ['photos'],
            summary: 'Ruta para modificar la foto de perfil',
            description: "Permite a un usuario modificar su foto de perfil",
            params: UserIdSchema,
            response: {
                201: Type.Object({ message: Type.String() }),
                403: Type.Object({ message: Type.String() }),
                404: Type.Object({ message: Type.String() })
            }
        },
        handler: async function (request, reply) {  
            
            await request.jwtVerify();
            
            const { id } = request.params as { id: number };

            const { id: userId } = request.user as { id: number };

            if (id !== userId) {

                return reply.status(403).send({ message: "No tienes permiso para modificar esta foto" });

            }

            const userExists = await query(
                    
                `SELECT * FROM users WHERE id = $1`,
                [id]

            )

            if (userExists.rowCount === 0) {
                
                return reply.status(404).send({ message: "No existe el usuario" });
            
            }

            const data: MultipartFile | undefined = await request.file();
            
            if (!data) {

                throw new Error("No se pudo acceder al archivo")

            }

            const baseDir = process.cwd();

            console.log({baseDir})

            const savePath = join(
                baseDir,
                "public",
                "users",
                "photos",
                id + ".jpg"
            );

            console.log({savePath})

            const buffer = await data.toBuffer();

            await writeFile(savePath, buffer);

            //const socket = fastify.userSockets.get(userId);

            //console.log(userId, socket)

            //if (socket && socket.readyState === WebSocket.OPEN) {
                
            //    socket.send("userPhoto");
            
            //}

        }
    });

    fastify.get('/users/:id', {
        schema: {
            tags: ['photos'],
            summary: 'Ruta para obtener la foto de perfil',
            description: "Permite a obtener la foto de perfil del usuario",
            params: UserIdSchema
            //Agregar response
        },
        handler: async function (request, reply) {

            const { id } = request.params as { id: number };

            //Corroborar usuario y foto
        
            reply.type('image/jpeg');

            const baseDir = process.cwd();

            const photoPath = join(baseDir, "public", "users", "photos", id + '.jpg');
            const fallbackPath = join(baseDir, "public", "users", "photos", "default.jpg");

            try {
   
                const buffer = await readFile(photoPath);
                return buffer;
            
            } catch (err) {
                
                try {
                    
                    const defaultBuffer = await readFile(fallbackPath);
                    return defaultBuffer;

                } catch (fallbackErr) {
                    
                    reply.code(404).send({ error: "No existe foto del usuario ni foto por defecto" });
                }

            }

        }
    });

    fastify.put('/books/:id', {
        schema: {
            tags: ['photos'],
            summary: 'Ruta para modificar la foto del libro',
            description: "Permite a un usuario modificar la foto de un libro que haya publicado",
            params: BookIdSchema,
            response: {
                201: { description: "Foto modificada correctamente" },
                404: { description: "Error al encontrar el libro" },
            }
        },
        handler: async function (request, reply) {

            await request.jwtVerify();

            const { id: bookId } = request.params as { id: number };

            const { id: userId } = request.user as { id: number };

            //Corroborar libro y que el usuario es dueño del libro
            
            const userOwnsBook = await query(
                
                `SELECT * FROM books WHERE id = $1 AND owner_id = $2`,
                [bookId, userId]

            )

            if (userOwnsBook.rowCount === 0) {
                
                return reply.status(403).send({ message: "No tienes permiso para modificar esta foto" });
            
            }

            const data: MultipartFile | undefined = await request.file();
            
            if (!data) {

                throw new Error("No se pudo acceder al archivo")

            }

            const baseDir = process.cwd();
            
            console.log({baseDir})

            const savePath = join(
                baseDir,
                "public",
                "books",
                "photos",
                bookId + ".jpg"
            );

            console.log({savePath})

            const buffer = await data.toBuffer();

            await writeFile(savePath, buffer);

        }
    });

    fastify.get('/books/:id', {
        schema: {
            tags: ['photos'],
            summary: 'Ruta para obtener la foto del libro',
            description: "Permite a obtener la foto de un libro publicado",
            params: BookIdSchema
            //Agregar response
        },
        handler: async function (request, reply) {
        
            const { id } = request.params as { id: number };

            //Corroborar libro y foto
        
            reply.type('image/jpeg');

            const baseDir = process.cwd();

            const photoPath = join(baseDir, "public", "books", "photos", id + '.jpg');
            const fallbackPath = join(baseDir, "public", "books", "photos", "default.jpg");

            try {
   
                const buffer = await readFile(photoPath);
                return buffer;
            
            } catch (err) {
                
                try {
                    
                    const defaultBuffer = await readFile(fallbackPath);
                    return defaultBuffer;

                } catch (fallbackErr) {
                    
                    reply.code(404).send({ error: "No existe foto del libro ni foto por defecto" });
                }

            }

        }
    });

}

export default photoRoutes;