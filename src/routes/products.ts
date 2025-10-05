import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get all products
router.get('/', async (_req: Request, res: Response) => {
  try {
    const response = await d1Client.get('/products');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.get(`/products/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update product
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.post('/products', req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await d1Client.delete(`/products/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
