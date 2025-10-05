const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
import { Request, Response } from 'express';

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
app.get('/api/courses', async (_req: Request, res: Response) => {
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

// Get subject by ID
app.get('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/subjects/${req.params.id}`);
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

// Delete subject
app.delete('/api/subjects/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/subjects/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TOPICS ============

// Get all topics
app.get('/api/topics', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.subject_id) params.subject_id = req.query.subject_id;
    
    const response = await d1Client.get(`/subjects/${req.query.subject_id}/topics`, { params });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get topic by ID
app.get('/api/topics/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/topics/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update topic
app.post('/api/topics', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/topics', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete topic
app.delete('/api/topics/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/topics/${req.params.id}`);
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

// ============ LESSONS ============

// Get all lessons
app.get('/api/lessons', async (req: Request, res: Response) => {
  try {
    const params: any = {};
    if (req.query.topic_id) {
      // Get lessons by topic
      const response = await d1Client.get(`/topics/${req.query.topic_id}/lessons`, { params });
      res.json(response.data);
    } else {
      res.status(400).json({ error: 'topic_id is required' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson by ID
app.get('/api/lessons/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/lessons/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update lesson
app.post('/api/lessons', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/lessons', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson
app.delete('/api/lessons/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/lessons/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ QUIZZES ============

// Get all quizzes
app.get('/api/quizzes', async (req: Request, res: Response) => {
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
app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/quiz/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update quiz
app.post('/api/quizzes', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/quizzes', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quiz
app.delete('/api/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/quizzes/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PRODUCTS ============

// Get all products
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const response = await d1Client.get('/products');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update product
app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/products', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SCHEMA DISCOVERY ============

// Get sample data from each endpoint to discover schema
app.get('/api/schema', async (_req: Request, res: Response) => {
  try {
    const schema: any = {};
    
    // Fetch sample data from each endpoint
    const endpoints = [
      { name: 'courses', path: '/courses' },
      { name: 'subjects', path: '/subjects' },
      { name: 'examsets', path: '/examsets' },
      { name: 'pastpapers', path: '/pastpapers' },
      { name: 'questions', path: '/questions' },
      { name: 'products', path: '/products' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await d1Client.get(endpoint.path);
        const data = response.data.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          // Get field types from first item
          const sample = data[0];
          schema[endpoint.name] = {
            fields: Object.keys(sample).map(key => ({
              name: key,
              type: typeof sample[key],
              sample: sample[key]
            })),
            sampleData: sample
          };
        }
      } catch (err) {
        schema[endpoint.name] = { error: 'Failed to fetch' };
      }
    }
    
    res.json({
      success: true,
      schema: schema,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    d1_api: D1_API_URL
  });
});

// ============ ROOT ============

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'KCPE Admin API',
    version: '1.0.0',
    description: 'Direct management interface for Cloudflare D1 database',
    endpoints: {
      courses: '/api/courses',
      subjects: '/api/subjects',
      topics: '/api/topics',
      lessons: '/api/lessons',
      quizzes: '/api/quizzes',
      examSets: '/api/examsets',
      pastPapers: '/api/pastpapers',
      questions: '/api/questions',
      products: '/api/products',
      schema: '/api/schema',
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
