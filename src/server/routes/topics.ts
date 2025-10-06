import { Router } from 'express';
import { proxyToWorker } from '../utils/proxy';

const router = Router();

// GET /api/topics
router.get('/', async (req, res) => {
  try {
    await proxyToWorker(req, res, 'topics');
  } catch (error) {
    console.error('Topics GET error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// GET /api/topics/:id
router.get('/:id', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.id}`);
  } catch (error) {
    console.error('Topic GET error:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// POST /api/topics
router.post('/', async (req, res) => {
  try {
    await proxyToWorker(req, res, 'topics');
  } catch (error) {
    console.error('Topic POST error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// PUT /api/topics/:id
router.put('/:id', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.id}`);
  } catch (error) {
    console.error('Topic PUT error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// DELETE /api/topics/:id
router.delete('/:id', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.id}`);
  } catch (error) {
    console.error('Topic DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// GET /api/topics/:id/quizzes
router.get('/:id/quizzes', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.id}/quizzes`);
  } catch (error) {
    console.error('Topic quizzes GET error:', error);
    res.status(500).json({ error: 'Failed to fetch topic quizzes' });
  }
});

// POST /api/topics/:id/quizzes
router.post('/:id/quizzes', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.id}/quizzes`);
  } catch (error) {
    console.error('Topic quiz POST error:', error);
    res.status(500).json({ error: 'Failed to create topic quiz' });
  }
});

// PUT /api/topics/:topicId/quizzes/:quizId
router.put('/:topicId/quizzes/:quizId', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.topicId}/quizzes/${req.params.quizId}`);
  } catch (error) {
    console.error('Topic quiz PUT error:', error);
    res.status(500).json({ error: 'Failed to update topic quiz' });
  }
});

// DELETE /api/topics/:topicId/quizzes/:quizId
router.delete('/:topicId/quizzes/:quizId', async (req, res) => {
  try {
    await proxyToWorker(req, res, `topics/${req.params.topicId}/quizzes/${req.params.quizId}`);
  } catch (error) {
    console.error('Topic quiz DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete topic quiz' });
  }
});

export default router;