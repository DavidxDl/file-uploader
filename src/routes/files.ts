import express from "express";
import multer from "multer";
import loginRequired from "../utilities/loginRequired";

const upload = multer();

import {
  index,
  create_file_get,
  create_file_post,
  file_details,
} from "../controllers/filesController";

export const router = express.Router();

router.get("/", index);

router.get("/new", loginRequired, create_file_get);

router.post("/new", loginRequired, upload.single("file"), create_file_post);

router.get("/:fileName", loginRequired, file_details);
