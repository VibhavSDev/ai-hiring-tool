import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getEmbeddingHandler, getBulkEmbeddingsHandler } from "../controllers/embedding.controller.js";

const router = express.Router();

router.post("/get", requireAuth, getEmbeddingHandler);
router.post("/bulk", requireAuth, getBulkEmbeddingsHandler);

export default router;