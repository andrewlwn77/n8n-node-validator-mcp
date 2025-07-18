/**
 * Service for fetching and parsing n8n node specifications
 */

import { NodeSpecification, ParsedNodeDefinition } from '../../types/validation.js';
import { GitHubClient } from '../github/github-client.js';
import { TypeScriptParser } from '../parsing/typescript-parser.js';
import { NodeNotFoundError, GitHubApiError } from '../../infrastructure/errors/error-handler.js';
import { CacheManager } from '../../infrastructure/cache/cache-manager.js';

export class SpecificationFetcher {
  
  constructor(
    private githubClient: GitHubClient,
    private parser: TypeScriptParser,
    private cache: CacheManager
  ) {}

  /**
   * Fetch and parse node specification from GitHub
   */
  async fetchNodeSpecification(nodeType: string, version?: string): Promise<NodeSpecification> {
    const cacheKey = `spec:${nodeType}:${version || 'latest'}`;
    const cached = this.cache.get<NodeSpecification>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Search for node files in the repository
      const searchResults = await this.githubClient.searchNodeFiles(nodeType);
      
      if (!searchResults.items || searchResults.items.length === 0) {
        throw new NodeNotFoundError(nodeType);
      }

      // Get the first matching file (most relevant)
      const nodeFile = searchResults.items[0];
      
      // Fetch the TypeScript file content
      const tsFileContent = await this.githubClient.getFileContent(nodeFile.path);
      const tsContent = GitHubClient.decodeContent(tsFileContent.content);

      // Try to fetch the corresponding JSON file if it exists
      let jsonContent: string | undefined;
      try {
        const jsonPath = nodeFile.path.replace('.node.ts', '.node.json');
        const jsonFileContent = await this.githubClient.getFileContent(jsonPath);
        jsonContent = GitHubClient.decodeContent(jsonFileContent.content);
      } catch (error) {
        // JSON file might not exist for all nodes - this is okay
        if (error instanceof GitHubApiError && error.statusCode !== 404) {
          throw error;
        }
      }

      const specification: NodeSpecification = {
        nodeType,
        tsContent,
        jsonContent,
        path: nodeFile.path,
        version: version || 'latest'
      };

      // Cache the specification for 1 hour
      this.cache.set(cacheKey, specification, 60 * 60 * 1000);

      return specification;
    } catch (error) {
      if (error instanceof NodeNotFoundError || error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        `Failed to fetch node specification: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        { nodeType, version }
      );
    }
  }

  /**
   * Parse a node specification into structured data
   */
  parseSpecification(specification: NodeSpecification): ParsedNodeDefinition {
    // Validate the TypeScript content structure
    if (!this.parser.validateNodeStructure(specification.tsContent)) {
      throw new Error('Invalid node structure in TypeScript file');
    }

    // Parse the TypeScript content
    const parsedDefinition = this.parser.parseNodeDefinition(specification.tsContent);

    // Enhance with JSON metadata if available
    if (specification.jsonContent) {
      try {
        const jsonData = JSON.parse(specification.jsonContent);
        // Merge JSON data with parsed TypeScript data
        this.mergeJsonMetadata(parsedDefinition, jsonData);
      } catch (error) {
        // If JSON parsing fails, log warning but continue with TypeScript data
        console.warn(`Failed to parse JSON metadata for ${specification.nodeType}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return parsedDefinition;
  }

  /**
   * Get a list of available node types (for future enhancement)
   */
  async getAvailableNodeTypes(): Promise<string[]> {
    // This is a placeholder for future implementation
    // Could search the repository for all .node.ts files
    return [];
  }

  /**
   * Check if a node type exists in the repository
   */
  async nodeExists(nodeType: string): Promise<boolean> {
    try {
      const searchResults = await this.githubClient.searchNodeFiles(nodeType);
      return searchResults.items && searchResults.items.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format specification data for display
   */
  formatSpecificationReport(
    specification: NodeSpecification,
    parsedSpec: ParsedNodeDefinition
  ): string {
    const lines = [
      `# n8n Node Specification: ${specification.nodeType}`,
      ``,
      `## Basic Information`,
      `- **Display Name**: ${parsedSpec.displayName || 'N/A'}`,
      `- **Name**: ${parsedSpec.name || 'N/A'}`,
      `- **Version**: ${parsedSpec.version || 'N/A'}`,
      `- **Description**: ${parsedSpec.description || 'N/A'}`,
      `- **Group**: ${parsedSpec.group ? parsedSpec.group.join(', ') : 'N/A'}`,
      `- **Icon**: ${parsedSpec.icon || 'N/A'}`,
      ``,
      `## Properties (${parsedSpec.properties.length})`,
    ];

    if (parsedSpec.properties.length > 0) {
      for (const prop of parsedSpec.properties) {
        lines.push(`- **${prop.displayName}** (\`${prop.name}\`): ${prop.type}`);
        if (prop.description) {
          lines.push(`  ${prop.description}`);
        }
      }
    } else {
      lines.push('No properties defined');
    }

    lines.push('');
    lines.push(`## File Information`);
    lines.push(`- **Path**: ${specification.path}`);
    lines.push(`- **Version**: ${specification.version}`);
    lines.push('');

    lines.push(`## Raw TypeScript Content`);
    lines.push('```typescript');
    lines.push(specification.tsContent.slice(0, 1000) + '...');
    lines.push('```');

    if (specification.jsonContent) {
      lines.push('');
      lines.push(`## JSON Metadata`);
      lines.push('```json');
      lines.push(specification.jsonContent);
      lines.push('```');
    }

    return lines.join('\n');
  }

  private mergeJsonMetadata(parsedDefinition: ParsedNodeDefinition, jsonData: any): void {
    // Merge JSON metadata with parsed TypeScript data
    // This is a placeholder for future enhancement
    if (jsonData.displayName && !parsedDefinition.displayName) {
      parsedDefinition.displayName = jsonData.displayName;
    }
    if (jsonData.description && !parsedDefinition.description) {
      parsedDefinition.description = jsonData.description;
    }
    if (jsonData.icon && !parsedDefinition.icon) {
      parsedDefinition.icon = jsonData.icon;
    }
  }
}