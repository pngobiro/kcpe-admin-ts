import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const PORT = process.env.PORT || 3000;
const D1_API_URL = process.env.CLOUDFLARE_API_URL || 'https://east-africa-education-api.pngobiro.workers.dev/api';
const D1_API_KEY = process.env.CLOUDFLARE_API_KEY || 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure';

// API client for Cloudflare D1
const d1Client = axios.create({
  baseURL: D1_API_URL,
  headers: {
    'X-API-Key': D1_API_KEY,
    'Content-Type': 'application/json'
  }
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ============ COURSES ============

// Get all courses
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get('/courses');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/courses/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update course
app.post('/api/courses', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/courses', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
app.delete('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/courses/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SUBJECTS ============

// Get all subjects
app.get('/api/subjects', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.course_id) params.course_id = req.query.course_id;
    
    const response = await d1Client.get('/subjects', { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update subject
app.post('/api/subjects', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/subjects', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EXAM SETS ============

// Get all exam sets
app.get('/api/examsets', async (req: Request, res: Response) => {
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

// Create/Update exam set
app.post('/api/examsets', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/examsets', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PAST PAPERS ============

// Get all past papers
app.get('/api/pastpapers', async (req: Request, res: Response) => {
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

// Create/Update past paper
app.post('/api/pastpapers', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/pastpapers', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ QUESTIONS ============

// Get questions for exam set
app.get('/api/questions', async (req: Request, res: Response) => {
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

// Upload questions JSON to R2
app.post('/api/questions/upload', async (req: Request, res: Response) => {
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
app.post('/api/questions/export', async (req: Request, res: Response) => {
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

// ============ HEALTH CHECK ============

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    d1_api: D1_API_URL
  });
});

// ============ ROOT ============

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'KCPE Admin API',
    version: '1.0.0',
    description: 'Direct management interface for Cloudflare D1 database',
    endpoints: {
      courses: '/api/courses',
      subjects: '/api/subjects',
      examSets: '/api/examsets',
      pastPapers: '/api/pastpapers',
      questions: '/api/questions',
      health: '/health'
    },
    note: 'All data is managed directly in Cloudflare D1. No local storage.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 KCPE Admin API is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔗 D1 API: ${D1_API_URL}`);
  console.log(`💚 Health: http://localhost:${PORT}/health\n`);
  console.log(`📝 No local database - managing remote D1 directly`);
});
