import { Request, Response } from "express";
import { z } from "zod";
import {
  completeOrder,
  confirmOrder,
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrdersByUserId,
} from "../services/order.service";

export const ordersSchema = z.object({
  orderMaster: z.object({
    couponId: z.number().int().nullable().optional(),
    fullName: z.string().max(255),
    division: z.string().max(15),
    district: z.string().max(15),
    address: z.string().max(100),
    phone: z.string().max(14),
    email: z.string().max(50).nullable().optional(),
    method: z.enum(["bkash", "nagad", "rocket"]),
    billingPhone: z.string().max(14).optional(),
    transactionId: z.string().max(255).nullable().optional(),
    totalAmount: z.number().int().nonnegative(),
  }),

  orderDetails: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().min(1).default(1),
        amount: z.number().int().nonnegative(),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export type CreateOrderType = z.infer<typeof ordersSchema>;
export type GetOrderType = z.infer<typeof ordersSchema>;

const parseId = (value: string | undefined): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Adjust to wherever your auth middleware puts the logged-in user
const getCurrentUserId = (req: Request): number | null =>
  (req as any).user?.userId ?? null;

const handleError = (error: unknown, res: Response, fallback: string) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });
    return;
  }
  console.error(fallback, error);
  res.status(500).json({ success: false, message: fallback });
};

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const payload = ordersSchema.parse(req.body);
    const result = await createOrder(payload, userId);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    handleError(error, res, "Failed to create order");
  }
};

/**
 * GET ALL ORDERS
 */
export const getAllOrdersController = async (_req: Request, res: Response) => {
  try {
    const result = await getAllOrders();
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res, "Failed to fetch orders");
  }
};

export const getOrdersByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseId(req.params.userId);
    if (userId === null) {
      res.status(400).json({ success: false, message: "Invalid userId" });
      return;
    }

    const result = await getOrdersByUserId(userId);
    res.status(200).json(result);
  } catch (error) {
    handleError(error, res, "Failed to fetch user orders");
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  try {
    const orderMasterId = parseId(req.params.orderMasterId);
    if (orderMasterId === null) {
      res
        .status(400)
        .json({ success: false, message: "Invalid orderMasterId" });
      return;
    }

    const result = await deleteOrder(orderMasterId);
    if (!result) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      orderMasterId: result.orderMasterId,
    });
  } catch (error) {
    handleError(error, res, "Failed to delete order");
  }
};

export const confirmOrderController = async (req: Request, res: Response) => {
  try {
    const orderMasterId = parseId(req.params.id);
    if (orderMasterId === null) {
      res
        .status(400)
        .json({ success: false, message: "Invalid orderMasterId" });
      return;
    }

    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await confirmOrder(orderMasterId, userId);
    if (!result) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(error, res, "Failed to confirm order");
  }
};

export const completeOrderController = async (req: Request, res: Response) => {
  try {
    const orderMasterId = parseId(req.params.id);
    if (orderMasterId === null) {
      res
        .status(400)
        .json({ success: false, message: "Invalid orderMasterId" });
      return;
    }

    const userId = getCurrentUserId(req);
    if (userId === null) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await completeOrder(orderMasterId, userId);
    if (!result) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(error, res, "Failed to complete order");
  }
};