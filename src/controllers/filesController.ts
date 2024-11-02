import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import getSupabaseClient from "../utilities/supabase";

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

  const folder: string = req.body.folder;
  if (!folder) return res.redirect("/files/new");

  const supabase = getSupabaseClient(req.user);

  try {
    const folder_info = await prisma.folder.findFirst({
      where: { name: folder },
    });

    if (!folder_info) {
      console.error(`Folder: ${folder} does not exist! `);
      return res.status(404).redirect("/files/new");
    }

    const { error, data } = await supabase.storage
      .from("folders")
      .upload(
        `${req.user.id}/${folder}/${req.file.originalname}`,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
        },
      );

    if (error) {
      console.error("couldnt upload file", error);
      return res.status(500).redirect("/files/new");
    }

    console.log("file uploaded correctly", data);

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        folderId: folder_info.id,
        ownerId: req.user.id,
      },
    });
    console.log("file created", file);

    return res.redirect(`/folders/${folder_info.id}/`);
  } catch (error) {
    console.error("Error during the file upload process", error);
    return res.status(500).redirect("/files/new");
  }
}

export async function file_details(req: Request, res: Response) {
  console.log(req.params);
  console.log(req.query);

  const supabase = getSupabaseClient(req.user);

  try {
    const file = await prisma.file.findFirst({
      where: { name: req.params.fileName },
    });
    if (!file) {
      console.error("file not found");
      return res.status(404).redirect("/");
    }

    const folder = await prisma.folder.findUnique({
      where: { id: file.folderId },
    });

    if (!folder) {
      console.error(`folder for file: ${file.name} not found`);
      return res.status(404).redirect("/");
    }

    const filePath = `${req.user.id}/${folder.name}/${file.name}`;

    const { error, data } = await supabase.storage
      .from("folders")
      .createSignedUrl(
        filePath,
        60,
        req.query.download === "true" ? { download: true } : null,
      );

    if (error) {
      console.error("couldnt create signed url", error);
    }

    return res.status(200).redirect(data.signedUrl);
  } catch (error) {
    console.error("theres was an error trying to get the public url", error);
    return res.send("couldnt get publicUrl");
  }
}

export async function delete_file(req: Request, res: Response) {
  const supabase = getSupabaseClient(req.user);

  try {
    const { fileName, folderName, fileId } = req.body;
    console.log(fileName, folderName, fileId);
    if (!fileName || !folderName) {
      console.error("File Name or Folder Name missing");
      return res
        .status(400)
        .json({ message: "missing folder name or file name" });
    } else if (!fileId) {
      console.error("File Id missing");
      return res.status(400).json({ message: "missing file id " });
    }

    const dbFile = await prisma.file.findFirst({ where: { name: fileName } });
    console.log(`file found to delete : ${dbFile}`);

    const path = `${req.user.id}/${folderName}/${fileName}`;
    console.log(`file path : ${path}`);

    const { error, data } = await supabase.storage
      .from("folders")
      .remove([path]);

    console.log(`supabase removed file:`, data);

    const file = await prisma.file.delete({ where: { id: dbFile.id } });

    console.log(`prisma file deleted: `, file);

    if (error) {
      console.error("couldnt delete file", error);
      return res.status(400).json({ error: "couldnt delete file" });
    }

    return res.status(200).json("File deleted");
  } catch (error) {
    console.error("couldnt delete file", error);
    return res
      .status(400)
      .json({ message: `couldnt delete file`, error: error });
  }
}
