import { Elysia, t } from "elysia";
import { UserService } from "../services/user.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { TokenPayload } from "../utils/jwt.util";

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
                .put("/:id", ({ params: { id }, body, user, set }) => {
                    if ((user as TokenPayload).userId !== id) {
                        set.status = 403;
                        return { success: false, message: "Forbidden" };
                    }
                    return userService.update(id, body);
                }, {
                    body: t.Partial(t.Object({
                        fullname: t.String(),
                        username: t.String(),
                        password: t.String(),
                    }))
                })
                .delete("/:id", ({ params: { id }, user, set }) => {
                    if ((user as TokenPayload).userId !== id) {
                        set.status = 403;
                        return { success: false, message: "Forbidden" };
                    }
                    return userService.delete(id);
                })
        );
