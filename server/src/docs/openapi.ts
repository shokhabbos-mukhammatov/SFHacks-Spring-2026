import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SFHacks Spring 2026 API',
      version: '1.0.0',
      description: 'Backend API for the SFHacks Spring 2026 project.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Service health endpoints' },
      { name: 'Events', description: 'Map events and random event discovery' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Get service health',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number', example: 123.45 },
                    },
                    required: ['status', 'timestamp', 'uptime'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/events': {
        get: {
          tags: ['Events'],
          summary: 'List events for the map',
          parameters: [
            {
              in: 'query',
              name: 'category',
              schema: {
                type: 'string',
                enum: ['tech', 'social', 'music', 'career', 'arts'],
              },
              required: false,
            },
            {
              in: 'query',
              name: 'tags',
              schema: {
                type: 'string',
                example: 'networking,students',
              },
              required: false,
              description: 'Comma-separated event tags. An event must match all supplied tags.',
            },
          ],
          responses: {
            '200': {
              description: 'Matching events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: { type: 'number', example: 2 },
                      events: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'evt-ai-hack-night' },
                            title: { type: 'string', example: 'AI Hack Night' },
                            description: {
                              type: 'string',
                              example: 'Build and demo small AI projects with other students.',
                            },
                            category: { type: 'string', example: 'tech' },
                            venueName: { type: 'string', example: 'SoMa Commons' },
                            address: {
                              type: 'string',
                              example: '123 Howard St, San Francisco, CA',
                            },
                            lat: { type: 'number', example: 37.7812 },
                            lng: { type: 'number', example: -122.3984 },
                            startTime: {
                              type: 'string',
                              format: 'date-time',
                            },
                            endTime: {
                              type: 'string',
                              format: 'date-time',
                            },
                            tags: {
                              type: 'array',
                              items: { type: 'string' },
                            },
                            price: { type: 'string', example: 'free' },
                          },
                          required: [
                            'id',
                            'title',
                            'description',
                            'category',
                            'venueName',
                            'address',
                            'lat',
                            'lng',
                            'startTime',
                            'endTime',
                            'tags',
                            'price',
                          ],
                        },
                      },
                    },
                    required: ['count', 'events'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/events/random': {
        get: {
          tags: ['Events'],
          summary: 'Get a random upcoming event',
          parameters: [
            {
              in: 'query',
              name: 'category',
              schema: {
                type: 'string',
                enum: ['tech', 'social', 'music', 'career', 'arts'],
              },
              required: false,
            },
            {
              in: 'query',
              name: 'tags',
              schema: {
                type: 'string',
                example: 'networking,students',
              },
              required: false,
            },
          ],
          responses: {
            '200': {
              description: 'A random event suggestion',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      event: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'evt-ai-hack-night' },
                          title: { type: 'string', example: 'AI Hack Night' },
                          venueName: { type: 'string', example: 'SoMa Commons' },
                          lat: { type: 'number', example: 37.7812 },
                          lng: { type: 'number', example: -122.3984 },
                          startTime: { type: 'string', format: 'date-time' },
                          category: { type: 'string', example: 'tech' },
                        },
                        required: ['id', 'title', 'venueName', 'lat', 'lng', 'startTime', 'category'],
                      },
                      reason: {
                        type: 'string',
                        example: 'Good for meeting new people without overthinking the plan.',
                      },
                      prompt: {
                        type: 'string',
                        example:
                          'Try AI Hack Night at SoMa Commons. Good for meeting new people without overthinking the plan.',
                      },
                    },
                    required: ['event', 'reason', 'prompt'],
                  },
                },
              },
            },
            '404': {
              description: 'No upcoming events matched the provided filters',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        example: 'No upcoming events matched the provided filters.',
                      },
                    },
                    required: ['error'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Get a single event by id',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'The requested event',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'evt-ai-hack-night' },
                      title: { type: 'string', example: 'AI Hack Night' },
                      description: {
                        type: 'string',
                        example: 'Build and demo small AI projects with other students.',
                      },
                      category: { type: 'string', example: 'tech' },
                      venueName: { type: 'string', example: 'SoMa Commons' },
                      address: { type: 'string', example: '123 Howard St, San Francisco, CA' },
                      lat: { type: 'number', example: 37.7812 },
                      lng: { type: 'number', example: -122.3984 },
                      startTime: { type: 'string', format: 'date-time' },
                      endTime: { type: 'string', format: 'date-time' },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      price: { type: 'string', example: 'free' },
                    },
                    required: [
                      'id',
                      'title',
                      'description',
                      'category',
                      'venueName',
                      'address',
                      'lat',
                      'lng',
                      'startTime',
                      'endTime',
                      'tags',
                      'price',
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string', example: 'Event not found.' },
                    },
                    required: ['error'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/events/{id}/nearby-businesses': {
        get: {
          tags: ['Events'],
          summary: 'Get nearby businesses around an event',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
            {
              in: 'query',
              name: 'type',
              schema: {
                type: 'string',
                enum: ['coffee', 'food', 'bar', 'parking'],
              },
              required: false,
            },
            {
              in: 'query',
              name: 'radiusMeters',
              schema: {
                type: 'number',
                example: 1200,
              },
              required: false,
            },
          ],
          responses: {
            '200': {
              description: 'Nearby businesses',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      eventId: { type: 'string', example: 'evt-ai-hack-night' },
                      count: { type: 'number', example: 2 },
                      businesses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'biz-blue-bottle-soma' },
                            name: { type: 'string', example: 'Blue Bottle Coffee' },
                            category: { type: 'string', example: 'coffee' },
                            address: {
                              type: 'string',
                              example: '2 Mint Plaza, San Francisco, CA',
                            },
                            lat: { type: 'number', example: 37.7821 },
                            lng: { type: 'number', example: -122.4071 },
                            distanceMeters: { type: 'number', example: 771 },
                          },
                          required: [
                            'id',
                            'name',
                            'category',
                            'address',
                            'lat',
                            'lng',
                            'distanceMeters',
                          ],
                        },
                      },
                    },
                    required: ['eventId', 'count', 'businesses'],
                  },
                },
              },
            },
            '404': {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string', example: 'Event not found.' },
                    },
                    required: ['error'],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const openApiSpec = swaggerJSDoc(options);
