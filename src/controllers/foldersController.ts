import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Database } from "../../database.types";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = "https://xsxfzuxsjnuxvtiximye.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

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

  const token = jwt.sign(
    {
      sub: req.user.id,
      name: req.user.name,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : null,
    },
  });
  console.log(folderId, folderName);
  try {
    await prisma.folder.delete({ where: { id: folderId } });

    const folderPath = `${req.user.id}/${folderName}/`;
    const { error, data } = await supabase.storage
      .from("folders")
      .list(folderPath);
    if (error) {
      console.error("Coulnd delete folder from supabase", error);
      return res.status(400).redirect(`/folders`);
    }

    const filePaths = data.map(
      (file) => `${req.user.id}/${folderName}/${file.name}`,
    );

    const deletion = await supabase.storage.from("folders").remove(filePaths);

    if (deletion.error) {
      console.error("coulnd delete files from folder");
    }

    return res.status(200).json({ message: `folder: ${folderName} DELETED` });
  } catch (err) {
    console.error("couldnt delete folder", err);
    return res.status(401).json({ message: "coulnd delete folder" });
  }
}
export async function folder_details(req: Request, res: Response) {
  console.log(req.params);
  const token = jwt.sign(
    {
      sub: req.user.id,
      name: req.user.id,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : null,
    },
  });

  if (!req.user.id) return res.status(401).redirect("/");

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.folderId },
    });
    if (!folder) {
      console.error("couldnt find folder");
      return res.status(404).redirect("/");
    }
    console.log(folder.name);
    const { error, data } = await supabase.storage
      .from("folders")
      .list(`${req.user.id}/${folder.name}/`);

    //data.forEach(async (file) => {
    //  const {error,data} = await supabase.storage.from("folders").createSignedUrls
    //})
    console.log(data);
    if (error) {
      console.error("couldnt get files from folder", error);
      return res.redirect("/");
    }

    return res.render("folder_details", { files: data, folder: folder });
  } catch (error) {
    console.error("couldnt get files from folder", error);
    return res.status(400).redirect("/");
  }
}
