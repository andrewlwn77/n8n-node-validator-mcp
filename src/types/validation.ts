/**
 * Core validation types for n8n node validation
 */

export interface ValidationError {
  type: 'missing_property' | 'invalid_type' | 'invalid_value' | 'structural_error';
  path: string;
  message: string;
  expected?: unknown;
  actual?: unknown;
}

export interface ValidationWarning {
  type: 'deprecated_property' | 'missing_optional' | 'style_issue';
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 compliance score
}

export interface NodeSpecification {
  nodeType: string;
  tsContent: string;
  jsonContent?: string;
  path: string;
  version: string;
}

export interface ParsedNodeDefinition {
  displayName: string | null;
  name: string | null;
  version: number | null;
  description: string | null;
  properties: NodeProperty[];
  inputs: unknown[];
  outputs: unknown[];
  group: string[] | null;
  icon: string | null;
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
  description?: string;
  options?: unknown[];
}