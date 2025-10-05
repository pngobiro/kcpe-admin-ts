import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all subjects
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.course_id) params.course_id = req.query.course_id;
    
    const response = await d1Client.get('/subjects', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get subject by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/subjects/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/subjects', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subject
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/subjects/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
