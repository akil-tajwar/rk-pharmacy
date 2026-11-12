import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { BadRequestError, UnauthorizedError } from "./utils/errors.utils";
import { generateAccessToken } from "./utils/jwt.utils";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "./utils/password.utils";
import { NewUser, userModel, roleModel } from "../schemas";

// Postgres unique violation = 23505 (Drizzle may wrap the pg error in `cause`)
const isUniqueViolation = (error: any): boolean =>
  error?.code === "23505" || error?.cause?.code === "23505";

const safeUserColumns = {
  userId: userModel.userId,
  username: userModel.username,
  email: userModel.email,
  roleId: userModel.roleId,
  active: userModel.active,
  fullName: userModel.fullName,
  phone: userModel.phone,
  division: userModel.division,
  district: userModel.district,
  address: userModel.address,
};

export const findUserByUsername = async (username: string) => {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(userModel.username, username));
  return user;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(userModel.email, email));
  return user;
};

export const getUserDetailsByUserId = async (userId: number) => {
  const user = await db.query.userModel.findFirst({
    where: eq(userModel.userId, userId),
    columns: { password: false }, // never return the hash
    with: {
      role: {
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      },
    },
  });
  return user;
};

// Create user function
export const createUser = async (userData: NewUser) => {
  // Check if username already exists
  const existingUser = await findUserByUsername(userData.username);
  if (existingUser) {
    throw BadRequestError("Username already registered, please try another");
  }

  // Check if email already exists (only when provided)
  if (userData.email) {
    const existingEmail = await findUserByEmail(userData.email);
    if (existingEmail) {
      throw BadRequestError("Email already registered, please try another");
    }
  }

  // Validate and hash password
  validatePassword(userData.password);
  const hashedPassword = await hashPassword(userData.password);

  try {
    const [newUser] = await db
      .insert(userModel)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        active: userData.active,
        roleId: userData.roleId,
        fullName: userData.fullName,
        phone: userData.phone,
        division: userData.division,
        district: userData.district,
        address: userData.address,
      })
      .returning(safeUserColumns); // no password in the result

    return newUser;
  } catch (error) {
    // Covers race conditions and the unique phone column
    if (isUniqueViolation(error)) {
      throw BadRequestError(
        "Username, email or phone already registered, please try another"
      );
    }
    throw error;
  }
};

// get all users
export const getUsers = async () => {
  const userList = await db
    .select({
      userId: userModel.userId,
      username: userModel.username,
      email: userModel.email,
      active: userModel.active,
      roleId: userModel.roleId,
      fullName: userModel.fullName,
      phone: userModel.phone,
      division: userModel.division,
      district: userModel.district,
      address: userModel.address,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
      roleName: roleModel.roleName,
    })
    .from(userModel)
    .leftJoin(roleModel, eq(userModel.roleId, roleModel.roleId));

  return userList;
};

// ========== Service Layer ==========
export const updateUser = async (
  userId: number,
  updateData: {
    username?: string;
    email?: string;
    roleId?: number;
    active?: boolean;
    fullName?: string;
    phone?: string;
    division?: string;
    district?: string;
    address?: string;
    // no password here
  }
) => {
  try {
    const [updatedUser] = await db
      .update(userModel)
      .set(updateData)
      .where(eq(userModel.userId, userId))
      .returning(safeUserColumns);

    return updatedUser; // undefined if no row matched
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw BadRequestError(
        "Username, email or phone already registered, please try another"
      );
    }
    throw error;
  }
};

export const loginUser = async (username: string, password: string) => {
  const user = await findUserByUsername(username);

  if (!user) {
    throw UnauthorizedError(
      "Wrong username/password. Please Contact with Administrator"
    );
  }

  // Validate password format if needed
  validatePassword(password);

  // Compare the plain password with stored hash
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw UnauthorizedError(
      "Wrong username/password. Please Contact with Administrator"
    );
  }

  // fetch user details like role and permissions
  const userDetails = await getUserDetailsByUserId(user.userId);
  const permissions =
    userDetails?.role?.rolePermissions.map((ur) => ur.permission.name) || [];

  const token = generateAccessToken({
    userId: user.userId,
    username: user.username,
    role: user?.roleId,
    permissions: permissions,
    hasPermission: (perm: string) => permissions.includes(perm),
  });

  return {
    token,
    user: userDetails,
  };
};

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const [user] = await db
    .select()
    .from(userModel)
    .where(eq(userModel.userId, userId));

  if (!user) {
    throw UnauthorizedError("User not found");
  }

  const isValidPassword = await comparePassword(currentPassword, user.password);

  if (!isValidPassword) {
    throw UnauthorizedError("Current password is incorrect");
  }

  validatePassword(newPassword);
  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(userModel)
    .set({ password: hashedPassword })
    .where(eq(userModel.userId, userId));
};

// get user by userId
export const getUserById = async (userId: number) => {
  const [user] = await db
    .select({
      userId: userModel.userId,
      username: userModel.username,
      email: userModel.email,
      active: userModel.active,
      roleId: userModel.roleId,
      fullName: userModel.fullName,
      phone: userModel.phone,
      division: userModel.division,
      district: userModel.district,
      address: userModel.address,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt,
      roleName: roleModel.roleName,
    })
    .from(userModel)
    .leftJoin(roleModel, eq(userModel.roleId, roleModel.roleId))
    .where(eq(userModel.userId, userId))
    .limit(1);

  return user ?? null;
};