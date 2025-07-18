/**
 * MCP tool for fetching n8n node specifications
 */

import { FetchNodeSpecInput, fetchNodeSpecSchema } from '../../types/mcp.js';
import { SpecificationFetcher } from '../../services/specification/specification-fetcher.js';
import { ErrorHandler } from '../../infrastructure/errors/error-handler.js';

export class FetchingTool {
  
  constructor(
    private specificationFetcher: SpecificationFetcher
  ) {}

  /**
   * Execute the fetching tool
   */
  async execute(args: unknown) {
    try {
      // Validate input parameters
      const { nodeType, nodeVersion } = fetchNodeSpecSchema.parse(args);
      
      // Fetch the specification
      const specification = await this.specificationFetcher.fetchNodeSpecification(nodeType, nodeVersion);
      
      // Parse the specification
      const parsedSpec = this.specificationFetcher.parseSpecification(specification);
      
      // Format the report
      const formattedReport = this.specificationFetcher.formatSpecificationReport(specification, parsedSpec);
      
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
      name: 'fetch_node_spec',
      description: 'Fetch the official specification for an n8n node from the repository',
      inputSchema: {
        type: 'object' as const,
        properties: {
          nodeType: {
            type: 'string' as const,
            description: 'The type of node to fetch specification for'
          },
          nodeVersion: {
            type: 'string' as const,
            description: 'Optional version of the node spec to fetch'
          }
        },
        required: ['nodeType']
      }
    };
  }
}