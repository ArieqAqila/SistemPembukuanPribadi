import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./routes/user.route";
import { masterRoutes } from "./routes/master.route";
import { productRoutes } from "./routes/product-pocket.route";
import { authRoutes } from "./routes/auth.route";
import { kantongRoutes } from "./routes/kantong.route";

const app = new Elysia()
    .use(swagger())
    .get("/", () => ({ 
        message: "Sistem Pembukuan Pribadi API",
        version: "1.0.0",
        docs: "/swagger"
    }))
    .group("/api/v1", app => app
        .use(authRoutes)
        .use(userRoutes)
        .use(masterRoutes)
        .use(productRoutes)
        .use(kantongRoutes)
    )
    .get("/health", async () => {
        return { status: "ok", uptime: process.uptime() };
    })
    .listen(process.env.PORT || 3000);

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
