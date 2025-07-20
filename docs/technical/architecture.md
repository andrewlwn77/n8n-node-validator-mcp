---
type: template
id: architecture-tmpl
title: Architecture Design Template
created_by: architect
validates_with: [architect-checklist]
phase: design
used_in_tasks: [create-architecture]
produces: architecture
---

# Architecture Design: n8n Validator MCP

## Architecture Overview

The n8n Validator MCP is designed as a **single-process MCP server** that validates n8n node implementations against official specifications. The architecture prioritizes simplicity, reliability, and performance while maintaining extensibility for future enhancements.

**Key Design Principles:**
- **Simplicity First**: Minimal components, clear interfaces, easy deployment
- **Reliability**: Graceful degradation, comprehensive error handling, fallback mechanisms
- **Performance**: Sub-3-second validation with intelligent caching
- **Extensibility**: Clean abstractions for future validation rules and node types

## Architecture Pattern Selection

### Selected Pattern: Modular Monolith with Vertical Slices

**Rationale**: The n8n Validator MCP is perfectly suited for a modular monolith because:
- **Single deployment unit** simplifies MCP server distribution and installation
- **Clear module boundaries** around validation, fetching, and comparison features
- **Vertical slices** organized by MCP tools rather than technical layers
- **Future evolution** possible to microservices if needed for scale

**Alternative Patterns Considered:**
- **Distributed Services**: Rejected due to unnecessary complexity for MVP scope
- **Serverless Functions**: Rejected due to cold start impact on <3s response time requirement
- **Traditional N-Tier**: Rejected due to lack of feature-based organization

## System Components

### Component Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server Transport Layer                    │
├─────────────────────────────────────────────────────────────────┤
│                       MCP Tool Router                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Validation    │  │ Specification   │  │   Comparison    │ │
│  │     Tool        │  │   Fetcher       │  │     Tool        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Core Services Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Validation    │  │    GitHub       │  │     Cache       │ │
│  │    Engine       │  │     Client      │  │    Manager      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   TypeScript    │  │     Error       │  │    Logging      │ │
│  │     Parser      │  │    Handler      │  │     Service     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Inventory

#### MCP Server Transport Layer
- **Purpose**: Handles MCP protocol communication and tool registration
- **Boundaries**: MCP SDK integration, stdio/HTTP transport support
- **Dependencies**: @modelcontextprotocol/sdk, Zod for validation
- **Interface**: JSON-RPC 2.0 over stdio/HTTP with proper error handling
- **Deployment**: Node.js process with MCP SDK integration
- **Data Ownership**: MCP protocol state and tool registration

#### MCP Tool Router
- **Purpose**: Routes incoming tool requests to appropriate handlers
- **Boundaries**: Tool dispatch, input validation, response formatting
- **Dependencies**: Zod schemas, MCP SDK types
- **Interface**: Internal tool dispatch with typed parameters
- **Deployment**: Embedded in main process
- **Data Ownership**: Tool routing configuration and request/response mapping

#### Validation Tool
- **Purpose**: Implements `validate_n8n_node` MCP tool functionality
- **Boundaries**: Tool interface, validation orchestration, result formatting
- **Dependencies**: Validation Engine, Specification Fetcher
- **Interface**: MCP tool with nodeJson/nodeType parameters
- **Deployment**: Tool handler within main process
- **Data Ownership**: Validation request/response lifecycle

#### Specification Fetcher
- **Purpose**: Implements `fetch_node_spec` MCP tool and provides specifications
- **Boundaries**: GitHub API integration, specification caching, parsing
- **Dependencies**: GitHub Client, Cache Manager, TypeScript Parser
- **Interface**: MCP tool + internal service for validation
- **Deployment**: Tool handler + service within main process
- **Data Ownership**: Specification data and metadata

#### Comparison Tool
- **Purpose**: Implements `compare_nodes` MCP tool functionality
- **Boundaries**: Deep object comparison, difference categorization
- **Dependencies**: None (pure comparison logic)
- **Interface**: MCP tool with localNode/specNode parameters
- **Deployment**: Tool handler within main process
- **Data Ownership**: Comparison request/response lifecycle

#### Validation Engine
- **Purpose**: Core validation logic for n8n node compliance
- **Boundaries**: Validation rules, error categorization, scoring
- **Dependencies**: TypeScript Parser for specification analysis
- **Interface**: Internal service with typed validation methods
- **Deployment**: Service within main process
- **Data Ownership**: Validation rules and result generation

#### GitHub Client
- **Purpose**: Handles all GitHub API interactions with resilience
- **Boundaries**: API requests, rate limiting, authentication, retries
- **Dependencies**: fetch API, GitHub API endpoints
- **Interface**: Internal service with typed GitHub operations
- **Deployment**: Service within main process
- **Data Ownership**: GitHub API state and rate limiting

#### Cache Manager
- **Purpose**: Provides intelligent caching for specifications and results
- **Boundaries**: Cache storage, TTL management, eviction policies
- **Dependencies**: In-memory Map (MVP), Redis (future)
- **Interface**: Internal service with get/set/invalidate operations
- **Deployment**: Service within main process
- **Data Ownership**: Cached data and metadata

