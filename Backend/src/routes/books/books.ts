import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
//import { query } from '../../services/database.js';

const bookRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  
  fastify.get('/books', {
    schema: {
      tags: ['books'],
      summary: "Route for listing all the published books",
      description: "Shows all the published books"
    },
    handler: async (request, reply) => {
      
        return {  }
      
    }
  });

  fastify.post('/books', {
    schema: {
      tags: ['books'],
      summary: "Route for publishing a new book",
      description: "Lets the user publish a new book",
      body: {
        type: 'object',
        // required: [  ],
        properties: {  },
      },
    },
    handler: async (request, reply) => {
      
        return {  }
      
    }
  });

  fastify.get('/books/:id', {
    schema: {
      tags: ['books'],
      summary: "Route for retrieving a specific book's data",
      description: "Shows the user a specific book's data",
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    handler: async (request, reply) => {
      
        return {  }
      
    }
  });
}

export default bookRoutes