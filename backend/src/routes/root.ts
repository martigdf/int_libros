import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { WebSocket } from '@fastify/websocket'

const root: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  
  fastify.register(async function () {

    fastify.route({

      method: 'GET',
      url: '/',
      handler: async (req, reply) => {

        return { root: true }

      },
      wsHandler: async (socket: WebSocket & { userId?: number }, req) => {

        console.log(fastify.userSockets)

        const token = (req.query as any).token;

        if (!token) {
          
          socket.close();
          return;

        }

        try {

          const decoded = await fastify.jwt.verify<{ id: number }>(token);

          if (decoded && typeof decoded.id === 'number') {

            const userId = decoded.id;
            socket.userId = userId;

            //fastify.userSockets.set(userId, socket);
            console.log('Usuario ' + userId + ' conectado.');
            
            socket.on('close', () => {
              
              //fastify.userSockets.delete(userId);
              console.log('Usuario ' + userId + ' desconectado.');
            
            });

          } else {

            socket.close();
          
          }

        } catch (err) {
          console.error('Verificación fallida:', err);
          socket.close();
        }

      }

    })

  })
}

export default root
