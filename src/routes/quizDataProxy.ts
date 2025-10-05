import { Router, Request, Response } from 'express';

const router = Router();

// Proxy for fetching quiz data with authentication
router.get('/quiz-data-proxy', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    console.log('Proxying request to:', url);

    // Add authentication headers if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key if available in environment
    if (process.env.CLOUDFLARE_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.CLOUDFLARE_API_KEY}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch quiz data: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      data: data
    });

  } catch (error: any) {
    console.error('Quiz data proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch quiz data'
    });
  }
});

export default router;
