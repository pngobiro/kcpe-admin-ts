import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as https from 'https';
import * as http from 'http';

const router = Router();

// Media upload proxy - forward multipart data properly
router.post('/upload', (req: Request, res: Response) => {
  const options = {
    hostname: 'east-africa-education-api.pngobiro.workers.dev',
    port: 443,
    path: '/api/media/upload',
    method: 'POST',
    headers: {
      ...req.headers,
      'X-API-Key': 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 500);
    
    // Forward response headers
    Object.keys(proxyRes.headers).forEach(key => {
      const value = proxyRes.headers[key];
      if (value) {
        res.setHeader(key, value);
      }
    });
    
    // Pipe response back
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Media upload proxy error:', error);
    res.status(500).json({ error: 'Upload failed' });
  });

  // Pipe the request body (multipart data)
  req.pipe(proxyReq);
});

// Media serving proxy
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      `https://east-africa-education-api.pngobiro.workers.dev/api/media/${req.params.key}`,
      {
        headers: {
          'X-API-Key': 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure',
        },
        responseType: 'stream',
      }
    );

    res.set(response.headers);
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Media serving proxy error:', error.message);
    res.status(error.response?.status || 500).send('Media not found');
  }
});

export default router;
