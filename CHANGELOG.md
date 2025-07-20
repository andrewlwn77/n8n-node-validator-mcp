# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-18

### Added
- Enhanced README.md with detailed validation output examples
- Example validation error format showing actual vs expected values
- Comprehensive usage examples for Claude Code integration
- Additional npm keywords for better discoverability
- Repository links and issue tracking in package.json

### Changed
- Updated package.json with repository information and homepage
- Enhanced documentation with real-world validation examples
- Improved project description and metadata

### Fixed
- Package.json now includes all necessary files for npm publishing
- Corrected file paths and build configuration

## [1.0.0] - 2025-01-18

### Added
- Initial release of n8n Validator MCP
- Core validation engine for n8n nodes against official specifications
- GitHub client with intelligent caching and rate limiting
- TypeScript parser for n8n node definitions
- Comprehensive error reporting with specific paths and values
- Three main MCP tools:
  - `validate_n8n_node`: Validate nodes against official specs
  - `fetch_node_spec`: Retrieve official n8n node specifications
  - `compare_nodes`: Compare two node implementations
- Support for all n8n node types and versions
- Detailed compliance scoring (0-100)
- Actionable recommendations for validation failures
- Performance optimizations with caching
- Comprehensive test suite with unit and integration tests
- TypeScript support with full type definitions
- ESLint configuration for code quality
- Jest testing framework integration
- Modular architecture with clear separation of concerns

### Features
- **Validation Engine**: Core validation with comprehensive error reporting
- **GitHub Integration**: Robust API client with caching and rate limiting
- **TypeScript Parsing**: Parse n8n node definitions from TypeScript source
- **Deep Comparison**: Object comparison for identifying node differences
- **Error Handling**: Centralized error handling with user-friendly messages
- **Caching**: Intelligent caching with TTL and LRU eviction
- **Performance**: Sub-3-second validation for typical nodes
- **CLI Support**: Command-line interface for direct usage
- **MCP Integration**: Full Model Context Protocol server implementation

### Documentation
- Comprehensive README with usage examples
- Architecture documentation
- API reference for all MCP tools
- Development setup and contribution guidelines
- Performance benchmarks and optimization notes

### Technical Details
- Built with TypeScript 5.8+
- Requires Node.js 18+
- Uses Zod for schema validation
- Implements MCP SDK 1.15+
- Follows modular monolith architecture
- Includes comprehensive error handling
- Features intelligent caching mechanisms
- Supports environment-based configuration