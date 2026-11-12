import { eq, desc } from "drizzle-orm";
import { db } from "../config/database";
import {
  ordersDetailsModel,
  ordersMasterModel,
  productsModel,
} from "../schemas";
import type { CreateOrderType } from "../controllers/order.controller";

/**
 * CREATE ORDER (MASTER + DETAILS)
 */
export const createOrder = async (payload: CreateOrderType, userId: number) => {
  const { orderMaster, orderDetails } = payload;

  return await db.transaction(async (trx) => {
    // 1️⃣ Insert order master
    const [master] = await trx
      .insert(ordersMasterModel)
      .values({
        userId,
        couponId: orderMaster.couponId ?? null,
        fullName: orderMaster.fullName,
        division: orderMaster.division,
        district: orderMaster.district,
        address: orderMaster.address,
        phone: orderMaster.phone,
        email: orderMaster.email ?? null,
        status: "pending",
        method: orderMaster.method,
        billingPhone: orderMaster.billingPhone ?? orderMaster.phone,
        transactionId: orderMaster.transactionId ?? "",
        totalAmount: orderMaster.totalAmount,
        createdBy: userId,
      })
      .returning({ ordersMasterId: ordersMasterModel.ordersMasterId });

    const ordersMasterId = master.ordersMasterId;

    // 2️⃣ Insert order details
    await trx.insert(ordersDetailsModel).values(
      orderDetails.map((item) => ({
        ordersMasterId,
        productId: item.productId,
        quantity: item.quantity,
        amount: item.amount,
        createdBy: userId,
      }))
    );

    return {
      ordersMasterId,
      message: "Order created successfully",
    };
  });
};

/**
 * GET ALL ORDERS (MASTER + DETAILS)
 */
export const getAllOrders = async () => {
  const masters = await db
    .select()
    .from(ordersMasterModel)
    .orderBy(desc(ordersMasterModel.createdAt));

  return await Promise.all(
    masters.map(async (master) => {
      const details = await db
        .select()
        .from(ordersDetailsModel)
        .where(eq(ordersDetailsModel.ordersMasterId, master.ordersMasterId));

      return {
        orderMaster: master,
        orderDetails: details,
      };
    })
  );
};

/**
 * GET ORDERS BY USER ID (MASTER + DETAILS WITH PRODUCT NAME)
 */
export const getOrdersByUserId = async (userId: number) => {
  if (!userId || Number.isNaN(userId)) {
    return [];
  }

  const masters = await db
    .select()
    .from(ordersMasterModel)
    .where(eq(ordersMasterModel.userId, userId))
    .orderBy(desc(ordersMasterModel.createdAt));

  return await Promise.all(
    masters.map(async (master) => {
      const details = await db
        .select({
          ordersDetailsId: ordersDetailsModel.ordersDetailsId,
          ordersMasterId: ordersDetailsModel.ordersMasterId,
          productId: ordersDetailsModel.productId,
          productName: productsModel.name,
          quantity: ordersDetailsModel.quantity,
          amount: ordersDetailsModel.amount,
          createdAt: ordersDetailsModel.createdAt,
        })
        .from(ordersDetailsModel)
        .leftJoin(
          productsModel,
          eq(ordersDetailsModel.productId, productsModel.productId)
        )
        .where(eq(ordersDetailsModel.ordersMasterId, master.ordersMasterId));

      return {
        orderMaster: master,
        orderDetails: details,
      };
    })
  );
};

/**
 * DELETE ORDER (returns null if the order doesn't exist)
 */
export const deleteOrder = async (orderMasterId: number) => {
  return await db.transaction(async (trx) => {
    // 1️⃣ Delete order details first
    await trx
      .delete(ordersDetailsModel)
      .where(eq(ordersDetailsModel.ordersMasterId, orderMasterId));

    // 2️⃣ Delete order master
    const [deleted] = await trx
      .delete(ordersMasterModel)
      .where(eq(ordersMasterModel.ordersMasterId, orderMasterId))
      .returning({ ordersMasterId: ordersMasterModel.ordersMasterId });

    if (!deleted) return null;

    return {
      orderMasterId,
      message: "Order deleted successfully",
    };
  });
};

const setOrderStatus = async (
  orderMasterId: number,
  status: "confirmed" | "delivered",
  userId: number
) => {
  const [updated] = await db
    .update(ordersMasterModel)
    .set({ status, updatedBy: userId })
    .where(eq(ordersMasterModel.ordersMasterId, orderMasterId))
    .returning({ ordersMasterId: ordersMasterModel.ordersMasterId });

  return updated ?? null;
};

export const confirmOrder = async (orderMasterId: number, userId: number) => {
  const updated = await setOrderStatus(orderMasterId, "confirmed", userId);
  if (!updated) return null;

  return {
    orderMasterId,
    status: "confirmed",
    message: "Order confirmed successfully",
  };
};

export const completeOrder = async (orderMasterId: number, userId: number) => {
  const updated = await setOrderStatus(orderMasterId, "delivered", userId);
  if (!updated) return null;

  return {
    orderMasterId,
    status: "delivered",
    message: "Order marked as delivered",
  };
};