import { Static, Type } from '@sinclair/typebox';

export const BookIdSchema = Type.Object({
    id: Type.Number(),
}, { $id: 'BookIdSchema' });

export const GenreSchema = Type.Object({
    id: Type.Number(),
    name: Type.String({ minLength: 2, maxLength: 30 }),
}, { $id: 'GenreSchema' });

export const GenresResponseSchema = Type.Array(GenreSchema, {
    description: 'Lista de géneros disponibles'
});

//Borrar los optionals de fecha publicada y localización.
export const BookSchema = Type.Object({
    id: Type.Number(),
    name: Type.String({ minLength: 2, maxLength: 50 }),
    description: Type.Optional(Type.String({ minLength: 10, maxLength: 500 })),
    author: Type.String({ minLength: 2, maxLength: 50 }),
    genres:
        Type.Array(
            Type.String({ minLength: 2, maxLength: 30 }),
            { description: 'Lista de géneros del libro' }
        )
    ,
    date_published: Type.Optional(Type.String({ format: 'date', description: 'Fecha de publicación del libro' })),
    location: Type.Optional(Type.String({ minLength: 5, maxLength: 100 })),
    state: Type.Union([
        Type.Literal("available"),
        Type.Literal("unavailable")
    ]),
    owner_id: Type.Number({ description: 'ID del propietario del libro' }),
    image_url: Type.Optional(Type.String({ format: 'uri', description: 'URL de la imagen del libro' })),
});

export const BookPostSchema = Type.Object({
    name: Type.String({ minLength: 2, maxLength: 50 }),
    description: Type.String({ minLength: 10, maxLength: 500 }),
    author: Type.String({ minLength: 2, maxLength: 50 }),
    genres: Type.Array(
        Type.Number({ description: 'ID del género del libro' }),
        { minItems: 1, description: 'Lista de géneros del libro' }
    ),
    location: Type.String({ minLength: 5, maxLength: 100 }),
    //image_url: Type.Optional(Type.String({ format: 'uri', description: 'URL de la imagen del libro' })),
});

export const BookIdReference = Type.Ref(BookIdSchema);
export type BookIdRef = Static<typeof BookIdReference>;
export type BookIdType = Static<typeof BookIdSchema>;
export type BookType = Static<typeof BookSchema>;
export type BookPostType = Static<typeof BookPostSchema>;
export type GenreType = Static<typeof GenreSchema>;
export type GenresResponseType = Static<typeof GenresResponseSchema>;
