import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Address is required' });
  }

  try {
    const response = await fetch(
      `https://parallax-analytics.onrender.com/aiora/image-prompts?address=${address}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching image prompts:', error);
    res.status(500).json({ message: 'Error fetching image prompts' });
  }
} 