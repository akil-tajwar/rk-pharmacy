import { Router } from "express";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categories.controller";

const router = Router();

router.post("/create", createCategoryController);
router.get("/get", getCategoriesController);
router.get("/get/:id", getCategoryByIdController);
router.put("/update/:id", updateCategoryController);
router.delete("/delete/:id", deleteCategoryController);

export default router;
