// src/routes/auth.js
import { renderLoginForm } from '../templates/auth/index.js';
import { hashPassword, verifyPassword } from '../utils/auth.js';
import { createJWT } from '../utils/jwt.js';

export const authRoutes = {
  '/login': {
    GET: async (request, env) => {
      return new Response(renderLoginForm(), {
        headers: { 'Content-Type': 'text/html' }
      });
    },

    POST: async (request, env) => {
      try {
        const formDataRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        const formData = await formDataRequest.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        console.log('Login attempt:', { username, passwordLength: password?.length });

        if (!username || !password) {
          throw new Error('Missing username or password');
        }

        // Get user from database
        const userRecord = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ?'
        ).bind(username).first();

        console.log('Database query result:', {
          found: !!userRecord,
          hasPassword: !!userRecord?.password,
          hasSalt: !!userRecord?.salt
        });

        if (!userRecord) {
          return new Response('Invalid username or password', { status: 401 });
        }

        const isValid = await verifyPassword(
          password,
          userRecord.password,
          userRecord.salt
        );

        console.log('Password verification result:', { isValid });

        if (!isValid) {
          return new Response('Invalid username or password', { status: 401 });
        }

        const token = await createJWT(
          { id: userRecord.id, username: userRecord.username },
          env.JWT_SECRET
        );

        const url = new URL(request.url);
        const isSecure = url.protocol === 'https:';
        
        const headers = new Headers({
          'Set-Cookie': `token=${token}; HttpOnly; ${isSecure ? 'Secure; ' : ''}Path=/`,
          'Location': url.origin + '/'
        });

        console.log('Setting auth cookie:', {
          token: token.substring(0, 10) + '...',
          isSecure,
          cookieHeader: headers.get('Set-Cookie')
        });

        return new Response(null, {
          status: 303,
          headers
        });
      } catch (error) {
        console.error('Login error:', error);
        return new Response(`Authentication error: ${error.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
  },

  '/logout': {
    GET: async (request) => {
      const headers = new Headers({
        'Set-Cookie': 'token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Location': '/'
      });
      
      return new Response(null, {
        status: 303,
        headers
      });
    }
  }
};