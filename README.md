# n8n Validator MCP

A comprehensive Model Context Protocol (MCP) server for validating n8n workflow nodes against their official specifications.

## Overview

The n8n Validator MCP provides AI development tools with the capability to validate n8n node implementations, fetch official specifications, and compare node differences. This eliminates the frustration of generic "validation failed" errors by providing specific, actionable feedback.

## Features

### 🔍 **Node Validation**
- Validates local n8n nodes against official specifications
- Detailed error reporting with specific paths and expected values
- Compliance scoring from 0-100
- Supports all n8n node types and versions

### 📋 **Specification Fetching**
- Fetches official n8n node specifications from GitHub
- Parses TypeScript definitions into structured data
- Supports version-specific specifications
- Intelligent caching for performance

### 🔄 **Node Comparison**
- Compare two node implementations side-by-side
- Categorizes differences (missing, extra, different values)
- Deep object comparison with nested property support
- Clear formatting for easy understanding

## Installation

```bash
npm install -g n8n-validator-mcp
```

## Usage

### With Claude Code

The n8n Validator MCP integrates seamlessly with Claude Code. Once installed, you can use natural language commands:

```
"Validate this GitHub node implementation"
"Show me what's wrong with my Slack node"
"Compare my local node with the official specification"
"Fetch the specification for the HTTP Request node"
```

### Direct Usage

```bash
# Start the MCP server
n8n-validator-mcp

# The server provides three tools:
# - validate_n8n_node: Validate a node against official specs
# - fetch_node_spec: Get official node specifications
# - compare_nodes: Compare two node implementations
```

## MCP Tools

### validate_n8n_node

Validates a local n8n node implementation against its official specification.

**Parameters:**
- `nodeJson` (string): The JSON string of the n8n node to validate
- `nodeType` (string): The type of node (e.g., "Github", "Slack", "HTTP Request")
- `nodeVersion` (string, optional): Version of the node to validate against

**Returns:**
- Detailed validation report with errors, warnings, and compliance score
- Specific error paths and expected vs actual values
- Actionable recommendations for fixes

### fetch_node_spec

Fetches the official specification for an n8n node from the repository.

**Parameters:**
- `nodeType` (string): The type of node to fetch specification for
- `nodeVersion` (string, optional): Version of the node spec to fetch

**Returns:**
- Formatted specification with parsed TypeScript definitions
- Property details and structure information
- File paths and version information

### compare_nodes

Compares two n8n node implementations and highlights differences.

**Parameters:**
- `localNode` (string): Local n8n node JSON string
- `specNode` (string): Official specification node JSON string

**Returns:**
- Detailed comparison report with categorized differences
- Side-by-side value comparison
- Summary of changes needed

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5.0+
- GitHub access for fetching specifications

### Setup
```bash
git clone <repository-url>
cd n8n-validator-mcp
npm install
npm run build
```

### Testing
```bash
npm test                # Run all tests
npm run test:unit      # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage   # Run with coverage
```

### Building
```bash
npm run build     # Compile TypeScript
npm run dev       # Watch mode for development
```

## Architecture

The n8n Validator MCP follows a modular monolith architecture:

```
src/
├── tools/              # MCP tool implementations
├── services/           # Core business logic
├── infrastructure/     # Cross-cutting concerns
├── server/            # MCP server setup
└── types/             # TypeScript definitions
```

### Key Components

- **Validation Engine**: Core validation logic with comprehensive error reporting
- **GitHub Client**: Robust API integration with caching and rate limiting
- **TypeScript Parser**: Parses n8n node definitions from TypeScript source
- **Comparison Service**: Deep object comparison for node differences
- **Error Handler**: Centralized error handling with user-friendly messages
- **Cache Manager**: Intelligent caching with TTL and LRU eviction

## Configuration

### Environment Variables

- `GITHUB_TOKEN`: GitHub API token for higher rate limits (optional)

### Performance

- **Validation**: < 3 seconds for typical nodes
- **Specification Fetching**: < 2 seconds with caching
- **Node Comparison**: < 1 second for most comparisons
- **Cache Hit Rate**: > 90% for repeated requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: Report bugs and request features
- Documentation: See `/docs` directory for detailed guides
- Examples: Check `/tests/fixtures` for sample usage

## Roadmap

- **AST-based Parsing**: Upgrade from regex to proper TypeScript AST parsing
- **Advanced Validation**: Deep property validation and credential checking
- **Performance Optimization**: Enhanced caching and request batching
- **IDE Integration**: VS Code extension for real-time validation
- **Custom Rules**: User-defined validation rules and constraints

---

Built with the BMAD Method for comprehensive, production-ready software development.