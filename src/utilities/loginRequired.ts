import { Response, Request, NextFunction } from "@types/express";

export default function loginRequired(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
}
