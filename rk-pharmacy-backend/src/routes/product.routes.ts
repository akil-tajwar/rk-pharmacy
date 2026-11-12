import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller";
import { upload } from "../middlewares/upload";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create",  upload.array("photoFiles", 5), createProductController);
router.get("/get", getProductsController);
router.get("/get/:id", getProductByIdController);
router.put("/update/:id",  upload.array("photoFiles", 5), updateProductController);
router.delete("/delete/:id", deleteProductController);

export default router;
