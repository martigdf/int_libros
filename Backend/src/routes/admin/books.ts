import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { query } from '../../../services/database.js';
import myBooksRoute from '../books/my-books.js';

const showBooksRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  
    fastify.delete('/books/:id', {
        schema: 
        tags: ['admin'],
        summary: "Route for deleting a published book",
        description: "Deletes a specific published book",
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

    fastify.get('/books', {
        schema: 
        tags: ['admin'],
        summary: "Route for listing all the published books",
        description: "Shows all the published books",
        body: {
            type: 'object',
            // required: [  ],
            properties: {  },
        },
        },
        handler: async (request, reply) => {
        
            return {  }
        
        }
    })
}

export default myBooksRoute