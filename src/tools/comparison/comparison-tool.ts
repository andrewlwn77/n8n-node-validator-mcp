/**
 * MCP tool for comparing n8n nodes
 */

import { CompareNodesInput, compareNodesSchema } from '../../types/mcp.js';
import { NodeComparisonService } from '../../services/comparison/node-comparison.js';
import { ErrorHandler } from '../../infrastructure/errors/error-handler.js';

export class ComparisonTool {
  
  constructor(
    private comparisonService: NodeComparisonService
  ) {}

  /**
   * Execute the comparison tool
   */
  async execute(args: unknown) {
    try {
      // Validate input parameters
      const { localNode, specNode } = compareNodesSchema.parse(args);
      
      // Compare the nodes
      const comparison = this.comparisonService.compareNodes(localNode, specNode);
      
      // Format the report
      const formattedReport = this.comparisonService.formatComparisonReport(comparison);
      
      return {
        content: [{
          type: 'text',
          text: formattedReport
        }]
      };
    } catch (error) {
      const mcpError = ErrorHandler.handleError(error as Error);
      const userMessage = ErrorHandler.createUserFriendlyMessage(error as Error);
      
      return {
        content: [{
          type: 'text',
          text: `Error: ${userMessage}`
        }],
        isError: true
      };
    }
  }

  /**
   * Get tool definition for MCP registration
   */
  getToolDefinition() {
    return {
      name: 'compare_nodes',
      description: 'Compare two n8n nodes and highlight differences',
      inputSchema: {
        type: 'object' as const,
        properties: {
          localNode: {
            type: 'string' as const,
            description: 'Local n8n node JSON string'
          },
          specNode: {
            type: 'string' as const,
            description: 'Official specification node JSON string'
          }
        },
        required: ['localNode', 'specNode']
      }
    };
  }
}