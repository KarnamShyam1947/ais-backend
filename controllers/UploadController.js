const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./../config/CloudinaryConfig");
const { extractPublicIdFromUrl } = require("./../lib/CloudniaryUtils");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ais',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
    }
});

const upload = multer({ storage });

const uploadFile = (req, res) => {
    // console.log(req);

    if (req.file && req.file.path) {
        res.json({ imageUrl: req.file.path });
    } else {
        res.status(400).json({ error: 'Upload failed' });
    }
}

const deleteFile = async (req, res) => {
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

module.exports = {
    upload,
    uploadFile,
    deleteFile
}
