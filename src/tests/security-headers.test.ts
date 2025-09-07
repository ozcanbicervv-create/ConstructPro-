import { describe, it, expect } from '@jest/globals';
import { NextRequest } from 'next/server';

import { createSecurityHeadersMiddleware, securityConfigs } from '@/middleware/security-headers.middleware';

describe('Security Headers Middleware', () => {
  describe('CORS Handling', () => {
    it('should handle preflight OPTIONS request', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      const middleware = createSecurityHeadersMiddleware({
        cors: {
          origin: ['http://localhost:3000'],
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true
        }
      });

      const response = middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should reject unauthorized origins', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      });

      const middleware = createSecurityHeadersMiddleware({
        cors: {
          origin: ['http://localhost:3000'],
          methods: ['GET', 'POST']
        }
      });

      const response = middleware(request);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should handle wildcard origin', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          'Origin': 'http://any-origin.com'
        }
      });

      const middleware = createSecurityHeadersMiddleware({
        cors: {
          origin: true // Allow all origins
        }
      });

      const response = middleware(request);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Content Security Policy', () => {
    it('should set CSP header in production mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        csp: {
          directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"]
          },
          reportOnly: false
        }
      });

      const response = middleware(request);
      
      const cspHeader = response.headers.get('Content-Security-Policy');
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline'");
    });

    it('should set CSP report-only header in development', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        csp: {
          directives: {
            'default-src': ["'self'"]
          },
          reportOnly: true
        }
      });

      const response = middleware(request);
      
      expect(response.headers.get('Content-Security-Policy-Report-Only')).toContain("default-src 'self'");
      expect(response.headers.get('Content-Security-Policy')).toBeNull();
    });
  });

  describe('HSTS (HTTP Strict Transport Security)', () => {
    it('should set HSTS header for HTTPS requests', async () => {
      const request = new NextRequest('https://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      });

      const response = middleware(request);
      
      const hstsHeader = response.headers.get('Strict-Transport-Security');
      expect(hstsHeader).toBe('max-age=31536000; includeSubDomains; preload');
    });

    it('should not set HSTS header for HTTP requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true
        }
      });

      const response = middleware(request);
      
      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });
  });

  describe('Security Headers', () => {
    it('should set all security headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        frameOptions: 'DENY',
        contentTypeOptions: true,
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      const response = middleware(request);
      
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('off');
      expect(response.headers.get('X-Download-Options')).toBe('noopen');
      expect(response.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
    });

    it('should set Permissions Policy header', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        permissionsPolicy: {
          camera: ['self'],
          microphone: ['none'],
          geolocation: ['self', 'https://trusted-site.com']
        }
      });

      const response = middleware(request);
      
      const permissionsHeader = response.headers.get('Permissions-Policy');
      expect(permissionsHeader).toContain('camera=(self)');
      expect(permissionsHeader).toContain('microphone=()');
      expect(permissionsHeader).toContain('geolocation=(self "https://trusted-site.com")');
    });
  });

  describe('Environment-specific Configurations', () => {
    it('should use development configuration', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware(securityConfigs.development);
      const response = middleware(request);
      
      // Development should have report-only CSP
      expect(response.headers.get('Content-Security-Policy-Report-Only')).toBeDefined();
      expect(response.headers.get('Content-Security-Policy')).toBeNull();
    });

    it('should use production configuration', async () => {
      const request = new NextRequest('https://api.constructpro.com/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware(securityConfigs.production);
      const response = middleware(request);
      
      // Production should have enforced CSP
      expect(response.headers.get('Content-Security-Policy')).toBeDefined();
      expect(response.headers.get('Content-Security-Policy-Report-Only')).toBeNull();
      
      // Production should have HSTS
      expect(response.headers.get('Strict-Transport-Security')).toBeDefined();
    });
  });

  describe('Cross-Origin Headers', () => {
    it('should set cross-origin headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware();
      const response = middleware(request);
      
      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
    });
  });

  describe('Custom Frame Options', () => {
    it('should set custom frame options', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        frameOptions: 'SAMEORIGIN'
      });

      const response = middleware(request);
      
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });

    it('should set allow-from frame options', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET'
      });

      const middleware = createSecurityHeadersMiddleware({
        frameOptions: 'ALLOW-FROM https://trusted-site.com'
      });

      const response = middleware(request);
      
      expect(response.headers.get('X-Frame-Options')).toBe('ALLOW-FROM https://trusted-site.com');
    });
  });
});