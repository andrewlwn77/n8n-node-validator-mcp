---
type: template
id: prd-tmpl
title: Product Requirements Document Template
created_by: pm
validates_with: [pm-checklist]
phase: requirements
used_in_tasks: [create-prd]
produces: prd
---

# Product Requirements Document: n8n Validator MCP

## Executive Summary
The n8n Validator MCP is a specialized Model Context Protocol server that provides comprehensive validation capabilities for n8n workflow automation nodes. By integrating official n8n specifications with AI-powered development workflows, this tool eliminates the frustration of generic validation errors and empowers developers to create robust, compliant n8n nodes with confidence.

**Key Outcomes:**
- **50% reduction** in n8n node development debugging time
- **Zero ambiguity** in validation feedback through detailed error reporting
- **First-mover advantage** in the growing n8n MCP ecosystem
- **Seamless integration** with Claude Code and other AI development tools

## Product Vision
To become the definitive validation solution for n8n developers, transforming generic "validation failed" errors into actionable, specific guidance that accelerates high-quality node development and reduces debugging friction.

## User Personas

### Primary Persona: n8n Node Developer
- **Context**: Building custom n8n nodes for specific business requirements or community contribution
- **Goals**: Create compliant, reliable n8n nodes that integrate seamlessly with the n8n ecosystem
- **Pain Points**: 
  - Generic validation errors provide no actionable feedback
  - Manual specification checking is time-consuming and error-prone
  - Debugging node issues requires deep TypeScript knowledge
  - No comprehensive validation tools exist for the development process
- **Success Criteria**: 
  - Receive specific, actionable validation feedback
  - Reduce debugging time by 50%
  - Confidence in node compliance before deployment

### Secondary Personas

#### AI-Assisted Developer
- **Context**: Using Claude Code or similar AI tools for n8n development
- **Goals**: Leverage AI assistance for rapid n8n node development
- **Pain Points**: AI tools lack n8n-specific validation capabilities
- **Success Criteria**: AI can provide accurate n8n validation guidance

#### n8n Community Contributor
- **Context**: Contributing nodes to the n8n community ecosystem
- **Goals**: Ensure contributed nodes meet quality standards
- **Pain Points**: Manual review process for community contributions
- **Success Criteria**: Automated validation before submission

## Functional Requirements

### Epic 1: Core Node Validation
**Goal**: Provide comprehensive validation of n8n nodes against official specifications
**Priority**: Critical

#### User Stories
1. **As a** n8n node developer, **I want to** validate my node JSON against official specifications **so that** I can identify compliance issues before deployment
   - **Acceptance Criteria**:
     - [ ] Accepts local node JSON and node type as input
     - [ ] Fetches official specification from n8n repository
     - [ ] Validates required properties (displayName, name, version, description)
     - [ ] Validates property types and structures
     - [ ] Returns detailed error report with specific issues
     - [ ] Provides compliance score (0-100)
     - [ ] Includes actionable recommendations for fixes
   - **Technical Notes**: Use TypeScript AST parsing for robust specification analysis

2. **As a** n8n node developer, **I want to** receive detailed validation errors **so that** I can quickly identify and fix specific compliance issues
   - **Acceptance Criteria**:
     - [ ] Errors categorized by type (missing_property, invalid_type, invalid_value, structural_error)
     - [ ] Each error includes exact path location
     - [ ] Expected vs actual values shown for type mismatches
     - [ ] Warnings for deprecated features or missing optional properties
     - [ ] Markdown-formatted output for readability
   - **Technical Notes**: Implement structured error reporting with clear messaging

### Epic 2: Specification Management
**Goal**: Efficiently fetch and parse official n8n node specifications
**Priority**: Critical

#### User Stories
1. **As a** n8n node developer, **I want to** fetch official node specifications **so that** I can understand expected structure and properties
   - **Acceptance Criteria**:
     - [ ] Searches n8n repository for node specifications
     - [ ] Fetches both TypeScript and JSON definition files
     - [ ] Parses TypeScript definitions into structured format
     - [ ] Supports version-specific specifications
     - [ ] Caches specifications to avoid rate limiting
     - [ ] Handles API errors gracefully
   - **Technical Notes**: Implement GitHub API integration with authentication and caching

