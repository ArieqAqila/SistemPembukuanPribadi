import { t } from 'elysia';

export const registerSchema = t.Object({
    fullname: t.String({ minLength: 3 }),
    username: t.String({ 
        minLength: 8,
        pattern: '^(?=.*[a-zA-Z])(?=.*[0-9]).*$',
        error: 'Username must be at least 8 characters long and contain both letters and numbers'
    }),
    email: t.String({ 
        format: 'email',
        error: 'Invalid email format'
    }),
    password: t.String({ 
        minLength: 12,
        pattern: '^(?=.*[a-zA-Z])(?=.*[0-9]).*$',
        error: 'Password must be at least 12 characters long and contain both letters and numbers'
    })
});

export const loginSchema = t.Object({
    username: t.String(),
    password: t.String()
});

export const refreshSchema = t.Object({
    refreshToken: t.String()
});

export const logoutSchema = t.Object({
    refreshToken: t.String()
});
