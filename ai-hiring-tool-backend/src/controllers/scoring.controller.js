// src/controllers/scoring.controller.js
import { scoreSingleResume } from "../services/score-single.service.js";

/**
 * POST /api/score/single
 * Synchronous scoring (preview/debug)
 */
export async function scoreSingle(req, res) {
  try {
    const result = await scoreSingleResume(req.body);
    return res.json({
      success: true,
      version: "v1",
      result,
    });
  } catch (err) {
    console.error("scoreSingle:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to score resume",
    });
  }
}
