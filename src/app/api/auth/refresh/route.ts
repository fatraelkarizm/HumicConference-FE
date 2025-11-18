import { NextRequest, NextResponse } from 'next/server';

// GET method untuk check refresh token
export async function GET(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    console.log('Checking refresh token:', !!refreshToken);
    
    return NextResponse.json({
      hasRefreshToken: !!refreshToken,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking refresh token:', error);
    return NextResponse.json(
      { hasRefreshToken: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST method untuk refresh token
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      console.log('No refresh_token found in cookies');
      return NextResponse.json(
        { 
          code: 401,
          status: 'error',
          message: 'Refresh token not found',
          data: null,
          errors: null
        },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const backendEndpoint = `${backendUrl}/api/v1/auth/refresh-token`;
    
    console.log('Forwarding refresh request to:', backendEndpoint);
    
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`,
      },
    });


    // DEBUG: Log semua headers dari backend
    console.log('Backend response headers:');
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          code: response.status,
          status: 'error',
          message: errorData.message || 'Failed to refresh token',
          data: null,
          errors: errorData.errors || null
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract access token dari Authorization header
    const authHeader = response.headers.get('authorization');
    if (authHeader) {
      console.log('Found authorization header from backend:', authHeader.substring(0, 20) + '...');
      
      // Extract token dari "Bearer ..."
      const accessToken = authHeader.replace('Bearer ', '');
      
      // Add access token ke response data
      data.data = {
        accessToken: accessToken,
        user: null // Will be fetched by frontend
      };
      
      console.log('Added access token to response data');
    } else {
      console.log('No authorization header found in backend response');
    }

    // Forward response dengan data yang sudah di-update
    const nextResponse = NextResponse.json(data);
    
    // Forward cookies dari backend (refresh token baru)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Forwarding set-cookie header from backend');
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Refresh token error:', error);
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