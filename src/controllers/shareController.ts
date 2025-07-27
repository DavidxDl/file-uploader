import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import getSupabaseClient from "../utilities/supabase";

export async function index(req: Request, res: Response) {
  console.log(req.url);
  console.log(req.user.id);
  console.log("TRYINNG TO GET SHARED FILES!");
  const supabase = getSupabaseClient(req.user);
  try {
    const { error, data } = await supabase.storage
      .from("share")
      .list(`${req.user.id}/`);

    console.table(data);
    if (error) {
      console.error("couldnt get shared files", error);
      return res.sendStatus(500);
    }

    for (const file of data) {
      const filePath = `${req.user.id}/${file.name}`;

      const signedUrlData = supabase.storage
        .from("share")
        .getPublicUrl(filePath, { download: true });

      file.metadata.signedUrl = signedUrlData.data.publicUrl;
    }
    return res.json(data);
  } catch (error) {
    console.error("error while trying to get shared files", error);
  }
}

export async function delete_shared_file(req: Request, res: Response) {
  console.log(req.url);
  console.log(req.body);

  const { fileName } = req.body;

  console.log("trying to delete file: ", fileName);

  if (!fileName) {
    console.error("no file name while trying to delete shared file");
    res.sendStatus(400);
  }

  const supabase = getSupabaseClient(req.user);

  try {
    const { error, data } = await supabase.storage
      .from("share")
      .remove([`${req.user.id}/${fileName}`]);

    if (error) {
      console.error("couldnt delete shared file", error);
      return res.sendStatus(500);
    }

    console.log(data);
    return res.json({ success: true });
  } catch (error) {
    return res.sendStatus(500);
  }
}

export async function create_shared_file(req: Request, res: Response) {
  console.log(req.file);
  console.log(req.body);

  const supabase = getSupabaseClient(req.user);

  try {
    const { error, data } = await supabase.storage
      .from("share")
      .upload(`${req.user.id}/${req.file.originalname}`, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      console.error("couldnt upload file", error);
      return res.status(500).redirect("/files/new");
    }

    console.log("file uploaded correctly", data);

    return res.redirect(`http://localhost:5173/`);
  } catch (error) {
    console.error("Error during the file upload process", error);
    return res.status(500).redirect("/files/new");
  }
}
