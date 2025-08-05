import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';

const localidadesRoutes: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  
  fastify.get('/:department_name', {
    schema: {
      tags: ['places'],
      summary: "Ruta para obtener la información de un departamento",
      params: Type.Object({ department_name: Type.String() }),
      description: "Muestra la información del departamento por su ID",
      response: {
        200: Type.Array(Type.String()),
        404: Type.Object({ message: Type.String() }),
      }
    },
    handler: async (request, reply) => {

      const { department_name } = request.params as { department_name: string }

      try {

        const response = await fetch('https://direcciones.ide.uy/api/v0/geocode/localidades?departamento=' + department_name);
        
        if (!response.ok) {

          reply.code(502)
          return

        }

        const data = await response.json()

        if (response.status !== 200 || !Array.isArray(data)) {
          
          return reply.code(404).send({ message: 'Departamento no encontrado' })

        }

        const nombres = data.map((localidad: any) => localidad.nombre)

        return nombres

      } catch (error) {

        reply.code(500)
        return

      }

    }
  
  });

}

export default localidadesRoutes
