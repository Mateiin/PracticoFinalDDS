import { z } from "zod";
import { api } from "../api-client";
import type { ToolDef } from "../tool-factory";

export default [
  {
    name: "list_products",
    description: "Lista productos con filtros opcionales y paginación",
    inputSchema: {
      name: z.string().optional(),
      orderBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().optional(),
    },
    handler: async ({ name, orderBy, order, page, limit }: any) => {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (orderBy) params.set("orderBy", orderBy);
      if (order) params.set("order", order);
      if (page) params.set("page", String(page));
      if (limit) params.set("limit", String(limit));
      const qs = params.toString();
      return api.get(`/products${qs ? `?${qs}` : ""}`);
    },
  },
  {
    name: "get_product",
    description: "Obtiene un producto por su ID",
    inputSchema: { id: z.number().int().positive() },
    handler: async ({ id }: any) => api.get(`/products/${id}`),
  },
  {
    name: "create_product",
    description: "Crea un nuevo producto (requiere admin)",
    inputSchema: {
      name: z.string().min(2).max(100),
      price: z.number().positive(),
      stock: z.number().int().min(0),
      categoryId: z.number().int().positive(),
    },
    handler: async ({ name, price, stock, categoryId }: any) =>
      api.post("/products", { name, price, stock, categoryId }),
  },
  {
    name: "update_product",
    description: "Actualiza un producto existente (requiere admin)",
    inputSchema: {
      id: z.number().int().positive(),
      name: z.string().min(2).max(100).optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.number().int().positive().optional(),
    },
    handler: async ({ id, ...body }: any) => api.put(`/products/${id}`, body),
  },
  {
    name: "delete_product",
    description: "Elimina un producto por su ID (requiere admin)",
    inputSchema: { id: z.number().int().positive() },
    handler: async ({ id }: any) => api.del(`/products/${id}`),
  },
] as ToolDef[];
