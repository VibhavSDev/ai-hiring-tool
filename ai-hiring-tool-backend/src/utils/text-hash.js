import crypto from "crypto";

export function hashText(text) {
    return crypto
        .createHash("sha256")
        .update(text.trim().toLowerCase(), "utf-8")
        .digest("hex");
}