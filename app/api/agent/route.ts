import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { graphId, inputs } = await req.json();
    const apiKey = process.env.AUTOGPT_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing AUTOGPT_API_KEY' }, { status: 500 });
    }

    // AutoGPT API call
    const response = await fetch(`https://backend.agpt.co/external-api/v1/graphs/${graphId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'AutoGPT API Error', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
