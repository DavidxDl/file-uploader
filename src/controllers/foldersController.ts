import { Request, Response } from "express";

export async function index(req: Request, res: Response) {
  return res.render("create_folder", { errors: [] });
}

export function create_folder_get(req: Request, res: Response) {
  return res.render("create_folder", { errors: [] });
}
