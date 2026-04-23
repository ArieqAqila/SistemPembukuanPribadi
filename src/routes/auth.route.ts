import { Elysia, t } from 'elysia';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const authRoutes = (app: Elysia) =>
    app.group('/auth', (group) =>
        group
            .post('/register', async ({ body, set }) => {
                try {
                    const user = await authService.register(body);
                    set.status = 201;
                    return {
                        success: true,
                        message: 'Registration successful',
                        data: user
                    };
                } catch (error: any) {
                    set.status = error.message === 'Username already exists' ? 409 : 400;
                    return {
                        success: false,
                        message: error.message
                    };
                }
            }, {
                body: t.Object({
                    fullname: t.String({ minLength: 3 }),
                    username: t.String({ minLength: 3 }),
                    email: t.Optional(t.String({ format: 'email' })),
                    password: t.String({ minLength: 8 })
                })
            })
            .post('/login', async ({ body, set }) => {
                try {
                    const result = await authService.login(body);
                    return {
                        success: true,
                        message: 'Login successful',
                        data: result
                    };
                } catch (error: any) {
                    set.status = 401;
                    return {
                        success: false,
                        message: error.message
                    };
                }
            }, {
                body: t.Object({
                    username: t.String(),
                    password: t.String()
                })
            })
            .post('/refresh', async ({ body, set }) => {
                try {
                    const result = await authService.refresh(body.refreshToken);
                    return {
                        success: true,
                        message: 'Token refreshed',
                        data: result
                    };
                } catch (error: any) {
                    set.status = 401;
                    return {
                        success: false,
                        message: error.message
                    };
                }
            }, {
                body: t.Object({
                    refreshToken: t.String()
                })
            })
            .post('/logout', async ({ body, set }) => {
                try {
                    await authService.logout(body.refreshToken);
                    return {
                        success: true,
                        message: 'Logout successful'
                    };
                } catch (error: any) {
                    set.status = 400;
                    return {
                        success: false,
                        message: error.message
                    };
                }
            }, {
                body: t.Object({
                    refreshToken: t.String()
                })
            })
            .onError(({ code, error, set }) => {
                if (code === 'VALIDATION') {
                    set.status = 422;
                    return {
                        success: false,
                        message: 'Validation failed',
                        errors: error.all.map((err: any) => ({
                            field: err.path.substring(1),
                            message: err.message
                        }))
                    };
                }
            })
    );
