import { Router, Request, Response } from 'express';
import { d1Client } from '../utils/apiClient';

const router = Router();

// Get sample data from each endpoint to discover schema
router.get('/', async (_req: Request, res: Response) => {
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

export default router;
