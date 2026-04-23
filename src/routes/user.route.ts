import { Elysia, t } from "elysia";
import { UserService } from "../services/user.service";

const userService = new UserService();

export const userRoutes = new Elysia({ prefix: "/users" })
    .get("/", () => userService.getAll())
    .get("/:id", ({ params: { id } }) => userService.getById(id))
    .post("/", ({ body }) => userService.create(body), {
        body: t.Object({
            fullname: t.String(),
            username: t.String(),
            password: t.String(),
        })
    })
    .put("/:id", ({ params: { id }, body }) => userService.update(id, body), {
        body: t.Partial(t.Object({
            fullname: t.String(),
            username: t.String(),
            password: t.String(),
        }))
    })
    .delete("/:id", ({ params: { id } }) => userService.delete(id));
