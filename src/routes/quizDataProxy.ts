import { Router, Request, Response } from 'express';

const router = Router();

// Proxy quiz data with authentication
router.get('/proxy', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Quiz data URL is required' 
      });
    }

    console.log('Proxying request to:', url);

    // Add authentication headers for Cloudflare API requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if the URL is from our Cloudflare domain
    const apiKey = process.env.CLOUDFLARE_API_KEY;
    if (url.includes('east-africa-education-api.pngobiro.workers.dev') && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['X-API-Key'] = apiKey;
      console.log('Adding authentication for Cloudflare API');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