#### TypeScript Parser
- **Purpose**: Parses TypeScript node definitions into structured data
- **Boundaries**: AST parsing, property extraction, type analysis
- **Dependencies**: TypeScript Compiler API
- **Interface**: Internal service with parse/extract methods
- **Deployment**: Service within main process
- **Data Ownership**: Parsed specification data

#### Error Handler
- **Purpose**: Centralized error handling and user-friendly messaging
- **Boundaries**: Error categorization, message formatting, logging
- **Dependencies**: Logging Service
- **Interface**: Internal service with error handling methods
- **Deployment**: Service within main process
- **Data Ownership**: Error state and formatting rules

#### Logging Service
- **Purpose**: Structured logging for debugging and monitoring
- **Boundaries**: Log formatting, level filtering, output routing
- **Dependencies**: Console (MVP), structured logging library (future)
- **Interface**: Internal service with log methods
- **Deployment**: Service within main process
- **Data Ownership**: Log messages and metadata

## Data Architecture

### Selected Pattern: Single In-Memory Cache with External Data Sources

**Rationale**: The n8n Validator MCP has simple data requirements:
- **No persistent storage** needed for core functionality
- **External data sources** (GitHub API) provide authoritative specifications
- **Caching essential** for performance and rate limit management
- **Stateless design** enables simple deployment and scaling

**Alternative Patterns Considered:**
- **Persistent Database**: Rejected due to lack of persistent data requirements
- **Distributed Cache**: Rejected due to MVP scope and deployment complexity
- **Event Sourcing**: Rejected due to simple data model and no audit requirements

### Storage Technologies
| Data Type | Technology | Rationale |
|-----------|------------|-----------|
| Specification Cache | In-Memory Map | Fast access, automatic GC, simple deployment |
| GitHub API Responses | Ephemeral | No persistence needed, cache handles performance |
| Validation Results | Ephemeral | Stateless design, no result storage required |
| Configuration | Environment Variables | Simple configuration, 12-factor app compliance |

### Data Flow
1. **Specification Request** → Cache Manager → GitHub Client → TypeScript Parser → Cached Result
2. **Validation Request** → Specification Fetcher → Validation Engine → Formatted Result
3. **Comparison Request** → JSON Parser → Comparison Logic → Formatted Result
4. **Cache Management** → TTL-based eviction → LRU eviction → Memory management

## API & Integration Architecture

### Internal Communication
- **Synchronous**: Direct method calls within single process
- **Asynchronous**: Promise-based for external API calls
- **Service Discovery**: Dependency injection pattern for testability

### External APIs
- **Style**: MCP JSON-RPC 2.0 over stdio/HTTP
- **Versioning Strategy**: Semantic versioning with backward compatibility
- **Rate Limiting**: GitHub API rate limiting with exponential backoff
- **Authentication**: GitHub token support for higher rate limits

### Integration Patterns
- **GitHub API**: RESTful HTTP with JSON responses, rate limiting, pagination
- **MCP Protocol**: JSON-RPC 2.0 with proper error codes and structured responses
- **TypeScript Compiler**: Direct API usage for AST parsing and analysis

## Security Architecture

### Security Layers
1. **Network**: HTTPS for GitHub API, secure stdio transport for MCP
2. **Application**: Input validation, output sanitization, rate limiting
3. **Data**: No sensitive data storage, environment variable configuration
4. **Operational**: Structured logging, error monitoring, security updates

### Authentication & Authorization
- **User Authentication**: Not required (tool-based access through MCP)
- **Service Authentication**: GitHub token for API access (optional)
- **Authorization Model**: MCP tool-based access control

### Compliance & Privacy
- **Requirements**: No specific compliance requirements for MVP
- **Data Residency**: No persistent data storage
- **Audit Trail**: Structured logging for debugging and monitoring

## Infrastructure & Deployment

### Selected Pattern: Platform-as-a-Service (PaaS) with Edge Distribution

**Rationale**: For MCP servers, the deployment model is unique:
- **Local installation** as npm package for direct Claude Code integration
- **Edge distribution** for shared/remote MCP servers
- **Minimal DevOps** overhead for individual developers
- **Simple deployment** for quick adoption

**Alternative Patterns Considered:**
- **Container Orchestration**: Rejected due to complexity for single-process tool
- **Serverless Functions**: Rejected due to cold start impact on performance
- **Traditional VMs**: Rejected due to overhead for simple MCP server

### Infrastructure Strategy
- **Primary Distribution**: NPM package for local installation
- **Secondary Platform**: Railway/Heroku for shared instances
- **Edge Enhancement**: Cloudflare Workers for caching layer (future)
- **Environment Strategy**: Local development, shared staging, distributed production

### Deployment Details
- **Package Manager**: NPM with TypeScript compilation
- **Process Manager**: PM2 for production instances
- **Configuration**: Environment variables with sensible defaults
- **Secrets Management**: Environment variables, dotenv for development

### Scalability Design
- **Scaling Triggers**: Not applicable for local tool usage
- **Scaling Limits**: Memory limits for cache size
- **Bottleneck Mitigation**: Intelligent caching, request deduplication

