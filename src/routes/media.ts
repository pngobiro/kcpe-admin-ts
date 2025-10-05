import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

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

// Upload media file
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { filename, content_type, description } = req.body;
    
    const response = await d1Client.post('/media/upload', {
      filename,
      content_type,
      description
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
