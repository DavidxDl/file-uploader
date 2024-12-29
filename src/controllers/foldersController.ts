import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import getSupabaseClient from "../utilities/supabase";

const prisma = new PrismaClient();

export async function index(req: Request, res: Response) {
  console.log(req.user);

  if (!req.isAuthenticated()) {
    return res.status(403).json({ message: "Not logged in" });
  }
  const folders = await prisma.folder.findMany({
    where: { ownerId: req.user.id },
  });
  return res.status(200).json(folders);
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

  const supabase = getSupabaseClient(req.user);

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
      (file) => `${req.user.id}/${folderName}/${file.name}`
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
  if (!req.user.id) return res.status(401).redirect("/");

  const supabase = getSupabaseClient(req.user);

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.folderId },
    });
    if (!folder) {
      console.error("couldnt find folder");
      return res.status(404).redirect("/");
    }
    console.log(folder.name);
    let { error, data } = await supabase.storage
      .from("folders")
      .list(`${req.user.id}/${folder.name}/`);

    console.log(data);
    if (data.length === 1 && data[0].name === ".emptyFolderPlaceholder")
      data = [];
    if (error) {
      console.error("couldnt get files from folder", error);
      return res.redirect("/");
    }

    for (const file of data) {
      const filePath = `${req.user.id}/${folder.name}/${file.name}`;

      const signedUrlData = await supabase.storage
        .from("folders")
        .createSignedUrl(filePath, 60 * 5, { download: true });

      file.metadata.signedUrl = signedUrlData.data.signedUrl;
    }

    return res.json(data);
  } catch (error) {
    console.error("couldnt get files from folder", error);
    return res.status(400).redirect("/");
  }
}

export async function rename_folder(req: Request, res: Response) {
  const supabase = getSupabaseClient(req.user);
  try {
    const { folderName, folderId, newFolderName } = req.body;
    console.log(folderName, folderId, newFolderName);

    if (!folderName || !folderId || !newFolderName) {
      console.error("bad request necessary fields missing from request");
      return res.status(400).redirect("/");
    }

    // Update folder name in database
    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: newFolderName },
    });
    console.log("db folder Updated:", folder);

    // List all files in the folder
    const path = `${req.user.id}/${folderName}`;
    const { error: listError, data: files } = await supabase.storage
      .from("folders")
      .list(path);

    if (listError) {
      console.error("couldn't list files from folder", listError);
      return res
        .status(400)
        .json({ message: "couldn't list files from folder" });
    }

    // If no files, we're done
    if (!files || files.length === 0) {
      return res.status(200).json({ message: "folder renamed successfully" });
    }

    // Move each file to the new folder
    const movePromises = files.map(async (file) => {
      const originalPath = `${req.user.id}/${folderName}/${file.name}`;
      const newPath = `${req.user.id}/${newFolderName}/${file.name}`;

      console.log(`Moving file from ${originalPath} to ${newPath}`);

      try {
        // First copy the file to new location
        const { error: copyError, data: copyData } = await supabase.storage
          .from("folders")
          .copy(originalPath, newPath);

        if (copyError) {
          console.error(`Error copying file ${file.name}:`, copyError);
          return { success: false, file: file.name, error: copyError };
        }

        // Then remove the original file
        const { error: removeError } = await supabase.storage
          .from("folders")
          .remove([originalPath]);

        if (removeError) {
          console.error(
            `Error removing original file ${file.name}:`,
            removeError
          );
          return { success: false, file: file.name, error: removeError };
        }

        return { success: true, file: file.name };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return { success: false, file: file.name, error };
      }
    });

    // Wait for all file operations to complete
    const results = await Promise.all(movePromises);

    // Check if any operations failed
    const failures = results.filter((result) => !result.success);
    if (failures.length > 0) {
      console.error("Some files failed to move:", failures);
      return res.status(207).json({
        message: "partial success - some files failed to move",
        failures,
      });
    }

    return res.status(200).json({
      message: "folder renamed successfully",
      filesProcessed: results.length,
    });
  } catch (error) {
    console.error("Error in rename_folder:", error);
    return res.status(500).json({
      message: "internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
