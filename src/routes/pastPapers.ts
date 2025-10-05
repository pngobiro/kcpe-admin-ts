import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all past papers
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.subject_id) params.subject_id = req.query.subject_id;
    if (req.query.exam_set_id) params.exam_set_id = req.query.exam_set_id;
    if (req.query.year) params.year = req.query.year;
    
    const response = await d1Client.get('/pastpapers', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get past paper by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/pastpapers/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update past paper
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/pastpapers', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete past paper
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/pastpapers/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
