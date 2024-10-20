import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Database } from "../../database.types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xsxfzuxsjnuxvtiximye.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const prisma = new PrismaClient();

export async function index(req: Request, res: Response) {
  const folders = await prisma.folder.findMany({
    where: { ownerId: req.user.id },
  });
  return res.render("folders", { folders: folders });
}

export function create_folder_get(req: Request, res: Response) {
  return res.render("create_folder", { errors: [] });
}

export async function create_folder_post(req: Request, res: Response) {
  const folder_name: string = req.body.folder_name;

  if (!folder_name) {
    return res.render("create_folder", {
      errors: ["please give your folder a name!"],
    });
  }

  const folder = await prisma.folder.create({
    data: { name: folder_name, ownerId: req.user.id },
  });
  console.log(folder);
  return res.status(200).redirect("/folders");
}

export async function delete_folder(req: Request, res: Response) {
  const { folderId, folderName } = req.body;
  console.log(folderId, folderName);
  try {
    await prisma.folder.delete({ where: { id: folderId } });
    return res.status(200).json({ message: `folder: ${folderName} DELETED` });
  } catch (err) {
    console.error("couldnt delete folder", err);
    return res.status(401).json({ message: "coulnd delete folder" });
  }
}
export async function folder_details(req: Request, res: Response) {
  console.log(req.params);
  const folder = await prisma.folder.findUnique({
    where: { id: req.params.folderId },
  });
  const files = await supabase.storage
    .from("folders")
    .list(`${req.user.id}/${folder.name}/`);
  console.log(files);

  return res.render("folder_details", { files: files.data, folder: folder });
}
