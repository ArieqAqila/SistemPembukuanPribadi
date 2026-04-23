import { Elysia, t } from 'elysia';
import { KantongService } from '../services/kantong.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import type { TokenPayload } from '../utils/jwt.util';

const kantongService = new KantongService();

export const kantongRoutes = (app: Elysia) =>
    app
        .use(authMiddleware)
        .group('/kantong', (group) =>
            group
                .onBeforeHandle(({ user, set }) => {
                    if (!user) {
                        set.status = 401;
                        return { success: false, message: 'Unauthorized' };
                    }
                })
                .get('/', async ({ user }) => {
                    return await kantongService.getByUserId((user as TokenPayload).userId);
                })
                .get('/:id', async ({ params: { id }, user, set }) => {
                    const result = await kantongService.getById(id);
                    if (!result || result.userId !== (user as TokenPayload).userId) {
                        set.status = 404;
                        return { success: false, message: 'Not Found' };
                    }
                    return result;
                })
                .post('/', async ({ body, user, set }) => {
                    try {
                        const result = await kantongService.create({
                            ...body,
                            userId: (user as TokenPayload).userId
                        });
                        set.status = 201;
                        return result;
                    } catch (error: any) {
                        set.status = 400;
                        return { success: false, message: error.message };
                    }
                }, {
                    body: t.Object({
                        tipeKantongId: t.String(),
                        nama: t.String(),
                        saldoAwal: t.String(),
                    })
                })
                .put('/:id', async ({ params: { id }, body, user, set }) => {
                    try {
                        const existing = await kantongService.getById(id);
                        if (!existing || existing.userId !== (user as TokenPayload).userId) {
                            set.status = 404;
                            return { success: false, message: 'Not Found' };
                        }
                        return await kantongService.update(id, body);
                    } catch (error: any) {
                        set.status = 400;
                        return { success: false, message: error.message };
                    }
                }, {
                    body: t.Partial(t.Object({
                        nama: t.String(),
                        tipeKantongId: t.String(),
                        saldoAwal: t.String(),
                    }))
                })
                .delete('/:id', async ({ params: { id }, user, set }) => {
                    try {
                        const existing = await kantongService.getById(id);
                        if (!existing || existing.userId !== (user as TokenPayload).userId) {
                            set.status = 404;
                            return { success: false, message: 'Not Found' };
                        }
                        return await kantongService.delete(id);
                    } catch (error: any) {
                        set.status = 400;
                        return { success: false, message: error.message };
                    }
                })
        );
