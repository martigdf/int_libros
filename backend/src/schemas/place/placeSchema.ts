import { Type } from '@sinclair/typebox'

export const PlaceSchema = Type.Object({
  id: Type.Number(),
  nombre: Type.String(),
  codigoPostal: Type.Number(),
}, {
  examples: [
    {
        "id": 3263,
        "nombre": "18 DE MAYO",
        "codigoPostal": 15900,
        "alias": null
    }
  ]
})

export const PlacesSchema = Type.Object({
  nombre: Type.String()
}, {
  examples: [
    "18 DE MAYO",
    "AEROPUERTO INTERNACIONAL DE CARRASCO",
    "AGUAS CORRIENTES"
  ]
})