import express from "express";
import multer from "multer";
import loginRequired from "../utilities/loginRequired";

const upload = multer();

import {
  index,
  create_file_get,
  create_file_post,
  file_details,
  delete_file,
  share_file,
  get_shared_files,
} from "../controllers/filesController";

export const router = express.Router();

router.get("/", index);

router.get("/new", loginRequired, create_file_get);

router.post("/new", loginRequired, upload.single("file"), create_file_post);

router.post("/delete", loginRequired, delete_file);

router.post("/share", loginRequired, share_file);

router.get("/share", loginRequired, get_shared_files);

router.get("/:fileName", loginRequired, file_details);
