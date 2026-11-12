import { db } from "../config/database";
import { categoriesModel, NewCategory } from "../schemas";
import { eq } from "drizzle-orm";

export const createCategory = async (data: NewCategory) => {
  const [newCategory] = await db
    .insert(categoriesModel)
    .values(data)
    .returning();
  return newCategory;
};

export const getCategories = async () => {
  return await db.select().from(categoriesModel);
};

export const getCategoryById = async (id: number) => {
  return await db.query.categoriesModel.findFirst({
    where: eq(categoriesModel.categoryId, id),
    with: { products: true },
  });
};

export const updateCategory = async (
  id: number,
  data: Partial<NewCategory>
) => {
  const [updated] = await db
    .update(categoriesModel)
    .set(data)
    .where(eq(categoriesModel.categoryId, id))
    .returning();

  if (!updated) return undefined;

  return getCategoryById(id);
};

export const deleteCategory = async (id: number) => {
  const deleted = await db
    .delete(categoriesModel)
    .where(eq(categoriesModel.categoryId, id))
    .returning({ categoryId: categoriesModel.categoryId });

  return { success: deleted.length > 0 };
};