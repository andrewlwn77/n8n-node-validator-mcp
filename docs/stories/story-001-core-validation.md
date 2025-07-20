---
type: template
id: story-tmpl
title: User Story Template
created_by: pm
validates_with: [story-draft-checklist]
phase: implementation
used_in_tasks: [create-next-story, implement-story]
produces: story
---

# Story: Core n8n Node Validation

**Story ID**: N8N-001  
**Epic**: Core Node Validation  
**Priority**: Critical  
**MVP Classification**: Core  
**Points**: 8  
**Sprint**: 1

## User Story
**As a** n8n node developer  
**I want to** validate my node JSON against official n8n specifications  
**So that** I can identify and fix compliance issues before deployment

## Context
This is the foundational story that delivers the core value proposition of the n8n Validator MCP. Currently, n8n developers receive generic "validation failed" errors that provide no actionable feedback. This story implements comprehensive validation that compares local node implementations against official n8n specifications fetched from the GitHub repository.

This story addresses the primary pain point identified in research and provides the essential functionality that all other features build upon.

## Acceptance Criteria
- [ ] **Given** a valid n8n node JSON string and node type **When** validation is requested **Then** the system fetches the official specification and returns a detailed validation report
- [ ] **Given** a node with missing required properties **When** validation runs **Then** specific missing properties are identified with expected values
- [ ] **Given** a node with incorrect property types **When** validation runs **Then** type mismatches are reported with expected vs actual types
- [ ] **Given** a node with invalid structure **When** validation runs **Then** structural errors are identified with specific path locations
- [ ] **Given** a valid node **When** validation runs **Then** a compliance score of 80+ is returned with success indicators
- [ ] Error handling: Invalid JSON returns structured error with parsing details
- [ ] Edge cases: Handle nodes with null/undefined values gracefully
- [ ] Performance: Validation completes within 3 seconds for typical nodes

## Technical Guidance

### Implementation Approach
- Implement `N8nNodeValidator` class with core validation logic
- Create GitHub API client with proper error handling and rate limiting
- Use TypeScript AST parsing instead of regex for robust specification parsing
- Structure validation into separate methods for different validation types

### Architecture Alignment
- Build on MCP SDK foundation with proper tool registration
- Implement as standalone service with minimal external dependencies
- Use layered architecture: API → Service → Validation → Parsing
- Ensure clean separation between GitHub integration and validation logic

### API Changes
- Implement `validate_n8n_node` MCP tool with schema validation
- Accept `nodeJson` (string) and `nodeType` (string) parameters
- Return structured validation result with errors, warnings, and score
- Use Zod schemas for input validation and type safety

### Data Changes
- No persistent data storage required for MVP
- Implement in-memory caching for GitHub API responses
- Cache official specifications to avoid repeated API calls
- Consider Redis for production caching layer

### Integration Points
- **GitHub API**: Fetch official n8n node specifications
- **TypeScript Compiler API**: Parse TypeScript node definitions
- **MCP Protocol**: Standard tool registration and communication
- **Zod**: Input validation and schema enforcement

### Performance Considerations
- Implement specification caching with TTL
- Use parallel processing for multiple validation checks
- Optimize TypeScript parsing for large node files
- Consider streaming for very large specification files

### Security Considerations
- Validate all inputs to prevent injection attacks
- Implement rate limiting to prevent abuse
- Sanitize GitHub API responses before processing
- Use environment variables for sensitive configuration

## Design & UX

### User Flow
1. Developer provides node JSON and type through Claude Code
2. System fetches official specification from GitHub
3. Validation runs against specification
4. Detailed report returned with specific issues
5. Developer uses feedback to fix issues

### UI Requirements
- Markdown-formatted validation reports
- Clear visual indicators (✅ ❌) for status
- Structured error sections with specific details
- Actionable recommendations for each issue
- Compliance score prominently displayed

### Mockups/Wireframes
```
# n8n Node Validation Result

## Validation Status: ❌ INVALID
## Compliance Score: 65/100

### Errors (3)
- **missing_property** at `displayName`: Required property 'displayName' is missing
  Expected: string
  Actual: undefined

- **invalid_type** at `version`: Property 'version' has incorrect type
  Expected: number
  Actual: string

### Warnings (1)
- **deprecated_property** at `icon`: Icon property should use new format

### Recommendations
- Add required displayName property
- Convert version to number type
- Update icon property format
```

### Accessibility
- Use semantic markdown structure for screen readers
- Ensure color-blind friendly status indicators
- Provide keyboard navigation support
- Follow WCAG 2.1 AA standards

## Test Scenarios

### Happy Path
1. Valid node JSON with all required properties
2. System fetches specification successfully
3. Validation passes with high compliance score
4. Returns success report with score 90+

### Error Cases
1. **Missing Required Properties**
   - Trigger: Node JSON missing displayName
   - Expected: Specific error with expected property details

2. **Invalid Property Types**
   - Trigger: Version property as string instead of number
   - Expected: Type mismatch error with expected vs actual

3. **GitHub API Failure**
   - Trigger: Network error or rate limiting
   - Expected: Graceful fallback with cached specification

4. **Invalid JSON Input**
   - Trigger: Malformed JSON string
   - Expected: Structured parsing error with helpful message

### Edge Cases
- Empty node JSON object
- Very large node files (>1MB)
- Nodes with special characters in names
- Multiple validation errors in single node
- Nodes with deprecated properties

## Definition of Done

### Development Checklist
- [ ] Implementation complete and working locally
- [ ] Unit tests written and passing (coverage >80%)
- [ ] Integration tests for GitHub API integration
- [ ] Code reviewed by team member
- [ ] No critical linting errors
- [ ] Performance tested with realistic node sizes

### Quality Checklist
- [ ] All acceptance criteria verified
- [ ] Edge cases tested with various node configurations
- [ ] Error scenarios validated with proper error handling
- [ ] Rate limiting tested with multiple requests
- [ ] Cache functionality verified
- [ ] TypeScript parsing accuracy validated

### Documentation Checklist
- [ ] API documentation updated with tool schema
- [ ] Code comments for complex validation logic
- [ ] README updated with usage examples
- [ ] Architecture diagram includes validation flow

### Deployment Checklist
- [ ] Environment variables configured
- [ ] GitHub API token tested
- [ ] Monitoring/alerts configured for API failures
- [ ] Rollback plan documented

## Dependencies

### Blocked By
- Basic MCP server setup and TypeScript project structure
- GitHub API research and authentication setup

### Blocks
- All other validation features depend on this core functionality
- Specification fetching tool depends on GitHub integration
- Node comparison depends on validation logic

### External Dependencies
- GitHub API availability and rate limits
- n8n repository structure and specification format
- TypeScript compiler API for AST parsing
- MCP SDK for protocol implementation

## Implementation Notes
- Start with regex-based parsing for MVP, then upgrade to AST parsing
- Implement comprehensive error handling from the beginning
- Focus on clear, actionable error messages
- Consider using existing TypeScript parsing libraries
- Plan for specification caching strategy early

---

## Story Status

**Status**: Draft

### Progress Tracking
- [ ] Development started
- [ ] Core functionality complete
- [ ] Tests written
- [ ] Code review complete
- [ ] QA testing complete
- [ ] Deployed to staging
- [ ] Deployed to production

### Blockers
None currently identified

---
*Last Updated*: 2024-01-17 by PM