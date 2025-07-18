/**
 * Main MCP server implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { ValidationTool } from '../tools/validation/validation-tool.js';
import { FetchingTool } from '../tools/fetching/fetching-tool.js';
import { ComparisonTool } from '../tools/comparison/comparison-tool.js';

import { ValidationEngine } from '../services/validation/validation-engine.js';
import { SpecificationFetcher } from '../services/specification/specification-fetcher.js';
import { NodeComparisonService } from '../services/comparison/node-comparison.js';
import { GitHubClient } from '../services/github/github-client.js';
import { TypeScriptParser } from '../services/parsing/typescript-parser.js';
import { CacheManager } from '../infrastructure/cache/cache-manager.js';
import { ErrorHandler } from '../infrastructure/errors/error-handler.js';

export class N8nValidatorMcpServer {
  private server: Server;
  private tools: Map<string, any> = new Map();

  constructor() {
    this.server = new Server({
      name: 'n8n-validator',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.initializeServices();
    this.setupHandlers();
  }

  private initializeServices() {
    // Initialize infrastructure services
    const cache = new CacheManager();
    const parser = new TypeScriptParser();
    const githubClient = new GitHubClient(cache);

    // Initialize business services
    const specificationFetcher = new SpecificationFetcher(githubClient, parser, cache);
    const validationEngine = new ValidationEngine();
    const comparisonService = new NodeComparisonService();

    // Initialize tools
    this.tools.set('validate_n8n_node', new ValidationTool(validationEngine, specificationFetcher));
    this.tools.set('fetch_node_spec', new FetchingTool(specificationFetcher));
    this.tools.set('compare_nodes', new ComparisonTool(comparisonService));
  }

  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];
      
      for (const [name, tool] of this.tools) {
        tools.push(tool.getToolDefinition());
      }

      return { tools };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const tool = this.tools.get(name);
      if (!tool) {
        throw ErrorHandler.handleError(new Error(`Unknown tool: ${name}`));
      }

      return await tool.execute(args);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Clean up cache periodically
    setInterval(() => {
      // Clean up expired cache entries every 10 minutes
      const cache = new CacheManager();
      cache.cleanup();
    }, 10 * 60 * 1000);
  }
}