2. **As a** n8n node developer, **I want to** compare different node implementations **so that** I can understand differences and alignment
   - **Acceptance Criteria**:
     - [ ] Accepts two node JSON inputs for comparison
     - [ ] Identifies all property differences
     - [ ] Categorizes differences (missing, extra, different values)
     - [ ] Provides side-by-side comparison view
     - [ ] Highlights critical vs minor differences
   - **Technical Notes**: Deep object comparison with detailed diff reporting

### Epic 3: Developer Experience
**Goal**: Provide exceptional developer experience with clear feedback and guidance
**Priority**: High

#### User Stories
1. **As a** n8n node developer, **I want to** receive user-friendly validation reports **so that** I can quickly understand and act on feedback
   - **Acceptance Criteria**:
     - [ ] Markdown-formatted reports with clear sections
     - [ ] Visual indicators (✅ ❌) for validation status
     - [ ] Actionable recommendations for each error
     - [ ] Links to relevant documentation when available
     - [ ] Summary of validation results at top of report
   - **Technical Notes**: Implement rich text formatting and structured reporting

2. **As an** AI-assisted developer, **I want** seamless MCP integration **so that** AI tools can provide accurate n8n validation guidance
   - **Acceptance Criteria**:
     - [ ] Proper MCP tool registration and discovery
     - [ ] JSON-RPC 2.0 compliant communication
     - [ ] Comprehensive tool descriptions and schemas
     - [ ] Structured error handling with appropriate error codes
     - [ ] Supports both stdio and HTTP transports
   - **Technical Notes**: Follow MCP best practices for tool development

### Epic 4: Performance and Reliability
**Goal**: Ensure fast, reliable validation with proper error handling
**Priority**: High

#### User Stories
1. **As a** n8n node developer, **I want** fast validation responses **so that** I can iterate quickly during development
   - **Acceptance Criteria**:
     - [ ] Validation completes in under 3 seconds for typical nodes
     - [ ] Implements intelligent caching for specifications
     - [ ] Supports parallel processing for multiple validations
     - [ ] Graceful degradation when GitHub API is unavailable
     - [ ] Progress indicators for long-running operations
   - **Technical Notes**: Implement in-memory caching and connection pooling

2. **As a** n8n node developer, **I want** reliable validation service **so that** I can depend on it for development workflows
   - **Acceptance Criteria**:
     - [ ] Handles GitHub API rate limits gracefully
     - [ ] Implements retry logic with exponential backoff
     - [ ] Provides fallback mechanisms for API failures
     - [ ] Logs errors appropriately for debugging
     - [ ] Maintains service availability during GitHub outages
   - **Technical Notes**: Implement robust error handling and fallback strategies

## Non-Functional Requirements

### Performance
- **Response Time**: <3 seconds for typical node validation
- **Throughput**: Support 100+ concurrent validations
- **Caching**: 95% cache hit rate for repeated specification requests
- **Memory Usage**: <512MB peak memory consumption

### Security & Privacy
- **Authentication**: Support GitHub token authentication for higher rate limits
- **Input Validation**: Comprehensive sanitization of all inputs
- **Rate Limiting**: Prevent abuse through request throttling
- **Data Protection**: No persistent storage of user node data

### Usability & Accessibility
- **Error Messages**: Clear, actionable error messages in plain English
- **Documentation**: Comprehensive API documentation and examples
- **Logging**: Structured logging for debugging and monitoring
- **Compatibility**: Support Node.js 16+ and modern TypeScript versions

### Reliability & Availability
- **Uptime**: 99.9% availability for validation services
- **Error Recovery**: Graceful handling of all external API failures
- **Fallback**: Local validation when GitHub API is unavailable
- **Monitoring**: Health check endpoints for service monitoring

## Technical Constraints

### GitHub API Limitations
- **Rate Limits**: 60 requests/hour unauthenticated, 5000 with token
- **Search Limitations**: Code search API has specific query constraints
- **File Size**: Large TypeScript files may hit API response limits

### MCP Protocol Requirements
- **JSON-RPC 2.0**: Strict compliance with MCP specification
- **Transport Support**: Both stdio and HTTP transport compatibility
- **Error Handling**: Proper McpError usage and error code standards

