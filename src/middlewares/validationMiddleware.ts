import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
    return;
  }
  next();
};
