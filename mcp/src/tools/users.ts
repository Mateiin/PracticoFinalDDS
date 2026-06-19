import { z } from "zod";
import { api } from "../api-client";
import type { ToolDef } from "../tool-factory";

export default [
  {
    name: "list_users",
    description: "Lista todos los usuarios (requiere admin)",
    handler: async () => api.get("/users"),
  },
  {
    name: "update_user_role",
    description: "Cambia el rol de un usuario (requiere admin)",
    inputSchema: {
      id: z.string().uuid(),
      role: z.enum(["admin", "user"]),
    },
    handler: async ({ id, role }: any) => api.patch(`/users/${id}/role`, { role }),
  },
  {
    name: "update_my_password",
    description: "Cambia la contraseña del usuario autenticado",
    inputSchema: {
      currentPassword: z.string(),
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(8),
    },
    handler: async ({ currentPassword, newPassword, confirmPassword }: any) =>
      api.patch("/users/me/password", { currentPassword, newPassword, confirmPassword }),
  },
  {
    name: "update_my_email",
    description: "Cambia el email del usuario autenticado",
    inputSchema: {
      newEmail: z.string().email(),
      currentPassword: z.string(),
    },
    handler: async ({ newEmail, currentPassword }: any) =>
      api.patch("/users/me/email", { newEmail, currentPassword }),
  },
] as ToolDef[];
