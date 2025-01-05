import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const aioraResponse = await fetch(`${process.env.NEXT_PUBLIC_AIORA_API_URL}${req.query.path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!aioraResponse.ok) {
      throw new Error(`Aiora API responded with status ${aioraResponse.status}`);
    }

    const contentType = aioraResponse.headers.get('content-type');
    
    // If response is an image, forward it as binary data
    if (contentType?.includes('image/')) {
      const imageBuffer = await aioraResponse.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(imageBuffer));
      return;
    }

    // Otherwise, try to parse as JSON
    const data = await aioraResponse.json();
    res.status(aioraResponse.status).json(data);
  } catch (error) {
    console.error('Aiora proxy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 