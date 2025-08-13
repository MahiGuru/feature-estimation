import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const jiraDomain = request.headers.get('x-jira-domain');

  if (!authHeader || !jiraDomain) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 401 });
  }

  try {
    const response = await fetch(`https://${jiraDomain}/rest/api/3/myself`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to test connection' }, { status: 500 });
  }
}