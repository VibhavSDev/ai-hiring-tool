// import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter: (req, file, cb) => {
//     // allow PDFs and optionally docx later
//     if (file.mimetype === "application/pdf") {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF files are allowed"));
//     }
//   },
// });

// export default upload;/



// import { ApiError } from "../utils/api-error.js";

// // We use memory storage because we extract text from the buffer
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   console.log("Received file:", file.originalname, "with MIME type:", file.mimetype);
//   // Allow only PDF and Word documents
//   const allowedMimeTypes = [
//     "application/pdf",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/msword"
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     console.log("Accepted file:", file.originalname);
//     cb(null, true);
//   } else {
//     cb(new ApiError(400, "Invalid file type. Only PDF and DOCX are allowed."), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//     files: 10 // Max 10 files per request
//   }
// });

// export default upload;



import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the directory exists
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.round() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
})

const upload = multer({
  storage,
})

export default upload;
