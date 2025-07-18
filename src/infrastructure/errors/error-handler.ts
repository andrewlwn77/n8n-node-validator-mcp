/**
 * Centralized error handling for the n8n Validator MCP
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ValidationError } from '../../types/validation.js';

export class ValidatorError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidatorError';
  }
}

export class GitHubApiError extends ValidatorError {
  constructor(message: string, public statusCode?: number, details?: Record<string, unknown>) {
    super('GITHUB_API_ERROR', message, details);
    this.name = 'GitHubApiError';
  }
}

export class ValidationFailedError extends ValidatorError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super('VALIDATION_FAILED', message, { validationErrors });
    this.name = 'ValidationFailedError';
  }
}

export class NodeNotFoundError extends ValidatorError {
  constructor(nodeType: string) {
    super('NODE_NOT_FOUND', `Node type '${nodeType}' not found in n8n repository`, { nodeType });
    this.name = 'NodeNotFoundError';
  }
}

export class ParseError extends ValidatorError {
  constructor(message: string, content?: string) {
    super('PARSE_ERROR', message, { content: content?.substring(0, 200) });
    this.name = 'ParseError';
  }
}

export class ErrorHandler {
  static handleError(error: Error): McpError {
    if (error instanceof ValidatorError) {
      return this.handleValidatorError(error);
    }

    if (error instanceof SyntaxError) {
      return new McpError(
        ErrorCode.InvalidParams,
        `Invalid JSON: ${error.message}`
      );
    }

    // Log unexpected errors for debugging
    console.error('Unexpected error:', error);

    return new McpError(
      ErrorCode.InternalError,
      'An unexpected error occurred'
    );
  }

  private static handleValidatorError(error: ValidatorError): McpError {
    switch (error.code) {
      case 'GITHUB_API_ERROR':
        return new McpError(
          ErrorCode.InternalError,
          `GitHub API error: ${error.message}`
        );

      case 'NODE_NOT_FOUND':
        return new McpError(
          ErrorCode.InvalidParams,
          error.message
        );

      case 'PARSE_ERROR':
        return new McpError(
          ErrorCode.InvalidParams,
          `Parse error: ${error.message}`
        );

      case 'VALIDATION_FAILED':
        // This is not actually an error - validation can fail legitimately
        return new McpError(
          ErrorCode.InvalidParams,
          error.message
        );

      default:
        return new McpError(
          ErrorCode.InternalError,
          error.message
        );
    }
  }

  static createUserFriendlyMessage(error: Error): string {
    if (error instanceof GitHubApiError) {
      if (error.statusCode === 403) {
        return 'GitHub API rate limit exceeded. Please try again later or configure a GitHub token.';
      }
      if (error.statusCode === 404) {
        return 'Repository or file not found. The n8n repository structure may have changed.';
      }
      return `GitHub API error: ${error.message}`;
    }

    if (error instanceof NodeNotFoundError) {
      return `Node type '${error.details?.nodeType}' not found. Please check the node type name.`;
    }

    if (error instanceof ParseError) {
      return `Unable to parse content: ${error.message}`;
    }

    return error.message || 'An unexpected error occurred';
  }
}