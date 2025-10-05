import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all quizzes
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.topic_id) {
      const response = await d1Client.get(`/topics/${req.query.topic_id}/quizzes`, { params });
      res.json(response.data);
    } else if (req.query.lesson_id) {
      const response = await d1Client.get(`/lessons/${req.query.lesson_id}/quizzes`, { params });
      res.json(response.data);
    } else {
      res.status(400).json({ error: 'topic_id or lesson_id is required' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/quiz/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update quiz
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/quizzes', req.body);
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

export default router;
