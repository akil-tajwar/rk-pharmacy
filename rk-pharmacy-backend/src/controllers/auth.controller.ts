import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { db } from "../config/database";
import { roleModel, userModel } from "../schemas";
import { eq } from "drizzle-orm";
import {
  changePassword,
  createUser,
  getUserById,
  getUsers,
  loginUser,
  updateUser,
} from "../services/auth.service";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    active: z.boolean().default(true),
    roleId: z.number(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z
      .string()
      .min(8, "Confirm new password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

// Postgres rejects NaN / non-integer ids, so validate before querying
const parseId = (value: string | undefined): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const result = await loginUser(username, password);

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      username,
      email,
      password,
      active,
      roleId,
      fullName,
      phone,
      division,
      district,
      address,
    } = registerSchema.parse(req.body);

    const user = await createUser({
      username,
      email,
      password,
      active,
      roleId,
      fullName,
      phone,
      division,
      district,
      address,
    });

    res.status(201).json({
      status: "success",
      data: {
        user: {
          username: user.username,
          email: user.email,
          roleId: user.roleId,
          active: user.active,
          fullName: user.fullName,
          phone: user.phone,
          division: user.division,
          district: user.district,
          address: user.address,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========== Controller Layer ==========

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseId(req.params.userId);
    if (id === null) {
      res.status(400).json({ status: "fail", message: "Invalid userId" });
      return;
    }

    const {
      username,
      email,
      roleId,
      active,
      fullName,
      phone,
      division,
      district,
      address,
    } = req.body;

    const updateData: {
      username?: string;
      email?: string;
      roleId?: number;
      active?: boolean;
      fullName?: string;
      phone?: string;
      division?: string;
      district?: string;
      address?: string;
    } = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = Number(roleId);
    if (active !== undefined) updateData.active = Boolean(active);
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (division !== undefined) updateData.division = division;
    if (district !== undefined) updateData.district = district;
    if (address !== undefined) updateData.address = address;

    const updatedUser = await updateUser(id, updateData);

    if (!updatedUser) {
      res.status(404).json({
        status: "fail",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseId(req.params.userId);
    if (id === null) {
      res.status(400).json({ status: "fail", message: "Invalid userId" });
      return;
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    );

    await changePassword(id, currentPassword, newPassword);

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersWithRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usersWithRoles = await db
      .select({
        userId: userModel.userId,
        username: userModel.username,
        active: userModel.active,
        roleName: roleModel.roleName,
      })
      .from(userModel)
      .innerJoin(roleModel, eq(userModel.roleId, roleModel.roleId));

    res.status(200).json({
      status: "success",
      data: {
        users: usersWithRoles.map((user) => ({
          id: user.userId,
          username: user.username,
          active: user.active,
          roleName: user.roleName,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// get user by userId
export const getUserByIdController = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseId(req.params.userId);
    if (id === null) {
      res.status(400).json({ message: "Invalid userId" });
      return;
    }

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// get all users
export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await getUsers();

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};