import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../services/utils/errors.utils";
import {
  extractTokenFromHeader,
  getUserPermissions,
  verifyAccessToken,
} from "../services/utils/jwt.utils";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    console.log("Token received on API:", req.headers.authorization);
    const decoded = verifyAccessToken(token);

    const permissions = await getUserPermissions(decoded.userId);

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,

      hasPermission: (perm: string) => permissions.includes(perm),
      hasRole: (role: number) => decoded.role === role,
    };
    console.log(permissions);
    next();
  } catch (error) {
    console.error(error);
    next(UnauthorizedError("Invalid token"));
  }
};

// utils/getUserPermissions.ts
