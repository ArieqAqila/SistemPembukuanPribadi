import { t } from "elysia";

export const createCategorySchema = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 255,
    error: "Category name is required",
  }),
});

export const updateCategorySchema = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 255,
    error: "Category name is required",
  }),
});
