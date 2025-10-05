import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all topics
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.subject_id) {
      const response = await d1Client.get(`/subjects/${req.query.subject_id}/topics`, { params });
      res.json(response.data);
    } else {
      res.status(400).json({ error: 'subject_id is required' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get topic by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/topics/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update topic
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/topics', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete topic
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/topics/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
