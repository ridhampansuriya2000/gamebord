import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  
  // Get hostname (e.g. tictactoe.gamebord.com, localhost:3000)
  const hostname = req.headers.get('host');
  
  if (!hostname) return NextResponse.next();

  // If subdomain is 'tictactoe' and path is '/', rewrite to '/tictactoe'
  if (hostname.startsWith('tictactoe.') && url.pathname === '/') {
    url.pathname = '/tictactoe';
    return NextResponse.rewrite(url);
  }

  // Similar for bingo, sos
  if (hostname.startsWith('bingo.') && url.pathname === '/') {
    url.pathname = '/bingo';
    return NextResponse.rewrite(url);
  }

  if (hostname.startsWith('sos.') && url.pathname === '/') {
    url.pathname = '/sos';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
