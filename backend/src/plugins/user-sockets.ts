import { FastifyPluginAsync } from 'fastify';
import { WebSocket } from '@fastify/websocket';

declare module 'fastify' {
  interface FastifyInstance {
    userSockets: Map<number, WebSocket>;
  }
}

const userSocketsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.userSockets = new Map<number, WebSocket>();
}

export default userSocketsPlugin;