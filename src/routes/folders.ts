import express from "express";

export const router = express.Router();

import {
  create_folder_get,
  folder_details,
  index,
  create_folder_post,
  delete_folder,
} from "../controllers/foldersController";

router.get("/", index);

router.get("/new", create_folder_get);

router.post("/new", create_folder_post);

router.post("/delete", delete_folder);

router.get("/:folderId", folder_details);
