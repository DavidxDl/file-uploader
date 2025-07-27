import express from "express";
import multer from "multer";
import loginRequired from "../utilities/loginRequired";

const upload = multer();

import {
  index,
  delete_shared_file,
  create_shared_file,
} from "../controllers/shareController";

export const router = express.Router();

router.get("/", index);
router.post("/delete", loginRequired, delete_shared_file);
router.post("/new", loginRequired, upload.single("file"), create_shared_file);
