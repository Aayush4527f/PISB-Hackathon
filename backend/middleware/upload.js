import multer from 'multer';

// Configure multer to use memory storage.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    // Limit file size to 10MB
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  }
});

// Export the configured upload middleware
export default upload;
