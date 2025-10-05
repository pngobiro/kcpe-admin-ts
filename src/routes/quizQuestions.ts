import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all quiz questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.topic_id) params.topic_id = req.query.topic_id;
    if (req.query.subject_id) params.subject_id = req.query.subject_id;
    if (req.query.course_id) params.course_id = req.query.course_id;
    
    const response = await d1Client.get('/quiz-questions', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz question by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/quiz-questions/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new quiz question
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/quiz-questions', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update quiz question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.put(`/quiz-questions/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quiz question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/quiz-questions/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export quiz questions for a topic
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { topic_id, subject_id, course_id } = req.body;
    
    const response = await d1Client.get('/quiz-questions', {
      params: { topic_id, subject_id, course_id }
    });
    
    const questions = response.data.data || [];
    
    // Format for Android app
    const formattedQuestions = questions.map((q: any) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      marks: q.marks || 1,
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
