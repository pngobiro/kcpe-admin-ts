import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all quizzes
router.get('/', async (req: Request, res: Response) => {
  try {
    const queryString = req.url.split('?')[1] || '';
    const response = await d1Client.get(`/quizzes${queryString ? '?' + queryString : ''}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/quizzes/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create quiz
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/quizzes', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update quiz
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.put(`/quizzes/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quiz
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/quizzes/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz questions
router.get('/:id/questions', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/quizzes/${req.params.id}/questions`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save quiz questions
router.post('/:id/questions', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post(`/quizzes/${req.params.id}/questions`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload quiz data to R2 storage
router.post('/:id/upload-data', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post(`/quizzes/${req.params.id}/upload-data`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
