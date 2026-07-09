'use strict';

/**
 * Structured API error. Every error response has the shape:
 *   { error: { code: string, message: string, details?: any } }
 */
class ApiError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} code machine-readable error code
   * @param {string} message human-readable message
   * @param {*} [details] optional extra info
   */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new ApiError(400, 'bad_request', message, details);
const notFound = (message) => new ApiError(404, 'not_found', message);
const conflict = (message) => new ApiError(409, 'conflict', message);
const internal = (message, details) => new ApiError(500, 'internal', message, details);

/** Express error-handling middleware producing structured JSON errors. */
function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const code = err.code && typeof err.code === 'string' ? err.code : 'internal';
  if (status >= 500) {
    console.error('[api]', req.method, req.originalUrl, err);
  }
  res.status(status).json({
    error: {
      code,
      message: err.message || 'Internal server error',
      details: err.details,
    },
  });
}

/** Wrap an async route handler so rejections reach the error middleware. */
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ApiError, badRequest, notFound, conflict, internal, errorMiddleware, asyncRoute };
