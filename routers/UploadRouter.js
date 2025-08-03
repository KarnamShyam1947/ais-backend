const express = require("express")
const {
    uploadS3,
    deleteS3,
    uploadMemory, 
    uploadCloudinary, 
    uploadFileCloudinary, 
    deleteFileCloudinary, 
    uploadR2,
    deleteR2
} = require("../controllers/UploadController")

const uploadRouter = express.Router()

uploadRouter.route("/cloudinary")
    .post(uploadCloudinary.single("image"), uploadFileCloudinary)
    .delete(deleteFileCloudinary)

uploadRouter.route("/")
    .post(uploadMemory.single("file"), uploadS3)
    .delete(deleteS3)

uploadRouter.route("/r2")
    .post(uploadMemory.single("file"), uploadR2)
    .delete(deleteR2)
    

module.exports = uploadRouter
