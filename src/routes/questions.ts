import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get questions for exam set
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.exam_set_id) params.exam_set_id = req.query.exam_set_id;
    if (req.query.subject_id) params.subject_id = req.query.subject_id;
    
    const response = await d1Client.get('/questions', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get question by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/questions/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update question
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/questions', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/questions/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload questions JSON to R2
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { filename, questions } = req.body;
    
    // Upload to R2 via Workers API
    const response = await d1Client.post('/questions/upload', {
      filename,
      questions
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export questions to JSON format
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { exam_set_id, subject_id } = req.body;
    
    // Get questions from D1
    const response = await d1Client.get('/questions', {
      params: { exam_set_id, subject_id }
    });
    
    const questions = response.data.data || [];
    
    // Format for Android app
    const formattedQuestions = questions.map((q: any) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      marks: q.marks,
      options: q.options || []
    }));
    
    res.json({
      success: true,
      data: formattedQuestions,
      count: formattedQuestions.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
