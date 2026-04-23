import { Elysia, t } from 'elysia';
import { verifyAccessToken } from '../utils/jwt.util';
import type { TokenPayload } from '../utils/jwt.util';

export const authMiddleware = (app: Elysia) =>
  app
    .derive({ as: 'global' }, async ({ request, set }) => {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null as TokenPayload | null };
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return { user: null as TokenPayload | null };
      }

      const payload = verifyAccessToken(token);
      return { user: payload as TokenPayload | null };
    })
    .macro(({ onBeforeHandle }) => ({
      isProtected(value: boolean) {
        if (!value) return;
        onBeforeHandle(({ user, set }: any) => {
          if (!user) {
            set.status = 401;
            return {
              success: false,
              message: 'Unauthorized'
            };
          }
        });
      }
    }));
