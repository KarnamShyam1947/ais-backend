const express = require("express")
const { upload, uploadFile, deleteFile } = require("../controllers/UploadController")

const uploadRouter = express.Router()

uploadRouter.route("/")
    .post(upload.single("image"), uploadFile)
    .delete(deleteFile)
    

module.exports = uploadRouter
