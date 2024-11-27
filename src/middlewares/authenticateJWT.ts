import { Request, Response, NextFunction } from "express";
import { createResponse } from "../utils/responseUtils";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(403).json(createResponse(false, "No token provided."));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as JwtPayload;

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Forbidden" });
  }
};
