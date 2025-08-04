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
      wsHandler: (socket: WebSocket & {userId?: number}, req) => {

        const authHeader = req.headers['authorization'];
        let userId: number | undefined;

        if (authHeader && authHeader.startsWith("Bearer ")) {

          const token = authHeader.slice("Bearer ".length);
          const decoded = fastify.jwt.decode<{ id: number }>(token);

          if (decoded && typeof decoded === 'object' && decoded.id) {
            
            userId = decoded.id;
            socket.userId = userId;
          
          }
        
        }

      }

    })

  })
}

export default root
