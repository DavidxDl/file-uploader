import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function index(req: Request, res: Response) {
  const files = ["file", "file", "file"];
  return res.render("files", { files: files });
}

export async function create_file_get(req: Request, res: Response) {
  return res.render("create_file", { errors: [] });
}

export async function create_file_post(req: Request, res: Response) {
  console.log(req.file);
  return res.redirect("/");
}
