import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { query } from '../../services/database.js';
import { RequestIdSchema, RequestPostSchema, RequestSchema } from '../../schemas/requests/requestSchema.js';
import { Type } from '@sinclair/typebox';
import { RequestRepository } from '../../services/request.repository.js';

const requestsRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {

  fastify.post('/', {
    schema: {
      tags: ['requests'],
      summary: 'Crear una nueva solicitud de préstamo',
      description: 'Permite al usuario crear una solicitud de préstamo para uno o más libros.',
      body: RequestPostSchema,
      response: {
        201: Type.Object({ message: Type.String(), requestId: Type.Number() }),
        400: Type.Object({ message: Type.String() })
      }
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { receiver_user_id, books } = request.body;
        const sender = request.user as { id: number };
        const newReq = await RequestRepository.createRequest(sender.id, receiver_user_id, books);
        
        return reply.code(201).send({ message: 'Solicitud creada correctamente', requestId: newReq.id_request });

      } catch (err) {
        request.log.error(err);
        return reply.code(400).send({ message: 'Error al crear la solicitud' });
      }
    }
  });

  fastify.get('/sent', {
    schema: {
      tags: ['requests'],
      summary: 'Listar mis solicitudes',
      description: 'Devuelve una lista de solicitudes enviadas por el usuario autenticado.',
      response: { 200: Type.Array(RequestSchema), 
        400: Type.Object({ message: Type.String() })
      }
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const sender = request.user as { id: number };

        const requests = await RequestRepository.getSentRequests(sender.id);
        return requests;
      } catch (err) {
        request.log.error(err);
        return reply.code(400).send({ message: 'Error al obtener las solicitudes enviadas' });
      }
    }
  });

  fastify.get('/received', {
    schema: {
      tags: ['requests'],
      summary: 'Listar solicitudes recibidas',
      description: 'Devuelve una lista de solicitudes recibidas para los libros publicados por el usuario autenticado.',
      response: { 200: Type.Array(RequestSchema),
        400: Type.Object({ message: Type.String() })
      }
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const receiver = request.user as { id: number };

        const received = await RequestRepository.getReceivedRequests(receiver.id);
        return reply.send(received);
      } catch (err) {
        request.log.error(err);
        return reply.code(400).send({ message: 'Error al obtener las solicitudes recibidas' });
      }
    }
  });

  fastify.patch('/:id/response', {
    schema: {
      tags: ['requests'],
      summary: 'Ruta para responder a una solicitud',
      description: 'Acepta o rechaza una solicitud de préstamo usando su ID.',
      body: Type.Object({
        state: Type.Union([Type.Literal('accepted'), Type.Literal('rejected')])
      }),
      response: {
        200: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() }),
        400: Type.Object({ message: Type.String() })
      }
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try{
        const { id, state } = request.body as { id: number; state: string };
        const receiver = request.user as { id: number };

        const result = await RequestRepository.respondRequest(id, state, receiver.id);

        if (result.rowCount === 0) {
          return reply.code(404).send({ message: 'Solicitud no encontrada o no autorizada' });
        }

        return reply.code(200).send({ message: `Solicitud ${state === 'accepted' ? 'aceptada' : 'rechazada'} correctamente` });

      } catch (err) {
        request.log.error(err);
        return reply.code(400).send({ 
          message: 'Error al procesar la solicitud' 
        });
      }
    }
  });

  fastify.patch('/:id/confirm-pickup', {
    schema: {
      tags: ['requests'],
      summary: 'Confirmar retiro',
      description: 'Confirma que el libro fue retirado por el solicitante.',
      params: RequestIdSchema,
      security: [
        { bearerAuth: [] }
      ],
      response: {

        200: Type.Object({ message: Type.String()}),
        403: Type.Object({ message: Type.String()})

      }
    },
    handler: async (request, reply) => {

      await request.jwtVerify();

      const { id: userId } = request.user as { id: number };

      const { id: requestId } = request.params as { id: number };

      const userRequests = await query(
        
        `SELECT * FROM requests WHERE id = $1 AND receiver_user_id = $2`,
        [requestId, userId]

      )

      if (userRequests.rowCount === 0) {
        
        return reply.status(403).send({ message: "No tienes permiso para modificar esta solicitud" });
      
      }
      
      await query(
        `INSERT INTO loans (id_request) 
          VALUES ($1)`,
        [requestId]
      );

      return reply.status(200).send({ message: "Prestamo confirmado correctamente" })

    }
  });

  fastify.patch('/:id/confirm-return', {
    schema: {
      tags: ['requests'],
      summary: 'Confirmar devolución',
      description: 'Confirma que el libro fue devuelto por el solicitante.',
      params: RequestIdSchema,
      security: [
        { bearerAuth: [] }
      ],
      response: {

        200: Type.Object({ message: Type.String()}),
        403: Type.Object({ message: Type.String()})

      }
    },
    handler: async (request, reply) => {

      await request.jwtVerify();

      const { id: userId } = request.user as { id: number };

      const { id: requestId } = request.params as { id: number };

      const userRequests = await query(
        
        `SELECT * FROM loans WHERE id_request = $1 AND receiver_user_id = $2`,
        [requestId, userId]

      )

      if (userRequests.rowCount === 0) {
        
        return reply.status(403).send({ message: "No tienes permiso para modificar esta solicitud" });
      
      }
      
      await query(
        `INSERT INTO returns (id_request, opinion, calification) 
          VALUES ($1, $2, $3)`,
        [requestId, '', 1]
      )

      return reply.status(200).send({ message: "Devolución confirmada correctamente" })

    }
  });
  
};

export default requestsRoutes;