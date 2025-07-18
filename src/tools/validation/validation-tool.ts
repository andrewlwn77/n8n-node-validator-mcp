/**
 * MCP tool for validating n8n nodes
 */

import { ValidateNodeInput, validateNodeSchema } from '../../types/mcp.js';
import { ValidationEngine } from '../../services/validation/validation-engine.js';
import { SpecificationFetcher } from '../../services/specification/specification-fetcher.js';
import { ErrorHandler } from '../../infrastructure/errors/error-handler.js';

export class ValidationTool {
  
  constructor(
    private validationEngine: ValidationEngine,
    private specificationFetcher: SpecificationFetcher
  ) {}

  /**
   * Execute the validation tool
   */
  async execute(args: unknown) {
    try {
      // Validate input parameters
      const { nodeJson, nodeType, nodeVersion } = validateNodeSchema.parse(args);
      
      // Fetch the specification
      const specification = await this.specificationFetcher.fetchNodeSpecification(nodeType, nodeVersion);
      
      // Parse the specification
      const parsedSpec = this.specificationFetcher.parseSpecification(specification);
      
      // Validate the node
      const validationResult = await this.validationEngine.validateNode(nodeJson, parsedSpec);
      
      // Format the result
      const formattedReport = this.validationEngine.formatValidationReport(validationResult);
      
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
      name: 'validate_n8n_node',
      description: 'Validate a local n8n node implementation against its official specification',
      inputSchema: {
        type: 'object' as const,
        properties: {
          nodeJson: {
            type: 'string' as const,
            description: 'The JSON string of the n8n node to validate'
          },
          nodeType: {
            type: 'string' as const,
            description: 'The type of node (e.g., "Github", "Slack", "HTTP Request")'
          },
          nodeVersion: {
            type: 'string' as const,
            description: 'Optional version of the node to validate against'
          }
        },
        required: ['nodeJson', 'nodeType']
      }
    };
  }
}