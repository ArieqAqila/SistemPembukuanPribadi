import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./routes/user.route";
import { masterRoutes } from "./routes/master.route";
import { productPocketRoutes } from "./routes/product-pocket.route";

const app = new Elysia()
    .use(swagger())
    .get("/", () => ({ 
        message: "Sistem Pembukuan Pribadi API",
        version: "1.0.0",
        docs: "/swagger"
    }))
    .group("/api/v1", app => app
        .use(userRoutes)
        .use(masterRoutes)
        .use(productPocketRoutes)
    )
    .get("/health", async () => {
        return { status: "ok", uptime: process.uptime() };
    })
    .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
