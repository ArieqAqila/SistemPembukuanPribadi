import { Elysia } from "elysia";
import { KategoriService } from "../services/kategori.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { TokenPayload } from "../utils/jwt.util";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/kategori.validation";

const kategoriService = new KategoriService();

export const kategoriRoutes = (app: Elysia) =>
  app.use(authMiddleware).group("/categories", (group) =>
    group
      .onBeforeHandle(({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { success: false, message: "Unauthorized" };
        }
      })
      .get("/", async ({ user }) => {
        const data = await kategoriService.getAll((user as TokenPayload).userId);
        return {
          success: true,
          message: "Categories retrieved successfully",
          data,
        };
      })
      .post(
        "/",
        async ({ body, user, set }) => {
          try {
            const data = await kategoriService.create(
              (user as TokenPayload).userId,
              body.name
            );
            set.status = 201;
            return {
              success: true,
              message: "Category created successfully",
              data,
            };
          } catch (error: any) {
            set.status = 400;
            return { success: false, message: error.message };
          }
        },
        { body: createCategorySchema }
      )
      .put(
        "/:id",
        async ({ params: { id }, body, user, set }) => {
          try {
            const data = await kategoriService.update(
              (user as TokenPayload).userId,
              id,
              body.name
            );
            return {
              success: true,
              message: "Category updated successfully",
              data,
            };
          } catch (error: any) {
            set.status = 400;
            return { success: false, message: error.message };
          }
        },
        { body: updateCategorySchema }
      )
      .delete("/:id", async ({ params: { id }, user, set }) => {
        try {
          await kategoriService.delete((user as TokenPayload).userId, id);
          return {
            success: true,
            message: "Category deleted successfully",
          };
        } catch (error: any) {
          set.status = 400;
          return { success: false, message: error.message };
        }
      })
  );