### TypeScript Parsing
- **AST Complexity**: Full TypeScript AST parsing for specification accuracy
- **Version Compatibility**: Support multiple TypeScript versions
- **Performance**: Efficient parsing for large node definition files

## Dependencies

### External Services
- **GitHub API**: Official n8n repository access for specifications
- **n8n Repository**: Source of truth for node specifications
- **MCP SDK**: Official Model Context Protocol implementation

### Internal Systems
- **Node.js Runtime**: Core execution environment
- **TypeScript Compiler**: AST parsing and type analysis
- **Caching Layer**: In-memory or Redis for specification caching

### Data Sources
- **n8n GitHub Repository**: Real-time specification updates
- **Official n8n Documentation**: Validation rules and best practices
- **Community Examples**: Reference implementations for comparison

## MVP Scope

**Goal**: Deliver core validation functionality that solves the primary pain point of generic validation errors

**Included**:
- ✅ **Core validation**: Required properties, types, and structure validation
- ✅ **Specification fetching**: GitHub API integration with basic caching
- ✅ **Detailed error reporting**: Specific, actionable validation feedback
- ✅ **MCP compliance**: Proper tool registration and communication
- ✅ **Basic comparison**: Side-by-side node comparison functionality

**Explicitly Excluded** (for later phases):
- ❌ **Advanced validation**: Deep property schema validation, credential validation
- ❌ **Real-time validation**: IDE integration or continuous validation
- ❌ **Custom validation rules**: User-defined validation criteria
- ❌ **Batch validation**: Multiple node validation in single request
- ❌ **Visual diff interface**: Rich UI for comparison results
- ❌ **Community integration**: Direct integration with n8n community tools

## Success Metrics

### User Metrics
- **Adoption**: 100+ unique users within first 3 months
- **Engagement**: 80% of users return for additional validations
- **Satisfaction**: 4.5/5 average rating from developer feedback

### Business Metrics
- **Time Savings**: 50% reduction in debugging time per user report
- **Error Reduction**: 75% decrease in validation-related issues
- **Market Position**: First comprehensive n8n validation MCP server

### Technical Metrics
- **Performance**: 95% of validations complete in <3 seconds
- **Reliability**: 99.9% uptime and successful validation rate
- **Quality**: Zero critical bugs in MVP release

## Release Strategy

### Phase 1: MVP (Weeks 1-4)
- Core validation functionality
- GitHub API integration with caching
- Basic MCP server implementation
- Comprehensive error reporting

### Phase 2: Enhanced Features (Weeks 5-8)
- Advanced validation rules and schemas
- Performance optimizations and monitoring
- Enhanced developer experience features
- Community feedback integration

### Phase 3: Full Vision (Weeks 9-12)
- Custom validation rules and extensibility
- IDE integration and real-time validation
- Advanced comparison and analysis features
- Enterprise features and scaling

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| GitHub API rate limits | High | Medium | Implement authentication, caching, and fallback mechanisms |
| TypeScript parsing complexity | High | Medium | Use proven AST parsing libraries and comprehensive testing |
| MCP protocol changes | Medium | Low | Stay updated with official SDK and protocol documentation |
| n8n specification changes | Medium | Medium | Implement version detection and backwards compatibility |
| Performance issues with large nodes | Medium | Medium | Optimize parsing and implement streaming for large files |

## Open Questions

- [ ] Should we support validation of custom/community nodes beyond official ones?
- [ ] What level of backwards compatibility with older n8n versions is needed?
- [ ] Should we implement real-time validation during development?
- [ ] How should we handle private/enterprise n8n node specifications?
- [ ] What additional validation rules would be most valuable to developers?

## Glossary

**n8n**: No-code/low-code workflow automation platform
**MCP**: Model Context Protocol - standard for AI-application context sharing
**AST**: Abstract Syntax Tree - structured representation of code
**JSON-RPC**: Remote procedure call protocol using JSON
**TypeScript**: Typed superset of JavaScript
**Node**: Basic building block of n8n workflows
**Validation**: Process of checking compliance with specifications
**Specification**: Official definition of expected structure and behavior

---
*This PRD is a living document. Updates should be tracked with version notes below.*

## Version History
- v1.0 - 2024-01-17 - Initial PRD created from research findings