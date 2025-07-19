import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
//import { query } from '../../services/database.js';

const myBooksRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/my-books', {
    schema: {
      tags: ['books'],
      summary: "Route for showing the user's published books",
      description: "Shows all the books that the user has published"
    },
    handler: async (request, reply) => {
      
        return {  }
      
    }
  })
}

export default myBooksRoute