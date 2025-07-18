/**
 * Core validation engine for n8n node compliance
 */

import { ValidationResult, ValidationError, ValidationWarning, ParsedNodeDefinition } from '../../types/validation.js';
import { ValidationFailedError } from '../../infrastructure/errors/error-handler.js';

export class ValidationEngine {
  
  /**
   * Validate a local node against a parsed specification
   */
  async validateNode(localNodeJson: string, specData: ParsedNodeDefinition): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      const localNode = JSON.parse(localNodeJson);

      // Run all validation checks
      this.validateRequiredProperties(localNode, specData, errors);
      this.validatePropertyTypes(localNode, specData, errors);
      this.validatePropertyValues(localNode, specData, errors, warnings);
      this.validateStructure(localNode, specData, errors);
      this.validateNamingConventions(localNode, errors);

      // Calculate compliance score
      const score = this.calculateComplianceScore(errors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score
      };
    } catch (error) {
      errors.push({
        type: 'structural_error',
        path: 'root',
        message: `Failed to parse or validate node: ${error instanceof Error ? error.message : String(error)}`,
        expected: 'valid JSON',
        actual: 'invalid JSON'
      });

      return {
        isValid: false,
        errors,
        warnings,
        score: 0
      };
    }
  }

  private validateRequiredProperties(
    localNode: any,
    specData: ParsedNodeDefinition,
    errors: ValidationError[]
  ): void {
    const requiredProps = ['displayName', 'name', 'version', 'description'];
    
    for (const prop of requiredProps) {
      const specValue = specData[prop as keyof ParsedNodeDefinition];
      const localValue = localNode[prop];

      if (!localValue && specValue) {
        errors.push({
          type: 'missing_property',
          path: prop,
          message: `Required property '${prop}' is missing`,
          expected: specValue,
          actual: undefined
        });
      }
    }

    // Check for required properties in the properties array
    if (specData.properties) {
      for (const specProperty of specData.properties) {
        if (specProperty.required && localNode.properties) {
          const localProperty = localNode.properties.find(
            (p: any) => p.name === specProperty.name
          );
          
          if (!localProperty) {
            errors.push({
              type: 'missing_property',
              path: `properties.${specProperty.name}`,
              message: `Required property '${specProperty.name}' is missing`,
              expected: specProperty,
              actual: undefined
            });
          }
        }
      }
    }
  }

  private validatePropertyTypes(
    localNode: any,
    specData: ParsedNodeDefinition,
    errors: ValidationError[]
  ): void {
    // Validate basic property types
    const typeValidations = [
      { key: 'displayName', expected: 'string' },
      { key: 'name', expected: 'string' },
      { key: 'version', expected: 'number' },
      { key: 'description', expected: 'string' }
    ];

    for (const { key, expected } of typeValidations) {
      const localValue = localNode[key];
      const specValue = specData[key as keyof ParsedNodeDefinition];

      if (localValue !== undefined && specValue !== undefined) {
        const actualType = typeof localValue;
        
        if (actualType !== expected) {
          errors.push({
            type: 'invalid_type',
            path: key,
            message: `Property '${key}' has incorrect type`,
            expected,
            actual: actualType
          });
        }
      }
    }

    // Validate array properties
    const arrayProperties = ['properties', 'inputs', 'outputs'];
    for (const prop of arrayProperties) {
      const localValue = localNode[prop];
      if (localValue !== undefined && !Array.isArray(localValue)) {
        errors.push({
          type: 'invalid_type',
          path: prop,
          message: `Property '${prop}' must be an array`,
          expected: 'array',
          actual: typeof localValue
        });
      }
    }
  }

  private validatePropertyValues(
    localNode: any,
    specData: ParsedNodeDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Version validation
    if (localNode.version !== undefined && specData.version !== undefined) {
      if (localNode.version !== specData.version) {
        warnings.push({
          type: 'deprecated_property',
          path: 'version',
          message: `Node version ${localNode.version} differs from spec version ${specData.version}`
        });
      }
    }

    // Name validation
    if (localNode.name && specData.name) {
      if (localNode.name !== specData.name) {
        errors.push({
          type: 'invalid_value',
          path: 'name',
          message: `Node name '${localNode.name}' does not match specification '${specData.name}'`,
          expected: specData.name,
          actual: localNode.name
        });
      }
    }

    // Group validation
    if (localNode.group && specData.group) {
      if (Array.isArray(localNode.group) && Array.isArray(specData.group)) {
        const missingGroups = specData.group.filter(g => !localNode.group.includes(g));
        if (missingGroups.length > 0) {
          warnings.push({
            type: 'missing_optional',
            path: 'group',
            message: `Missing recommended groups: ${missingGroups.join(', ')}`
          });
        }
      }
    }
  }

  private validateStructure(
    localNode: any,
    specData: ParsedNodeDefinition,
    errors: ValidationError[]
  ): void {
    // Validate properties array structure
    if (localNode.properties && Array.isArray(localNode.properties)) {
      for (let i = 0; i < localNode.properties.length; i++) {
        const property = localNode.properties[i];
        const path = `properties[${i}]`;

        if (!property.name || typeof property.name !== 'string') {
          errors.push({
            type: 'structural_error',
            path: `${path}.name`,
            message: 'Property name is required and must be a string',
            expected: 'string',
            actual: typeof property.name
          });
        }

        if (!property.type || typeof property.type !== 'string') {
          errors.push({
            type: 'structural_error',
            path: `${path}.type`,
            message: 'Property type is required and must be a string',
            expected: 'string',
            actual: typeof property.type
          });
        }

        if (!property.displayName || typeof property.displayName !== 'string') {
          errors.push({
            type: 'structural_error',
            path: `${path}.displayName`,
            message: 'Property displayName is required and must be a string',
            expected: 'string',
            actual: typeof property.displayName
          });
        }
      }
    }

    // Validate inputs/outputs arrays
    const arrayFields = ['inputs', 'outputs'];
    for (const field of arrayFields) {
      if (localNode[field] && !Array.isArray(localNode[field])) {
        errors.push({
          type: 'invalid_type',
          path: field,
          message: `${field} must be an array`,
          expected: 'array',
          actual: typeof localNode[field]
        });
      }
    }
  }

  private validateNamingConventions(
    localNode: any,
    errors: ValidationError[]
  ): void {
    // Node name convention
    if (localNode.name && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(localNode.name)) {
      errors.push({
        type: 'invalid_value',
        path: 'name',
        message: 'Node name must start with a letter and contain only alphanumeric characters',
        expected: 'alphanumeric name starting with letter',
        actual: localNode.name
      });
    }

    // Property name conventions
    if (localNode.properties && Array.isArray(localNode.properties)) {
      for (let i = 0; i < localNode.properties.length; i++) {
        const property = localNode.properties[i];
        if (property.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(property.name)) {
          errors.push({
            type: 'invalid_value',
            path: `properties[${i}].name`,
            message: 'Property name must start with a letter and contain only alphanumeric characters and underscores',
            expected: 'valid property name',
            actual: property.name
          });
        }
      }
    }
  }

  private calculateComplianceScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    const errorWeight = 10;
    const warningWeight = 2;
    const maxScore = 100;
    
    const deduction = (errors.length * errorWeight) + (warnings.length * warningWeight);
    return Math.max(0, maxScore - deduction);
  }

  /**
   * Get detailed validation report as formatted text
   */
  formatValidationReport(result: ValidationResult): string {
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    const lines = [
      `# n8n Node Validation Result`,
      ``,
      `## Validation Status: ${status}`,
      `## Compliance Score: ${result.score}/100`,
      ``
    ];

    if (result.errors.length > 0) {
      lines.push(`### Errors (${result.errors.length})`);
      for (const error of result.errors) {
        lines.push(`- **${error.type}** at \`${error.path}\`: ${error.message}`);
        if (error.expected !== undefined && error.actual !== undefined) {
          lines.push(`  Expected: ${JSON.stringify(error.expected)}`);
          lines.push(`  Actual: ${JSON.stringify(error.actual)}`);
        }
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push(`### Warnings (${result.warnings.length})`);
      for (const warning of result.warnings) {
        lines.push(`- **${warning.type}** at \`${warning.path}\`: ${warning.message}`);
      }
      lines.push('');
    }

    lines.push('### Summary');
    if (result.isValid) {
      lines.push('Your n8n node implementation is valid and complies with the official specification.');
    } else {
      lines.push(`Your n8n node implementation has ${result.errors.length} errors that need to be fixed.`);
    }

    lines.push('');
    lines.push('### Recommendations');
    if (result.errors.length > 0) {
      lines.push('Please fix the errors listed above to ensure your node works correctly with n8n.');
    } else if (result.warnings.length > 0) {
      lines.push('Consider addressing the warnings to improve your node implementation.');
    } else {
      lines.push('Your node implementation looks good! Consider testing it thoroughly.');
    }

    return lines.join('\n');
  }
}