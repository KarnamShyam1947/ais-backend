const express = require("express")
const {
    uploadS3,
    deleteS3,
    uploadMemory, 
    uploadCloudinary, 
    uploadFileCloudinary, 
    deleteFileCloudinary 
} = require("../controllers/UploadController")

const uploadRouter = express.Router()

uploadRouter.route("/cloudinary")
    .post(uploadCloudinary.single("image"), uploadFileCloudinary)
    .delete(deleteFileCloudinary)

uploadRouter.route("/")
    .post(uploadMemory.single("image"), uploadS3)
    .delete(deleteS3)
    

module.exports = uploadRouter
