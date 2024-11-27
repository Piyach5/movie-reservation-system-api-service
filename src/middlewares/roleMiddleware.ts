import { Request, Response, NextFunction } from "express";
import { createResponse } from "../utils/responseUtils";

export const roleCheck = (req: Request, res: Response, next: NextFunction) => {
  const role = req.user?.role;

  if (role !== "admin") {
    res.status(403).json(createResponse(false, "Unauthorized"));
    return;
  }
  next();
};
