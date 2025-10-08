import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all courses
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get('/courses');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/courses/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam sets for a specific course
router.get('/:courseId/examsets', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { year } = req.query;
    
    const params: any = { course_id: courseId };
    if (year) params.year = year;
    
    const response = await d1Client.get('/examsets', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update course
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/courses', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/courses/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
