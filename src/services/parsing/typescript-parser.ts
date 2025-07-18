/**
 * TypeScript parser for n8n node definitions
 * This implementation uses regex patterns for MVP, with plans to upgrade to AST parsing
 */

import { ParsedNodeDefinition, NodeProperty } from '../../types/validation.js';
import { ParseError } from '../../infrastructure/errors/error-handler.js';

export class TypeScriptParser {
  
  /**
   * Parse TypeScript node definition content into structured data
   */
  parseNodeDefinition(tsContent: string): ParsedNodeDefinition {
    try {
      return {
        displayName: this.extractDisplayName(tsContent),
        name: this.extractName(tsContent),
        version: this.extractVersion(tsContent),
        description: this.extractDescription(tsContent),
        properties: this.extractProperties(tsContent),
        inputs: this.extractInputs(tsContent),
        outputs: this.extractOutputs(tsContent),
        group: this.extractGroup(tsContent),
        icon: this.extractIcon(tsContent)
      };
    } catch (error) {
      throw new ParseError(
        `Failed to parse TypeScript node definition: ${error instanceof Error ? error.message : String(error)}`,
        tsContent
      );
    }
  }

  private extractDisplayName(content: string): string | null {
    const match = content.match(/displayName:\s*['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  private extractName(content: string): string | null {
    const match = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  private extractVersion(content: string): number | null {
    const match = content.match(/version:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  private extractDescription(content: string): string | null {
    const match = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  private extractGroup(content: string): string[] | null {
    const match = content.match(/group:\s*\[([^\]]+)\]/);
    if (!match) return null;

    return match[1]
      .split(',')
      .map(g => g.trim().replace(/['"`]/g, ''))
      .filter(g => g.length > 0);
  }

  private extractIcon(content: string): string | null {
    const match = content.match(/icon:\s*['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  private extractInputs(content: string): unknown[] {
    // For MVP, return empty array - can be enhanced later
    return [];
  }

  private extractOutputs(content: string): unknown[] {
    // For MVP, return empty array - can be enhanced later
    return [];
  }

  private extractProperties(content: string): NodeProperty[] {
    // Extract properties array from TypeScript content
    const propertiesMatch = content.match(/properties:\s*\[([\s\S]*?)\]/);
    if (!propertiesMatch) {
      return [];
    }

    return this.parsePropertiesArray(propertiesMatch[1]);
  }

  private parsePropertiesArray(propertiesText: string): NodeProperty[] {
    const properties: NodeProperty[] = [];
    
    // This is a simplified regex-based extraction
    // In production, we would use a proper TypeScript AST parser
    const propertyPattern = /\{([^}]*?displayName:\s*['"`]([^'"`]+)['"`][^}]*?name:\s*['"`]([^'"`]+)['"`][^}]*?type:\s*['"`]([^'"`]+)['"`][^}]*?)\}/g;
    
    let match;
    while ((match = propertyPattern.exec(propertiesText)) !== null) {
      const propertyBlock = match[1];
      const displayName = match[2];
      const name = match[3];
      const type = match[4];

      const property: NodeProperty = {
        displayName,
        name,
        type
      };

      // Extract optional fields
      const requiredMatch = propertyBlock.match(/required:\s*(true|false)/);
      if (requiredMatch) {
        property.required = requiredMatch[1] === 'true';
      }

      const descriptionMatch = propertyBlock.match(/description:\s*['"`]([^'"`]+)['"`]/);
      if (descriptionMatch) {
        property.description = descriptionMatch[1];
      }

      const defaultMatch = propertyBlock.match(/default:\s*['"`]([^'"`]+)['"`]/);
      if (defaultMatch) {
        property.default = defaultMatch[1];
      }

      properties.push(property);
    }

    return properties;
  }

  /**
   * Validate that the TypeScript content looks like a valid n8n node definition
   */
  validateNodeStructure(content: string): boolean {
    // Basic structure validation
    const hasINodeType = content.includes('INodeType');
    const hasDescription = content.includes('description:');
    const hasDisplayName = content.includes('displayName:');
    const hasName = content.includes('name:');

    return hasINodeType && hasDescription && hasDisplayName && hasName;
  }

  /**
   * Extract the node class name from TypeScript content
   */
  extractClassName(content: string): string | null {
    const match = content.match(/export\s+class\s+([A-Za-z][A-Za-z0-9_]*)\s+implements\s+INodeType/);
    return match ? match[1] : null;
  }

  /**
   * Check if the content contains TypeScript syntax errors
   */
  hasBasicSyntaxErrors(content: string): boolean {
    // Basic syntax checks
    const bracketBalance = this.checkBracketBalance(content);
    const quoteBalance = this.checkQuoteBalance(content);
    
    return !bracketBalance || !quoteBalance;
  }

  private checkBracketBalance(content: string): boolean {
    let balance = 0;
    for (const char of content) {
      if (char === '{') balance++;
      if (char === '}') balance--;
      if (balance < 0) return false;
    }
    return balance === 0;
  }

  private checkQuoteBalance(content: string): boolean {
    let singleQuotes = 0;
    let doubleQuotes = 0;
    let backticks = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if (char === "'" && prevChar !== '\\') singleQuotes++;
      if (char === '"' && prevChar !== '\\') doubleQuotes++;
      if (char === '`' && prevChar !== '\\') backticks++;
    }

    return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0;
  }
}