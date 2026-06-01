import { Router } from "express";
import { uploadImages } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", protect, upload.array("media", 10), uploadImages);

export default router;
