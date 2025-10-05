import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all topics
router.get('/', async (req: Request, res: Response) => {
  try {
    const queryString = req.url.split('?')[1] || '';
    const response = await d1Client.get(`/topics${queryString ? '?' + queryString : ''}`);
    res.json(response.data);
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

// Create topic
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/topics', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update topic
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.put(`/topics/${req.params.id}`, req.body);
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

// Get topic quizzes
router.get('/:id/quizzes', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/topics/${req.params.id}/quizzes`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create topic quiz
router.post('/:id/quizzes', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post(`/topics/${req.params.id}/quizzes`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update topic quiz
router.put('/:topicId/quizzes/:quizId', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.put(`/topics/${req.params.topicId}/quizzes/${req.params.quizId}`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete topic quiz
router.delete('/:topicId/quizzes/:quizId', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/topics/${req.params.topicId}/quizzes/${req.params.quizId}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
