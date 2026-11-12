import { db } from "../config/database";
import { productsModel, categoriesModel, brandsModel } from "../schemas";
import { eq } from "drizzle-orm";

export interface ProductInput {
  productCode?: string;
  name: string;
  description?: string | null;
  price: number;
  discount?: number;
  categoryId: number;
  brandId: number;
  isAvailable?: boolean;
}

const buildPhotoUrl = (file: Express.Multer.File) => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";
  return `${baseUrl}/uploads/${file.filename}`;
};

// Shared select shape for list + detail
const productSelect = {
  productId: productsModel.productId,
  productCode: productsModel.productCode,
  name: productsModel.name,
  description: productsModel.description,
  price: productsModel.price,
  discount: productsModel.discount,
  photoUrl: productsModel.photoUrl,
  isAvailable: productsModel.isAvailable,
  createdAt: productsModel.createdAt,
  updatedAt: productsModel.updatedAt,

  categoryId: productsModel.categoryId,
  categoryName: categoriesModel.name,

  brandId: productsModel.brandId,
  brandName: brandsModel.name,
};

// ======================================================
// CREATE PRODUCT
// ======================================================
export const createProduct = async (
  data: ProductInput,
  file: Express.Multer.File,
  userId: number
) => {
  const [created] = await db
    .insert(productsModel)
    .values({
      ...data,
      photoUrl: buildPhotoUrl(file),
      createdBy: userId,
    })
    .returning();

  return created;
};

// ======================================================
// GET ALL PRODUCTS (optionally by category)
// ======================================================
export const getProducts = async (categoryId?: number) => {
  return await db
    .select(productSelect)
    .from(productsModel)
    .innerJoin(
      categoriesModel,
      eq(productsModel.categoryId, categoriesModel.categoryId)
    )
    .innerJoin(brandsModel, eq(productsModel.brandId, brandsModel.brandId))
    .where(categoryId ? eq(productsModel.categoryId, categoryId) : undefined);
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================
export const getProductById = async (id: number) => {
  const [product] = await db
    .select(productSelect)
    .from(productsModel)
    .innerJoin(
      categoriesModel,
      eq(productsModel.categoryId, categoriesModel.categoryId)
    )
    .innerJoin(brandsModel, eq(productsModel.brandId, brandsModel.brandId))
    .where(eq(productsModel.productId, id))
    .limit(1);

  return product ?? null;
};

// ======================================================
// UPDATE PRODUCT (image replaced only if a new file is sent)
// ======================================================
export const updateProduct = async (
  id: number,
  data: Partial<ProductInput>,
  file: Express.Multer.File | undefined,
  userId: number
) => {
  const [updated] = await db
    .update(productsModel)
    .set({
      ...data,
      ...(file ? { photoUrl: buildPhotoUrl(file) } : {}),
      updatedBy: userId,
    })
    .where(eq(productsModel.productId, id))
    .returning();

  return updated ?? null;
};

// ======================================================
// DELETE PRODUCT
// ======================================================
export const deleteProduct = async (id: number) => {
  const [deleted] = await db
    .delete(productsModel)
    .where(eq(productsModel.productId, id))
    .returning({ productId: productsModel.productId });

  if (!deleted) return null;

  return { message: "Product deleted successfully" };
};