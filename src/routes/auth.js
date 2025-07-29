// src/routes/auth.js
import { renderLoginForm } from '../templates/auth/index.js';
import { hashPassword, verifyPassword } from '../utils/auth.js';
import { createJWT } from '../utils/jwt.js';
import { UserModel } from '../../../../lib.deadlight/core/src/db/models/user.js';
import { Logger } from '../../../../lib.deadlight/core/src/logging/logger.js';

export const authRoutes = {
  '/login': {
    GET: async (request, env) => {
      return new Response(renderLoginForm(), {
        headers: { 'Content-Type': 'text/html' }
      });
    },

    POST: async (request, env) => {
      const userModel = new UserModel(env.DB);
      const logger = new Logger({ context: 'auth' });
      
      try {
        const formDataRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        const formData = await formDataRequest.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        logger.info('Login attempt', { username, passwordLength: password?.length });

        if (!username || !password) {
          return new Response('Missing username or password', { status: 400 });
        }

        // Use the model's authenticate method
        const authResult = await userModel.authenticate(username, password);
        
        if (!authResult.success) {
          logger.warn('Failed login attempt', { username, reason: authResult.error });
          return new Response('Invalid username or password', { status: 401 });
        }

        const { user } = authResult;
        
        // Update last login
        await userModel.updateLastLogin(user.id);

        // Create JWT (still using your existing function)
        const token = await createJWT(
          { id: user.id, username: user.username, role: user.role || 'user' },
          env.JWT_SECRET
        );

        const url = new URL(request.url);
        const isSecure = url.protocol === 'https:';
        
        const headers = new Headers({
          'Set-Cookie': `token=${token}; HttpOnly; ${isSecure ? 'Secure; ' : ''}Path=/`,
          'Location': url.origin + '/'
        });

        logger.info('Successful login', { 
          userId: user.id, 
          username: user.username
        });

        return new Response(null, { status: 303, headers });
        
      } catch (error) {
        logger.error('Login error', { error: error.message });
        return new Response('Internal server error', { status: 500 });
      }
    }
  },  // <-- Close /login here

  '/logout': {  // <-- Now /logout is a sibling of /login
    GET: async (request, env) => {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
        }
      });
    },
    POST: async (request, env) => {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
        }
      });
    }
  }
};