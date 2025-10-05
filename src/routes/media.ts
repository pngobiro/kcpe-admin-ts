import { Router, Request, Response } from 'express';
import multer from 'multer';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common media types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// Get all media files
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get('/media');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get media by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/media/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update media
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/media', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete media
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/media/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media file to Cloudflare R2
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    const file = req.file;
    const { description } = req.body;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const filename = `quiz-media/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Convert buffer to base64 for transmission to Cloudflare Worker
    const fileBase64 = file.buffer.toString('base64');

    const uploadData = {
      filename,
      content_type: file.mimetype,
      description: description || `Uploaded ${file.originalname}`,
      file_data: fileBase64,
      original_name: file.originalname,
      file_size: file.size
    };

    console.log(`Uploading file: ${file.originalname} (${file.size} bytes) as ${filename}`);

    const response = await d1Client.post('/media/upload', uploadData);
    
    if (response.data?.success) {
      res.json({
        success: true,
        data: {
          id: response.data.data?.id,
          url: response.data.data?.url,
          filename: filename,
          original_name: file.originalname,
          content_type: file.mimetype,
          file_size: file.size
        }
      });
    } else {
      throw new Error(response.data?.error || 'Upload failed');
    }
    
  } catch (error: any) {
    console.error('Media upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload file' 
    });
  }
});

export default router;
