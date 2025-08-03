const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./../config/CloudinaryConfig");
const { extractPublicIdFromUrl } = require("./../lib/CloudniaryUtils");
const { v4 } = require('uuid');
const { s3Client, r2Client } = require("../config/S3Client");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const multerCloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ais',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
    }
});

const uploadCloudinary = multer({ storage: multerCloudinaryStorage });
const uploadMemory = multer({ storage: multer.memoryStorage() });

const uploadFileCloudinary = (req, res) => {
    console.log(req.file.path);

    if (req.file && req.file.path) {
        res.json({ imageUrl: req.file.path });
    } else {
        res.status(400).json({ error: 'Upload failed' });
    }
}

const deleteFileCloudinary = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }


    try {
        const publicId = extractPublicIdFromUrl(url);

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return res.status(200).json({ message: 'Image deleted successfully' });
        } else {
            return res.status(400).json({ error: 'Failed to delete image' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

const uploadS3 = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const folderName = req.body.folderName || 'defaultFolder';
    const fileKey = `${folderName}/${v4()}-${req.file.originalname}`;
    const mimeType = req.file.mimetype; 

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        ContentType: mimeType, 
        Body: req.file.buffer
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        res.status(200).json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (err) {
        res.status(500).send({error: 'Error uploading file: ' + err.message});
    }
}

const deleteS3 = async (req, res) => {
    const { fileKey } = req.body;

    if (!fileKey) {
        return res.status(400).json({error: 'File key is required.'});
    }

    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        };
        await s3Client.send(new DeleteObjectCommand(params));
        res.status(200).json({message: 'File deleted successfully'});
    } catch (err) {
        res.status(500).json({error: 'Error deleting file: ' + err.message});
    }
}

const uploadR2 = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const folderName = req.body.folderName || 'uploads';
    const fileKey = `${folderName}/${v4()}-${req.file.originalname}`;
    const mimeType = req.file.mimetype; 

    const params = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
        ContentType: mimeType, 
        Body: req.file.buffer
    };

    try {
        await r2Client.send(new PutObjectCommand(params));
        const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
        res.status(200).json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (err) {
        res.status(500).send({error: 'Error uploading file: ' + err.message});
    }
}

const deleteR2 = async (req, res) => {
    const { fileKey } = req.body;

    if (!fileKey) {
        return res.status(400).json({error: 'File key is required.'});
    }

    try {
        const params = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        };
        await r2Client.send(new DeleteObjectCommand(params));
        res.status(200).json({message: 'File deleted successfully'});
    } catch (err) {
        res.status(500).json({error: 'Error deleting file: ' + err.message});
    }
}

module.exports = {
    uploadS3,
    deleteS3,
    uploadR2,
    deleteR2,
    uploadMemory,
    uploadCloudinary,
    uploadFileCloudinary,
    deleteFileCloudinary
}
