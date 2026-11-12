import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categories.service";

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
});

const parseId = (value: string | undefined): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Adjust to wherever your auth middleware puts the logged-in user
const getCurrentUserId = (req: Request): number | null =>
  (req as any).user?.userId ?? null;

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ status: "fail", message: "Unauthorized" });
      return;
    }

    const data = categorySchema.parse(req.body);
    const category = await createCategory({ ...data, createdBy: userId });
    res.status(201).json({ status: "success", data: category });
  } catch (err) {
    next(err);
  }
};

export const getCategoriesController = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getCategories();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ status: "fail", message: "Invalid id" });
      return;
    }

    const category = await getCategoryById(id);
    if (!category) {
      res.status(404).json({ status: "fail", message: "Category not found" });
      return;
    }

    res.json({ status: "success", data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ status: "fail", message: "Invalid id" });
      return;
    }

    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ status: "fail", message: "Unauthorized" });
      return;
    }

    const data = categorySchema.partial().parse(req.body);
    const updated = await updateCategory(id, { ...data, updatedBy: userId });
    if (!updated) {
      res.status(404).json({ status: "fail", message: "Category not found" });
      return;
    }

    res.json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ status: "fail", message: "Invalid id" });
      return;
    }

    const result = await deleteCategory(id);
    if (!result.success) {
      res.status(404).json({ status: "fail", message: "Category not found" });
      return;
    }

    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};