// Path: backend/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler"); // Import the handler
const https = require('https'); // Import the https module
const crypto = require('crypto'); // Built-in Node.js module
const asyncHandler = require('../middleware/async'); // Your async handler
const { adminAuth } = require('../middleware/adminAuth'); // Your admin auth middleware

const router = express.Router();

// Configure multer for in-memory file storage (no local saving)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ FINAL FIX: Create a custom request handler that explicitly disables HTTP/2.
// This is a robust solution for persistent SSL handshake failures in certain Node.js environments.
const requestHandler = new NodeHttpHandler({
    httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized: true,
        maxSockets: 50,
        secureProtocol: 'TLSv1_2_method', // Keep this for protocol enforcement
    }),
    disableConcurrentStreams: true, // This effectively disables HTTP/2
});


// Configure the S3 client for Cloudflare R2
const s3Client = new S3Client({
    // Pass the custom request handler
    requestHandler: requestHandler,
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * @desc    Upload a single image to Cloudflare R2
 * @route   POST /api/v1/upload/image
 * @access  Private (Admin)
 */
router.post('/image', adminAuth, upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Generate a unique file name to prevent file overwrites
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${req.file.originalname}`;

    // Prepare the command to upload the file to your R2 bucket
    const putObjectParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer, // The image data from multer
        ContentType: req.file.mimetype, // e.g., 'image/jpeg'
    };

    const command = new PutObjectCommand(putObjectParams);

    // Execute the upload command
    await s3Client.send(command);

    // Construct the public URL using your custom domain from the .env file
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`;

    // Send the public URL back to the frontend
    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: publicUrl,
    });
}));


/**
 * @desc    Upload multiple images to Cloudflare R2
 * @route   POST /api/v1/upload/images
 * @access  Private (Admin)
 */
router.post('/images', adminAuth, upload.array('files', 10), asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    // Use Promise.all to upload all files in parallel
    const uploadPromises = req.files.map(file => {
        const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
        
        const putObjectParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(putObjectParams);
        return s3Client.send(command).then(() => `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`);
    });

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises);

    // Send the array of public URLs back to the frontend
    res.status(200).json({
        success: true,
        message: `${uploadedUrls.length} images uploaded successfully`,
        urls: uploadedUrls,
    });
}));


module.exports = router;
