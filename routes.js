const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const searchFile = require("./searchFile"); // import the searchFile function
const parsedConfig = require("dotenv").config({ path: "./.env" }).parsed;

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
function validTerm(str) {
  const pattern = /^[a-zA-Z0-9]+$/g;
  return pattern.test(str);
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/plain") {
    cb(null, true);
  } else {
    cb(new Error("File type not supported."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/search", (req, res) => {
  let searchTerm = req.query.q;
  searchTerm = searchTerm.trim();
  const filename = req.query.file;
  const filePath = path.join(__dirname, "uploads", filename);
  if (validTerm(searchTerm)) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send("File not found.");
      }

      searchFile(searchTerm, filePath)
        .then((matchingWords) => {
          if (matchingWords.length === 0) {
            res.status(200).json({
              success: false,
              message_code: "NO_WORD_FOUND",
              searched_sentences: matchingWords,
            });
          } else {
            res.status(200).json({
              success: true,
              message_code: "SUCCESS",
              searched_sentences: matchingWords,
            });
          }
        })
        .catch((err) => {
          res.status(400).send(err.message);
        })
        .finally(() => {
          if (parsedConfig.NODE_ENV === "production") {
            process.kill(process.pid, "SIGTERM"); // to kill the process after the response is sent and fork the new process
          }
        });
    });
  } else {
    res.status(400).send("Invalid search term.");
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({
      success: false,
      message_code: "FILE_NOT_UPLOADED",
    });
    if (parsedConfig.NODE_ENV === "production") {
      process.kill(process.pid, "SIGTERM"); // to kill the process after the response is sent and fork the new process
    }
  } else {

    res.status(200).json({
        success: true,
        message_code: "FILE_UPLOADED",
  
    });
    if (parsedConfig.NODE_ENV === "production") {
      process.kill(process.pid, "SIGTERM"); // to kill the process after the response is sent and fork the new process
    }
  }
});
router.use((err, req, res, next) => {
  if (err.message == "File type not supported.") {
    res.status(405).json({
        success: false,
        message_code: "FILE_NOT_SUPPORTED",
  
    });
  } else {
    res.status(405).json({
        success: false,
        message_code: "INTERNAL_SERVER_ERROR",
  
    });
  }
});

module.exports = router;
