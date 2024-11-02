import express from "express";

export const router = express.Router();

import {
  create_folder_get,
  folder_details,
  index,
  create_folder_post,
  delete_folder,
  rename_folder,
} from "../controllers/foldersController";
import loginRequired from "../utilities/loginRequired";

router.get("/", index);

router.get("/new", loginRequired, create_folder_get);

router.post("/new", loginRequired, create_folder_post);

router.post("/delete", loginRequired, delete_folder);

router.post("/rename", loginRequired, rename_folder);

router.get("/:folderId", loginRequired, folder_details);
