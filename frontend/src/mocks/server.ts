import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        message: 'User registered successfully',
      })
    );
  }),

  // Tasks endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          due_date: new Date().toISOString(),
          priority: 'medium',
          status: 'pending',
        },
      ])
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 1,
        ...req.body,
      })
    );
  }),

  // Calendar endpoints
  rest.get('/api/calendar/events', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Event',
          description: 'Test Event Description',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
        },
      ])
    );
  }),

  // AI endpoints
  rest.post('/api/ai/chat', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Test AI response',
      })
    );
  }),

  rest.get('/api/ai/suggestions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          content: 'Test suggestion',
          type: 'task',
        },
      ])
    );
  }),
];

export const server = setupServer(...handlers); 