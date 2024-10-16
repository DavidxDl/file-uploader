import express from "express";

export const router = express.Router();

import { create_folder_get, index } from "../controllers/foldersController";

router.get("/", index);

router.get("/new", create_folder_get);
