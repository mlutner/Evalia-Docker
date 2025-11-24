import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evalia Survey Builder API',
      version: '1.0.0',
      description: 'API documentation for Evalia, an AI-powered survey builder for trainers',
      contact: {
        name: 'Evalia Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://evalia.replit.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            profileImageUrl: { type: 'string' },
            resendApiKey: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Survey: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            questions: { type: 'array', items: { type: 'object' } },
            welcomeMessage: { type: 'string' },
            thankYouMessage: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Draft', 'Closed'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SurveyResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            surveyId: { type: 'string' },
            answers: { type: 'object' },
            respondentId: { type: 'string' },
            submittedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get application version
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Application version
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version: { type: 'string' }
 */

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Get all surveys for current user
 *     tags: [Surveys]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Survey' }
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, questions]
 *             properties:
 *               title: { type: 'string', example: 'Training Feedback Survey' }
 *               description: { type: 'string' }
 *               questions: { type: 'array', items: { type: 'object' } }
 *               welcomeMessage: { type: 'string' }
 *               thankYouMessage: { type: 'string' }
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Survey' }
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Get a specific survey
 *     tags: [Surveys]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Survey details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Survey' }
 *       404:
 *         description: Survey not found
 */

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   get:
 *     summary: Get all responses for a survey
 *     tags: [Responses]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: List of survey responses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SurveyResponse' }
 */

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   post:
 *     summary: Submit a survey response
 *     tags: [Responses]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: 'string' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers: { type: 'object' }
 *               respondentId: { type: 'string' }
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SurveyResponse' }
 */

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSurveys: { type: 'number' }
 *                 activeSurveys: { type: 'number' }
 *                 avgScore: { type: 'number' }
 *                 responseRate: { type: 'number' }
 */
