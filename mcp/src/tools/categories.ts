import { z } from "zod";
import { api } from "../api-client";
import type { ToolDef } from "../tool-factory";

export default [
  {
    name: "list_categories",
    description: "Lista todas las categorías",
    handler: async () => api.get("/categories"),
  },
  {
    name: "get_category",
    description: "Obtiene una categoría por su ID",
    inputSchema: { id: z.number().int().positive() },
    handler: async ({ id }: any) => api.get(`/categories/${id}`),
  },
  {
    name: "create_category",
    description: "Crea una nueva categoría (requiere admin)",
    inputSchema: { name: z.string().min(2).max(100) },
    handler: async ({ name }: any) => api.post("/categories", { name }),
  },
  {
    name: "update_category",
    description: "Actualiza una categoría existente (requiere admin)",
    inputSchema: {
      id: z.number().int().positive(),
      name: z.string().min(2).max(100),
    },
    handler: async ({ id, name }: any) => api.put(`/categories/${id}`, { name }),
  },
  {
    name: "delete_category",
    description: "Elimina una categoría por su ID (requiere admin)",
    inputSchema: { id: z.number().int().positive() },
    handler: async ({ id }: any) => api.del(`/categories/${id}`),
  },
] as ToolDef[];
