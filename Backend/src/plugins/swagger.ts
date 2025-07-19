import swagger, { FastifySwaggerOptions } from '@fastify/swagger'
import swaggerui from "@fastify/swagger-ui";
import fp from 'fastify-plugin'

export default fp<FastifySwaggerOptions>(async (fastify) => {
  await fastify.register(swagger,{
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Test swagger',
        description: 'Testing the Fastify swagger API',
        version: '0.1.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      tags: [
        { name: 'requests', description: 'Operations related to requests' },
        { name: 'examples', description: 'Examples end points.' },
        { name: 'auth', description: 'Authentication related end-points' },
        { name: 'admin', description: 'Admin related end-points' },
        { name: 'users', description: 'User management end-points' },
        { name: 'books', description: 'Book related end-points' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      }
    }
  });

  await fastify.register(swaggerui, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'none',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  })
})
