import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Database } from "../../database.types";

import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xsxfzuxsjnuxvtiximye.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const prisma = new PrismaClient();

export async function index(req: Request, res: Response) {
  const files = ["file", "file", "file"];
  return res.render("files", { files: files });
}

export async function create_file_get(req: Request, res: Response) {
  const folders = await prisma.folder.findMany({
    where: { ownerId: req.user.id },
  });
  return res.render("create_file", { errors: [], folders: folders });
}

export async function create_file_post(req: Request, res: Response) {
  console.log(req.file);
  console.log(req.body);
  const autorizationJwt = jwt.sign(
    { user_id: req.user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1hr" },
  );
  console.log("authorization jwt", jwt.decode(autorizationJwt));
  const folder: string = req.body.folder;
  if (!folder) return res.redirect("/files/new");

  const { error, data } = await supabase.storage
    .from("folders")
    .upload(
      `${req.user.id}/${folder ? folder + "/" : ""}${req.file.originalname}`,
      req.file.buffer,
      {
        contentType: req.file.mimetype,
        metadata: { ownerId: req.user.id },
      },
    );

  if (error) {
    console.error("couldnt upload file", error);
    return res.status(401).redirect("/files/new");
  }
  console.log("file uploaded correctly", data);
  const folder_info = await prisma.folder.findFirst({
    where: { name: folder },
  });

  const file = await prisma.file.create({
    data: {
      name: req.file.originalname,
      folderId: folder_info.id,
      ownerId: req.user.id,
    },
  });
  console.log("file created", file);

  return res.redirect("/");
}
