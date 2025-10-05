import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all exam sets
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.course_id) params.course_id = req.query.course_id;
    if (req.query.year) params.year = req.query.year;
    
    const response = await d1Client.get('/examsets', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam set by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/examsets/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update exam set
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/examsets', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete exam set
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/examsets/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
