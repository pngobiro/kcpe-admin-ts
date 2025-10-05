import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all lessons
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.topic_id) {
      // Get lessons by topic
      const response = await d1Client.get(`/topics/${req.query.topic_id}/lessons`, { params });
      res.json(response.data);
    } else {
      res.status(400).json({ error: 'topic_id is required' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/lessons/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update lesson
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/lessons', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/lessons/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
