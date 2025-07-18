/**
 * Unit tests for ValidationEngine
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidationEngine } from '../../src/services/validation/validation-engine.js';
import { validGitHubNode, invalidGitHubNode, sampleParsedDefinition } from '../fixtures/sample-nodes.js';

describe('ValidationEngine', () => {
  let validationEngine: ValidationEngine;

  beforeEach(() => {
    validationEngine = new ValidationEngine();
  });

  describe('validateNode', () => {
    it('should validate a correct node successfully', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(validGitHubNode),
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should identify missing required properties', async () => {
      const nodeWithoutDisplayName = { ...validGitHubNode };
      delete nodeWithoutDisplayName.displayName;

      const result = await validationEngine.validateNode(
        JSON.stringify(nodeWithoutDisplayName),
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_property');
      expect(result.errors[0].path).toBe('displayName');
    });

    it('should identify incorrect property types', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(invalidGitHubNode),
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const typeErrors = result.errors.filter(e => e.type === 'invalid_type');
      expect(typeErrors.length).toBeGreaterThan(0);
    });

    it('should handle invalid JSON gracefully', async () => {
      const result = await validationEngine.validateNode(
        '{ invalid json',
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('structural_error');
    });

    it('should validate naming conventions', async () => {
      const nodeWithInvalidName = {
        ...validGitHubNode,
        name: '123-invalid-name'
      };

      const result = await validationEngine.validateNode(
        JSON.stringify(nodeWithInvalidName),
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(false);
      const namingErrors = result.errors.filter(e => 
        e.type === 'invalid_value' && e.path === 'name'
      );
      expect(namingErrors.length).toBe(1);
    });

    it('should validate property structure', async () => {
      const nodeWithInvalidProperty = {
        ...validGitHubNode,
        properties: [
          {
            // Missing required fields
            type: 'string'
          }
        ]
      };

      const result = await validationEngine.validateNode(
        JSON.stringify(nodeWithInvalidProperty),
        sampleParsedDefinition
      );

      expect(result.isValid).toBe(false);
      const structuralErrors = result.errors.filter(e => e.type === 'structural_error');
      expect(structuralErrors.length).toBeGreaterThan(0);
    });
  });

  describe('formatValidationReport', () => {
    it('should format a successful validation report', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(validGitHubNode),
        sampleParsedDefinition
      );

      const report = validationEngine.formatValidationReport(result);
      
      expect(report).toContain('✅ VALID');
      expect(report).toContain('Compliance Score:');
      expect(report).toContain('Your node implementation looks good!');
    });

    it('should format a failed validation report', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(invalidGitHubNode),
        sampleParsedDefinition
      );

      const report = validationEngine.formatValidationReport(result);
      
      expect(report).toContain('❌ INVALID');
      expect(report).toContain('Errors (');
      expect(report).toContain('errors that need to be fixed');
    });

    it('should include warnings in the report', async () => {
      const nodeWithWarnings = {
        ...validGitHubNode,
        version: 2 // Different from spec version
      };

      const result = await validationEngine.validateNode(
        JSON.stringify(nodeWithWarnings),
        sampleParsedDefinition
      );

      const report = validationEngine.formatValidationReport(result);
      
      expect(report).toContain('Warnings (');
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('compliance scoring', () => {
    it('should give perfect score for valid nodes', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(validGitHubNode),
        sampleParsedDefinition
      );

      expect(result.score).toBe(100);
    });

    it('should decrease score based on errors and warnings', async () => {
      const result = await validationEngine.validateNode(
        JSON.stringify(invalidGitHubNode),
        sampleParsedDefinition
      );

      expect(result.score).toBeLessThan(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});