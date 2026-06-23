import express from "express";
import {
  getAllThreads,
  getThreadByID,
  createThread,
  updateThread,
  deleteThread,
  summarizeThread,
  rephraseText,
} from "../controllers/threadController.js";

import authHandler from "../middleware/authHandler.js";

const router = express.Router();

router.get("/", authHandler, getAllThreads);
router.get("/:id", authHandler, getThreadByID);
router.post("/", authHandler, createThread);
router.post("/rephrase", authHandler, rephraseText);
router.put("/:id", authHandler, updateThread);
router.delete("/:id", authHandler, deleteThread);
router.post("/:id/summarize", authHandler, summarizeThread);

export default router;
