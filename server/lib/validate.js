'use strict';

const Ajv = require('ajv');

/**
 * Central ajv instance + compiled validators for API payloads.
 * The legacy data model is loosely typed (documents grew organically),
 * so schemas validate the structural invariants the server relies on
 * rather than every field.
 */
const ajv = new Ajv({ allErrors: true, coerceTypes: false, allowUnionTypes: true });

const validators = {
  /** settings document: object with a numeric id and a string mode */
  settings: ajv.compile({
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: ['number', 'string'] },
      mode: { type: 'string' },
    },
  }),

  /** any object carrying an id */
  idObject: ajv.compile({
    type: 'object',
    required: ['id'],
    properties: { id: { type: ['number', 'string'] } },
  }),

  /** concept-map element: id (number) plus free-form body */
  cme: ajv.compile({
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'number' } },
  }),

  /** viewport query for loading elements */
  viewport: ajv.compile({
    type: 'object',
    properties: {
      l: { type: 'number' },
      t: { type: 'number' },
      r: { type: 'number' },
      b: { type: 'number' },
    },
  }),

  /** quiz answer: element id + SM2 quality scale */
  quizAnswer: ajv.compile({
    type: 'object',
    required: ['id', 'scale'],
    properties: {
      id: { type: 'number' },
      scale: { type: 'number', minimum: 0, maximum: 5 },
    },
  }),

  /** LaTeX render request */
  tex: ajv.compile({
    type: 'object',
    required: ['tex'],
    properties: {
      tex: { type: 'string', maxLength: 100000 },
      inline: { type: 'boolean' },
    },
  }),

  array: ajv.compile({ type: 'array' }),
  object: ajv.compile({ type: 'object' }),
};

module.exports = { ajv, validators };
