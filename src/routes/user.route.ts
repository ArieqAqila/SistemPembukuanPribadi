import { Elysia } from "elysia";
import { UserService } from "../services/user.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { TokenPayload } from "../utils/jwt.util";
import { updateUserSchema } from "../validations/user.validation";

const userService = new UserService();

export const userRoutes = (app: Elysia) =>
    app
        .use(authMiddleware)
        .group("/users", (group) =>
            group
                .onBeforeHandle(({ user, set }) => {
                    if (!user) {
                        set.status = 401;
                        return { success: false, message: "Unauthorized" };
                    }
                })
                .get("/", () => userService.getAll())
                .get("/:id", ({ params: { id }, user, set }) => {
                    if ((user as TokenPayload).userId !== id) {
                        set.status = 403;
                        return { success: false, message: "Forbidden" };
                    }
                    return userService.getById(id);
                })
                .put("/:id", async ({ params: { id }, body, user, set }) => {
                    if ((user as TokenPayload).userId !== id) {
                        set.status = 403;
                        return { success: false, message: "Forbidden" };
                    }
                    try {
                        const updatedUser = await userService.update(id, body);
                        return {
                            success: true,
                            message: "User updated successfully",
                            data: updatedUser
                        };
                    } catch (error: any) {
                        set.status = (error.message === 'Username already exists' || error.message === 'Email already exists') ? 409 : 400;
                        return {
                            success: false,
                            message: error.message
                        };
                    }
                }, {
                    body: updateUserSchema
                })
                .delete("/:id", ({ params: { id }, user, set }) => {
                    if ((user as TokenPayload).userId !== id) {
                        set.status = 403;
                        return { success: false, message: "Forbidden" };
                    }
                    return userService.delete(id);
                })
        );
