import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set('token', '', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none', 
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
  
  return response;
}
