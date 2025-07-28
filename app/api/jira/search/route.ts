import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const jiraDomain = request.headers.get('x-jira-domain');

  if (!authHeader || !jiraDomain) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const response = await fetch(`https://${jiraDomain}/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to search issues' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search issues' }, { status: 500 });
  }
}