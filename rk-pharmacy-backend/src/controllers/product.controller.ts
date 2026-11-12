import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service";

export const productSchema = z.object({
  productCode: z.string().max(20).optional(),
  name: z.string().min(1).max(150),
  description: z.string().nullable().optional(),
  price: z.number().int().nonnegative(),
  discount: z.number().int().min(0).optional(), // DB default is 0
  categoryId: z.number().int(),
  brandId: z.number().int(),
  isAvailable: z.boolean().optional(), // DB default is true
});

const parseId = (value: string | undefined): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Adjust to wherever your auth middleware puts the logged-in user
const getCurrentUserId = (req: Request): number | null =>
  (req as any).user?.userId ?? null;

const handleError = (err: unknown, res: Response, fallback: string) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON in product field" });
    return;
  }
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: "Validation failed", errors: err.issues });
    return;
  }
  console.error(fallback, err);
  res.status(500).json({ error: fallback });
};

// ======================== CREATE ========================
export const createProductController = async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.body.product) {
      res.status(400).json({ error: "Product data is required" });
      return;
    }

    // photoUrl is notNull, so an image is required on create
    if (!req.file) {
      res.status(400).json({ error: "Product image is required" });
      return;
    }

    const product = productSchema.parse(JSON.parse(req.body.product));

    const createdProduct = await createProduct(product, req.file, userId);

    res.status(201).json({ success: true, data: createdProduct });
  } catch (err) {
    handleError(err, res, "Failed to create product");
  }
};

// ======================== GET ALL ========================
export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    let id: number | undefined;

    if (categoryId) {
      const parsed = parseId(categoryId);
      if (parsed === null) {
        res.status(400).json({ status: "error", message: "Invalid categoryId" });
        return;
      }
      id = parsed;
    }

    const products = await getProducts(id);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ======================== GET ONE ========================
export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ status: "error", message: "Invalid id" });
      return;
    }

    const product = await getProductById(id);

    if (!product) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ======================== UPDATE ========================
export const updateProductController = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.body.product) {
      res.status(400).json({ error: "Product data is required" });
      return;
    }

    const product = productSchema.partial().parse(JSON.parse(req.body.product));

    // req.file is optional: without it the existing image is kept
    const updatedProduct = await updateProduct(id, product, req.file, userId);

    if (!updatedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    handleError(err, res, "Failed to update product");
  }
};

// ======================== DELETE ========================
export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ status: "error", message: "Invalid id" });
      return;
    }

    const result = await deleteProduct(id);
    if (!result) {
      res.status(404).json({ status: "error", message: "Product not found" });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};