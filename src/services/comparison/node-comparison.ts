/**
 * Service for comparing n8n node implementations
 */

import { NodeComparison, NodeDifference } from '../../types/mcp.js';
import { ParseError } from '../../infrastructure/errors/error-handler.js';

export class NodeComparisonService {
  
  /**
   * Compare two node implementations and return differences
   */
  compareNodes(localNodeJson: string, specNodeJson: string): NodeComparison {
    try {
      const localNode = JSON.parse(localNodeJson);
      const specNode = JSON.parse(specNodeJson);
      
      const differences = this.findDifferences(localNode, specNode);
      
      return {
        identical: differences.length === 0,
        differences,
        summary: this.generateSummary(differences)
      };
    } catch (error) {
      throw new ParseError(`Failed to compare nodes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find all differences between two node objects
   */
  private findDifferences(local: any, spec: any, path: string = ''): NodeDifference[] {
    const differences: NodeDifference[] = [];
    
    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(local || {}),
      ...Object.keys(spec || {})
    ]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const localValue = local?.[key];
      const specValue = spec?.[key];
      
      if (localValue === undefined && specValue !== undefined) {
        differences.push({
          property: currentPath,
          local: undefined,
          spec: specValue,
          type: 'missing_in_local'
        });
      } else if (localValue !== undefined && specValue === undefined) {
        differences.push({
          property: currentPath,
          local: localValue,
          spec: undefined,
          type: 'extra_in_local'
        });
      } else if (localValue !== undefined && specValue !== undefined) {
        if (this.isObject(localValue) && this.isObject(specValue)) {
          // Recursively compare nested objects
          differences.push(...this.findDifferences(localValue, specValue, currentPath));
        } else if (Array.isArray(localValue) && Array.isArray(specValue)) {
          // Compare arrays
          differences.push(...this.compareArrays(localValue, specValue, currentPath));
        } else if (!this.deepEqual(localValue, specValue)) {
          differences.push({
            property: currentPath,
            local: localValue,
            spec: specValue,
            type: 'different_value'
          });
        }
      }
    }
    
    return differences;
  }

  /**
   * Compare two arrays and find differences
   */
  private compareArrays(localArray: any[], specArray: any[], path: string): NodeDifference[] {
    const differences: NodeDifference[] = [];
    const maxLength = Math.max(localArray.length, specArray.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPath = `${path}[${i}]`;
      const localItem = localArray[i];
      const specItem = specArray[i];
      
      if (localItem === undefined && specItem !== undefined) {
        differences.push({
          property: currentPath,
          local: undefined,
          spec: specItem,
          type: 'missing_in_local'
        });
      } else if (localItem !== undefined && specItem === undefined) {
        differences.push({
          property: currentPath,
          local: localItem,
          spec: undefined,
          type: 'extra_in_local'
        });
      } else if (localItem !== undefined && specItem !== undefined) {
        if (this.isObject(localItem) && this.isObject(specItem)) {
          differences.push(...this.findDifferences(localItem, specItem, currentPath));
        } else if (!this.deepEqual(localItem, specItem)) {
          differences.push({
            property: currentPath,
            local: localItem,
            spec: specItem,
            type: 'different_value'
          });
        }
      }
    }
    
    return differences;
  }

  /**
   * Generate a summary of the comparison results
   */
  private generateSummary(differences: NodeDifference[]): string {
    if (differences.length === 0) {
      return 'No differences found between local and spec nodes';
    }
    
    const counts = {
      missing_in_local: 0,
      extra_in_local: 0,
      different_value: 0
    };
    
    for (const diff of differences) {
      counts[diff.type]++;
    }
    
    const parts = [];
    if (counts.missing_in_local > 0) {
      parts.push(`${counts.missing_in_local} missing properties`);
    }
    if (counts.extra_in_local > 0) {
      parts.push(`${counts.extra_in_local} extra properties`);
    }
    if (counts.different_value > 0) {
      parts.push(`${counts.different_value} different values`);
    }
    
    return `Found ${differences.length} differences: ${parts.join(', ')}`;
  }

  /**
   * Format comparison results for display
   */
  formatComparisonReport(comparison: NodeComparison): string {
    const status = comparison.identical ? '✅ IDENTICAL' : '❌ DIFFERENCES FOUND';
    const lines = [
      `# Node Comparison Result`,
      ``,
      `## Status: ${status}`,
      ``,
      comparison.summary,
      ``
    ];

    if (comparison.differences.length > 0) {
      lines.push(`## Differences Found (${comparison.differences.length})`);
      lines.push('');

      for (const diff of comparison.differences) {
        lines.push(`### ${diff.property}`);
        lines.push(`- **Type**: ${diff.type}`);
        lines.push(`- **Local Value**: ${JSON.stringify(diff.local, null, 2)}`);
        lines.push(`- **Spec Value**: ${JSON.stringify(diff.spec, null, 2)}`);
        lines.push('');
      }
    }

    lines.push('## Summary');
    if (comparison.identical) {
      lines.push('The local node and specification are identical.');
    } else {
      lines.push(`Found ${comparison.differences.length} differences that should be reviewed.`);
    }

    return lines.join('\n');
  }

  /**
   * Calculate similarity score between two nodes
   */
  calculateSimilarityScore(comparison: NodeComparison): number {
    if (comparison.identical) {
      return 100;
    }

    // Simple scoring based on number of differences
    // This could be enhanced with weighted scoring
    const maxPenalty = 50; // Maximum penalty for differences
    const penalty = Math.min(comparison.differences.length * 5, maxPenalty);
    
    return Math.max(0, 100 - penalty);
  }

  /**
   * Check if two values are deeply equal
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], b[i])) return false;
        }
        return true;
      }
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    
    return false;
  }

  /**
   * Check if a value is an object (not array or null)
   */
  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}