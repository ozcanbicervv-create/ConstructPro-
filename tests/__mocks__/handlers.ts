// MSW (Mock Service Worker) handlers for API mocking
import { http, HttpResponse } from 'msw';
import { createMockUser, createMockProject, createMockApiResponse } from './factories';

// API base URL
const API_BASE = '/api';

export const handlers = [
  // Auth endpoints
  http.get(`${API_BASE}/auth/session`, () => {
    return HttpResponse.json(createMockApiResponse({
      user: createMockUser(),
      expires: '2025-12-31',
    }));
  }),

  http.post(`${API_BASE}/auth/signin`, () => {
    return HttpResponse.json(createMockApiResponse({
      user: createMockUser(),
      token: 'mock-jwt-token',
    }));
  }),

  // User endpoints
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(createMockApiResponse([
      createMockUser({ id: '1', name: 'John Doe' }),
      createMockUser({ id: '2', name: 'Jane Smith' }),
    ]));
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    return HttpResponse.json(createMockApiResponse(
      createMockUser({ id: params.id as string })
    ));
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    const userData = await request.json();
    return HttpResponse.json(createMockApiResponse(
      createMockUser(userData as any)
    ), { status: 201 });
  }),

  // Project endpoints
  http.get(`${API_BASE}/projects`, () => {
    return HttpResponse.json(createMockApiResponse([
      createMockProject({ id: '1', name: 'Construction Site A' }),
      createMockProject({ id: '2', name: 'Office Building B' }),
    ]));
  }),

  http.get(`${API_BASE}/projects/:id`, ({ params }) => {
    return HttpResponse.json(createMockApiResponse(
      createMockProject({ id: params.id as string })
    ));
  }),

  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const projectData = await request.json();
    return HttpResponse.json(createMockApiResponse(
      createMockProject(projectData as any)
    ), { status: 201 });
  }),

  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }),

  // Error simulation
  http.get(`${API_BASE}/error`, () => {
    return HttpResponse.json({
      error: 'Internal Server Error',
      message: 'This is a test error',
    }, { status: 500 });
  }),
];