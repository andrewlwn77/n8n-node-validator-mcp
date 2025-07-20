---
description: Execute tasks using BMAD Method multi-perspective analysis with specialized agent personas
argument-hint: "[task description]"
allowed-tools: Read, Edit, MultiEdit, Write, Glob, Grep, Bash, Task, TodoWrite
---

# BMAD Method Task Execution

## Core Instructions
You MUST follow all instructions in @CLAUDE.md exactly as written. This includes the BMAD Method Router for comprehensive multi-perspective analysis.

## Task Context
**User Request**: $ARGUMENTS

## Available BMAD Agents
Based on @bmad-agent/ structure, you have access to specialized personas:

### Core Personas
- **Analyst** (@bmad-agent/personas/analyst.md) - Problem investigation, research, requirements analysis
- **PM** (@bmad-agent/personas/pm.md) - Product strategy, feature definition, backlog management  
- **Architect** (@bmad-agent/personas/architect.md) - System design, technical architecture, API design
- **Designer** (@bmad-agent/personas/designer.md) - User experience, interface design, usability
- **Developer** (@bmad-agent/personas/developer.md) - Implementation, code quality, technical execution
- **DevOps** (@bmad-agent/personas/devops.md) - Deployment, infrastructure, operational concerns
- **QA** (@bmad-agent/personas/qa.md) - Testing strategy, quality assurance, validation
- **Data Engineer** (@bmad-agent/personas/data-engineer.md) - Data architecture, pipelines, analytics
- **Orchestrator** (@bmad-agent/personas/orchestrator.md) - Multi-persona coordination, workflow management

### Supporting Resources
- **Tasks**: @bmad-agent/tasks/ - Specific executable workflows
- **Templates**: @bmad-agent/templates/ - Document structures and formats  
- **Checklists**: @bmad-agent/checklists/ - Quality validation and completeness checks
- **Guides**: @bmad-agent/guides/ - Process guidance and best practices

## Execution Protocol

1. **Apply BMAD Router Logic** from @CLAUDE.md:
   - Load persona frontmatter for intent recognition
   - Route to appropriate persona(s) based on confidence scoring
   - Execute multi-perspective analysis for comprehensive solutions

2. **Follow Persona Instructions**:
   - Read complete persona file when routing
   - Apply persona response format with proper identifiers
   - Use frontmatter connections for efficient resource discovery
   - Follow handoff patterns for persona transitions

3. **Quality Assurance**:
   - Run appropriate validation checklists
   - Apply cross-perspective validation when beneficial
   - Document decisions for session continuity

4. **Session Management**:
   - Use TodoWrite for task tracking and progress visibility
   - Update session state for multi-session continuity
   - Maintain handoff context for smooth transitions

## Your Mission
Execute the user's request using the full power of BMAD Method multi-perspective analysis. Discover dramatically better solutions through systematic application of specialized expert lenses, following all guidance in @CLAUDE.md and leveraging the complete @bmad-agent/ ecosystem.

Focus on expansive solution discovery - quality comes from breadth of consideration, not just thoroughness.