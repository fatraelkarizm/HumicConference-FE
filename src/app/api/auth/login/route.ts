import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const backendEndpoint = `${backendUrl}/api/v1/auth/login`;
    
    
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });


    // DEBUG: Log semua headers dari backend
    response.headers.forEach((value, key) => {
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    // Extract access token dari Authorization header
    const authHeader = response.headers.get('authorization');
    if (authHeader) {
      
      // Extract token dari "Bearer ..."
      const accessToken = authHeader.replace('Bearer ', '');
      
      // Add access token ke response data
      if (data.data) {
        data.data.accessToken = accessToken;
      } else {
        data.data = {
          ...data.data,
          accessToken: accessToken
        };
      }
      
    } else {
    }

    // Forward response dengan data yang sudah di-update
    const nextResponse = NextResponse.json(data);
    
    // Forward cookies dari backend (refresh token)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { 
        code: 500,
        status: 'error',
        message: 'Internal server error',
        data: null,
        errors: null
      },
      { status: 500 }
    );
  }
}