import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ================= ENUMS =================
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "delivered",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bkash",
  "nagad",
  "rocket",
]);

// ================= ROLES =================
export const roleModel = pgTable("roles", {
  roleId: serial("role_id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull(),
});

export const permissionsModel = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// ================= USERS =================
export const userModel = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }),
  password: varchar("password", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  roleId: integer("role_id").references(() => roleModel.roleId, {
    onDelete: "set null",
  }),
  fullName: varchar("full_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }).unique(),
  division: varchar("division", { length: 15 }),
  district: varchar("district", { length: 15 }),
  address: varchar("address", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const rolePermissionsModel = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roleModel.roleId, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissionsModel.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

export const userRolesModel = pgTable(
  "user_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => userModel.userId, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roleModel.roleId, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
);

// ================= CATEGORIES =================
export const categoriesModel = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ================= BRANDS =================
export const brandsModel = pgTable("brands", {
  brandId: serial("brand_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ================= COUPONS =================
export const couponsModel = pgTable("coupons", {
  couponId: serial("coupon_id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discount: integer("discount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ================= PRODUCTS =================
export const productsModel = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  productCode: varchar("product_code", { length: 20 }).unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  discount: integer("discount").notNull().default(0),
  photoUrl: text("photo_url").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesModel.categoryId, { onDelete: "cascade" }),
  brandId: integer("brand_id")
    .notNull()
    .references(() => brandsModel.brandId, { onDelete: "cascade" }),
  isAvailable: boolean("is_available").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ================= ORDERS =================
export const ordersMasterModel = pgTable("orders_master", {
  ordersMasterId: serial("orders_master_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userModel.userId, { onDelete: "cascade" }),
  couponId: integer("coupon_id").references(() => couponsModel.couponId, {
    onDelete: "set null",
  }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  division: varchar("division", { length: 15 }).notNull(),
  district: varchar("district", { length: 15 }).notNull(),
  address: varchar("address", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 14 }).notNull(),
  email: varchar("email", { length: 50 }),
  status: orderStatusEnum("status").default("pending"),
  method: paymentMethodEnum("method").notNull(),
  billingPhone: varchar("billing_phone", { length: 14 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull(),
  totalAmount: integer("total_amount").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const ordersDetailsModel = pgTable("orders_details", {
  ordersDetailsId: serial("orders_details_id").primaryKey(),
  ordersMasterId: integer("orders_master_id").references(
    () => ordersMasterModel.ordersMasterId,
    { onDelete: "set null" }
  ),
  productId: integer("product_id")
    .notNull()
    .references(() => productsModel.productId, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  amount: integer("amount").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ================= RELATIONS =================
// User ↔ Role
export const userRelations = relations(userModel, ({ one, many }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
  userRoles: many(userRolesModel),
}));

export const roleRelations = relations(roleModel, ({ many }) => ({
  users: many(userModel),
  rolePermissions: many(rolePermissionsModel),
  userRoles: many(userRolesModel),
}));

export const permissionRelations = relations(permissionsModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
}));

export const rolePermissionsRelations = relations(
  rolePermissionsModel,
  ({ one }) => ({
    role: one(roleModel, {
      fields: [rolePermissionsModel.roleId],
      references: [roleModel.roleId],
    }),
    permission: one(permissionsModel, {
      fields: [rolePermissionsModel.permissionId],
      references: [permissionsModel.id],
    }),
  })
);

export const userRolesRelations = relations(userRolesModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userRolesModel.userId],
    references: [userModel.userId],
  }),
  role: one(roleModel, {
    fields: [userRolesModel.roleId],
    references: [roleModel.roleId],
  }),
}));

// Product relations
export const productRelations = relations(productsModel, ({ one }) => ({
  category: one(categoriesModel, {
    fields: [productsModel.categoryId],
    references: [categoriesModel.categoryId],
  }),
  brand: one(brandsModel, {
    fields: [productsModel.brandId],
    references: [brandsModel.brandId],
  }),
}));

export const categoryRelations = relations(categoriesModel, ({ many }) => ({
  products: many(productsModel),
}));

export const brandRelations = relations(brandsModel, ({ many }) => ({
  products: many(productsModel),
}));

export const orderMasterRelations = relations(ordersMasterModel, ({ one }) => ({
  user: one(userModel, {
    fields: [ordersMasterModel.userId],
    references: [userModel.userId],
  }),
  coupon: one(couponsModel, {
    fields: [ordersMasterModel.couponId],
    references: [couponsModel.couponId],
  }),
}));

export const orderDetailsRelations = relations(
  ordersDetailsModel,
  ({ one }) => ({
    product: one(productsModel, {
      fields: [ordersDetailsModel.productId],
      references: [productsModel.productId],
    }),
    orderMaster: one(ordersMasterModel, {
      fields: [ordersDetailsModel.ordersMasterId],
      references: [ordersMasterModel.ordersMasterId],
    }),
  })
);

// ================= TYPES =================
export type User = typeof userModel.$inferSelect;
export type NewUser = typeof userModel.$inferInsert;
export type Role = typeof roleModel.$inferSelect;
export type NewRole = typeof roleModel.$inferInsert;
export type Permission = typeof permissionsModel.$inferSelect;
export type NewPermission = typeof permissionsModel.$inferInsert;
export type UserRole = typeof userRolesModel.$inferSelect;
export type NewUserRole = typeof userRolesModel.$inferInsert;
export type RolePermission = typeof rolePermissionsModel.$inferSelect;
export type NewRolePermission = typeof rolePermissionsModel.$inferInsert;
export type Category = typeof categoriesModel.$inferSelect;
export type NewCategory = typeof categoriesModel.$inferInsert;
export type Brand = typeof brandsModel.$inferSelect;
export type NewBrand = typeof brandsModel.$inferInsert;
export type Product = typeof productsModel.$inferSelect;
export type NewProduct = typeof productsModel.$inferInsert;
export type OrdersMaster = typeof ordersMasterModel.$inferSelect;
export type NewOrdersMaster = typeof ordersMasterModel.$inferInsert;
export type OrdersDetails = typeof ordersDetailsModel.$inferSelect;
export type NewOrdersDetails = typeof ordersDetailsModel.$inferInsert;