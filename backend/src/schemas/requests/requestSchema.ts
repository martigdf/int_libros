import { Type } from '@sinclair/typebox';

// valido el body cuando se crea una solicitud
export const RequestPostSchema = Type.Object({
  receiver_user_id: Type.Number({ description: 'ID del propietario del libro(s)' }),
  books: Type.Array(
    Type.Number({ description: 'Solicita ID del libro' }),
    { minItems: 1, description: 'Se solicita al menos un libro' }
  )
});

// Rutas request id
export const RequestIdSchema = Type.Object({
  id: Type.Number({ description: 'ID de la solicitud' })
});

// Estructura base para request
export const RequestSchema = Type.Object({
  id: Type.Number(),
  creation_date: Type.String({ format: 'date-time', description: 'Fecha de creación de la solicitud' }),
  state: Type.String({ description: 'Estado actual de la solicitud' }),
  sender_user_id: Type.Number({ description: 'ID del usuario que solicita el préstamo' }),
  receiver_user_id: Type.Number({ description: 'ID del usuario dueño del libro' })
});