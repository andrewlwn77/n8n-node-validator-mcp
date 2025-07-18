#!/usr/bin/env node

/**
 * Entry point for the n8n Validator MCP server
 */

// process is available globally in Node.js
import { N8nValidatorMcpServer } from './server/mcp-server.js';

async function main() {
  try {
    const server = new N8nValidatorMcpServer();
    await server.start();
    
    console.error('n8n Validator MCP Server running on stdio');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.error('Shutting down n8n Validator MCP Server...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Fatal error starting n8n Validator MCP Server:', error);
    process.exit(1);
  }
}

main().catch(console.error);