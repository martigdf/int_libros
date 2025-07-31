import { createError } from "@fastify/error";
export class UCUError extends Error {
    constructor(message:string) {
        super(message);
    }
}
export const UCUErrorNotFound      = createError("UCUErrorNotFound",      "UCU Resource not found: %s",   404);