## Operational Architecture

### Observability
- **Metrics**: Response time, cache hit rate, GitHub API usage, error rates
- **Logging**: Structured JSON logging with correlation IDs
- **Tracing**: Simple request tracing for debugging
- **Alerting**: GitHub API rate limit warnings, persistent errors

### Reliability
- **SLA Target**: 99.9% availability for validation requests
- **Failure Modes**: GitHub API outages, network issues, memory limits
- **Recovery Strategy**: Graceful degradation, cached responses, user guidance
- **Chaos Engineering**: Not applicable for MVP scope

### Performance
- **Response Time**: <3 seconds for validation, <2 seconds for specification fetching
- **Throughput**: 100+ concurrent validations (local usage pattern)
- **Resource Budget**: <512MB memory, minimal CPU usage

## Development & Testing Architecture

### Development Workflow
- **Local Development**: TypeScript with hot reload, mock GitHub API
- **Feature Flags**: Not applicable for MVP scope
- **Database Migrations**: Not applicable (no persistent storage)

### Testing Strategy
- **Unit Tests**: 80%+ coverage, focus on validation logic and parsing
- **Integration Tests**: GitHub API mocking, MCP protocol compliance
- **E2E Tests**: Full tool workflows with real specifications
- **Performance Tests**: Load testing with concurrent requests

### Code Organization
```
src/
├── tools/           # MCP tool implementations
│   ├── validation/  # Validation tool
│   ├── fetching/    # Specification fetching tool
│   └── comparison/  # Comparison tool
├── services/        # Core business logic
│   ├── validation/  # Validation engine
│   ├── github/      # GitHub API client
│   ├── cache/       # Cache management
│   └── parsing/     # TypeScript parser
├── infrastructure/  # Cross-cutting concerns
│   ├── errors/      # Error handling
│   ├── logging/     # Logging service
│   └── config/      # Configuration
└── server/          # MCP server setup
    ├── transport/   # Transport configuration
    └── registry/    # Tool registration
```

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+, TypeScript 5.0+
- **Frameworks**: MCP SDK, Zod for validation
- **Build Tools**: TypeScript compiler, ESBuild for bundling
- **Testing**: Jest with TypeScript support
- **Linting**: ESLint with TypeScript rules

### Supporting Services
- **GitHub API**: REST API for specification fetching
- **TypeScript Compiler**: AST parsing and analysis
- **Cache**: In-memory Map (MVP), Redis (future)
- **Logging**: Console (MVP), structured logging (future)

## Architecture Decision Records

### ADR-001: Modular Monolith Architecture
- **Status**: Accepted
- **Context**: Need to choose between monolith vs microservices for MCP server
- **Decision**: Modular monolith with vertical slices by MCP tools
- **Alternatives**: Microservices (too complex), traditional monolith (poor organization)
- **Consequences**: Simpler deployment, easier debugging, clear module boundaries

### ADR-002: In-Memory Caching Strategy
- **Status**: Accepted
- **Context**: Need caching for GitHub API responses and performance
- **Decision**: In-memory Map with TTL and LRU eviction
- **Alternatives**: Redis (deployment complexity), no caching (performance issues)
- **Consequences**: Simple deployment, memory usage concerns, no persistence

### ADR-003: TypeScript AST Parsing
- **Status**: Accepted
- **Context**: Need robust parsing of TypeScript node definitions
- **Decision**: Use TypeScript Compiler API for AST parsing
- **Alternatives**: Regex parsing (fragile), custom parser (complex)
- **Consequences**: Accurate parsing, dependency on TypeScript, performance cost

### ADR-004: GitHub API Integration
- **Status**: Accepted
- **Context**: Need access to official n8n node specifications
- **Decision**: Direct GitHub API with rate limiting and caching
- **Alternatives**: Git clone (storage issues), scraping (unreliable)
- **Consequences**: Real-time specs, rate limiting challenges, network dependency

## Migration & Evolution

### Current State
Starting from scratch with validated requirements and user stories.

### Migration Strategy
- **Approach**: Greenfield development with iterative releases
- **Phases**: MVP → Enhanced validation → Advanced features
- **Rollback Plan**: Version pinning, backward-compatible changes

### Future Evolution
- **Advanced Validation**: Deep property validation, credential checking
- **Performance Optimization**: Redis caching, request batching
- **IDE Integration**: VS Code extension, real-time validation
- **Enterprise Features**: Custom validation rules, team management

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| GitHub API rate limits | High | Medium | Authentication, intelligent caching, fallback messages |
| TypeScript parsing failures | High | Low | Comprehensive error handling, fallback to regex |
| Memory usage from caching | Medium | Medium | LRU eviction, memory monitoring, cache size limits |
| n8n specification changes | Medium | Medium | Version detection, backward compatibility |
| Network connectivity issues | Medium | Low | Graceful degradation, cached responses |
| MCP protocol evolution | Low | Medium | Stay updated with SDK, maintain compatibility |

---
*This architecture document evolves with the system. Updates are tracked through version control and ADRs.*