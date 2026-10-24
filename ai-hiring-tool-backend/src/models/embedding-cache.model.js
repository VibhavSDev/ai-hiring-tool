// src/models/EmbeddingCache.js
import mongoose from "mongoose";

const EmbeddingCacheSchema = new mongoose.Schema({
  key: {
    type: String,
    index: true,
    unique: true
  },
  provider: {
    type: String,
    required: true,
  },
  dim: {
    type: Number,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
    default: []
  },
  modelName: {
    type: String,
    required: true,
  },
  textSample: String,
}, { timestamps: true });

export const EmbeddingCache = mongoose.model("EmbeddingCache", EmbeddingCacheSchema);
