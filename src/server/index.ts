import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import coursesRouter from '../routes/courses';
import subjectsRouter from '../routes/subjects';
import topicsRouter from '../routes/topics';
import examSetsRouter from '../routes/examSets';
import pastPapersRouter from '../routes/pastPapers';
import questionsRouter from '../routes/questions';
import lessonsRouter from '../routes/lessons';
import quizzesRouter from '../routes/quizzes';
import quizQuestionsRouter from '../routes/quizQuestions';
import quizDataProxyRouter from '../routes/quizDataProxy';
import mediaRouter from '../routes/media';
import productsRouter from '../routes/products';
import schemaRouter from '../routes/schema';

dotenv.config();

const PORT = process.env.PORT || 3000;
const D1_API_URL = process.env.CLOUDFLARE_API_URL || 'https://east-africa-education-api.pngobiro.workers.dev/api';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Mount route modules
app.use('/api/courses', coursesRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/examsets', examSetsRouter);
app.use('/api/pastpapers', pastPapersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/quiz-questions', quizQuestionsRouter);
app.use('/api', quizDataProxyRouter);
app.use('/api/media', mediaRouter);
app.use('/api/products', productsRouter);
app.use('/api/schema', schemaRouter);

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
    description: 'Modular management interface for Cloudflare D1 database',
    endpoints: {
      courses: '/api/courses',
      subjects: '/api/subjects',
      topics: '/api/topics',
      lessons: '/api/lessons',
      quizzes: '/api/quizzes',
      quizQuestions: '/api/quiz-questions',
      examSets: '/api/examsets',
      pastPapers: '/api/pastpapers',
      questions: '/api/questions',
      media: '/api/media',
      products: '/api/products',
      schema: '/api/schema',
      health: '/health'
    },
    note: 'All data is managed directly in Cloudflare D1. Modular architecture for better maintainability.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 KCPE Admin API is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔗 D1 API: ${D1_API_URL}`);
  console.log(`💚 Health: http://localhost:${PORT}/health\n`);
  console.log(`📝 Modular architecture - using dedicated route files`);
  console.log(`🎯 Available routes:`);
  console.log(`   • Courses: /api/courses`);
  console.log(`   • Subjects: /api/subjects`);
  console.log(`   • Topics: /api/topics`);
  console.log(`   • Lessons: /api/lessons`);
  console.log(`   • Quizzes: /api/quizzes`);
  console.log(`   • Quiz Questions: /api/quiz-questions`);
  console.log(`   • Exam Sets: /api/examsets`);
  console.log(`   • Past Papers: /api/pastpapers`);
  console.log(`   • Questions: /api/questions`);
  console.log(`   • Media: /api/media`);
  console.log(`   • Products: /api/products`);
  console.log(`   • Schema: /api/schema\n`);
});
