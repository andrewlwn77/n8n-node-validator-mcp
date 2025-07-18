/**
 * Unit tests for TypeScriptParser
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TypeScriptParser } from '../../src/services/parsing/typescript-parser.js';
import { sampleTypeScriptContent } from '../fixtures/sample-nodes.js';

describe('TypeScriptParser', () => {
  let parser: TypeScriptParser;

  beforeEach(() => {
    parser = new TypeScriptParser();
  });

  describe('parseNodeDefinition', () => {
    it('should parse a valid TypeScript node definition', () => {
      const result = parser.parseNodeDefinition(sampleTypeScriptContent);

      expect(result.displayName).toBe('GitHub');
      expect(result.name).toBe('github');
      expect(result.version).toBe(1);
      expect(result.description).toBe('GitHub API operations');
      expect(result.group).toEqual(['Development']);
      expect(result.icon).toBe('file:github.svg');
      expect(result.properties).toHaveLength(2);
    });

    it('should extract property details correctly', () => {
      const result = parser.parseNodeDefinition(sampleTypeScriptContent);
      
      expect(result.properties[0].displayName).toBe('Repository');
      expect(result.properties[0].name).toBe('repository');
      expect(result.properties[0].type).toBe('string');
      expect(result.properties[0].required).toBe(true);
      expect(result.properties[0].description).toBe('The GitHub repository');
    });

    it('should handle missing properties gracefully', () => {
      const minimalContent = `
        export class Test implements INodeType {
          description: INodeTypeDescription = {
            displayName: 'Test',
            name: 'test'
          };
        }
      `;

      const result = parser.parseNodeDefinition(minimalContent);

      expect(result.displayName).toBe('Test');
      expect(result.name).toBe('test');
      expect(result.version).toBeNull();
      expect(result.description).toBeNull();
      expect(result.properties).toHaveLength(0);
    });

    it('should handle empty properties array', () => {
      const contentWithEmptyProps = `
        export class Test implements INodeType {
          description: INodeTypeDescription = {
            displayName: 'Test',
            name: 'test',
            properties: []
          };
        }
      `;

      const result = parser.parseNodeDefinition(contentWithEmptyProps);

      expect(result.properties).toHaveLength(0);
    });
  });

  describe('validateNodeStructure', () => {
    it('should validate correct node structure', () => {
      const isValid = parser.validateNodeStructure(sampleTypeScriptContent);
      expect(isValid).toBe(true);
    });

    it('should reject invalid node structure', () => {
      const invalidContent = `
        export class NotANode {
          someProperty: string;
        }
      `;

      const isValid = parser.validateNodeStructure(invalidContent);
      expect(isValid).toBe(false);
    });

    it('should require essential properties', () => {
      const missingEssentials = `
        export class Test implements INodeType {
          description: INodeTypeDescription = {
            // Missing displayName and name
            version: 1
          };
        }
      `;

      const isValid = parser.validateNodeStructure(missingEssentials);
      expect(isValid).toBe(false);
    });
  });

  describe('extractClassName', () => {
    it('should extract class name from TypeScript content', () => {
      const className = parser.extractClassName(sampleTypeScriptContent);
      expect(className).toBe('GitHub');
    });

    it('should return null for invalid class definition', () => {
      const invalidContent = 'const notAClass = {};';
      const className = parser.extractClassName(invalidContent);
      expect(className).toBeNull();
    });
  });

  describe('syntax validation', () => {
    it('should detect bracket imbalance', () => {
      const imbalancedContent = `
        export class Test {
          description = {
            displayName: 'Test'
          // Missing closing brace
        }
      `;

      const hasErrors = parser.hasBasicSyntaxErrors(imbalancedContent);
      expect(hasErrors).toBe(true);
    });

    it('should detect quote imbalance', () => {
      const imbalancedQuotes = `
        export class Test {
          description = {
            displayName: 'Test
          }
        }
      `;

      const hasErrors = parser.hasBasicSyntaxErrors(imbalancedQuotes);
      expect(hasErrors).toBe(true);
    });

    it('should pass valid syntax', () => {
      const hasErrors = parser.hasBasicSyntaxErrors(sampleTypeScriptContent);
      expect(hasErrors).toBe(false);
    });
  });
});