# RMS Planning

This directory contains iterative planning documents for the Residency Management System.

## Current Phase: Phase 1 - MVP (EPA Assessment Platform)

## Planning Approach

We're using **Option 3: Iterative Planning** - starting with MVP documented in detail, expanding as we build.

## Directory Structure

```
planning/
├── README.md                 # This file
├── phase-1-mvp/              # Current phase planning
│   ├── overview.md           # Phase 1 scope and goals
│   ├── user-stories.md       # User stories for MVP
│   ├── technical-spec.md     # Technical implementation details
│   ├── api-design.md         # API endpoints (when ready)
│   └── milestones.md         # Phase 1 milestones/checkpoints
├── decisions/                # Architecture Decision Records (ADRs)
│   ├── 001-database-choice.md
│   ├── 002-mobile-framework.md
│   └── ...
└── reference/                # Domain reference materials
    └── ...
```

## Phases Overview

### Phase 1: MVP - EPA Assessment Platform (Current)
- Mobile assessment capture
- Resident/Faculty dashboards
- Basic CCC reporting
- Program admin panel
- **Specialty**: General Surgery only

### Phase 2: Milestones & CCC (Future)
- Milestone tracking
- Full CCC meeting workflow
- Milestone → ACGME reporting
- Remediation tracking

### Phase 3: Scheduling Integration (Future)
- Rotation management
- Schedule import/integration
- Context-aware assessments

### Phase 4: Multi-Specialty Expansion (Future)
- Internal Medicine EPAs
- Emergency Medicine EPAs
- Specialty-specific customizations

### Phase 5: Advanced Features (Future)
- Procedure logging
- 360 evaluations
- Predictive analytics
- Full ACGME ADS integration

## Working with Claude Code

This project is designed to leverage Claude Code features:

### Skills (`.claude/skills/`)
- `/domain` - GME domain knowledge
- `/data-model` - Database schema reference
- `/mvp` - MVP scope and requirements
- `/fix-issue` - Issue fixing workflow
- `/review` - Code review checklist

### Subagents (`.claude/agents/`)
- `domain-expert` - Answers GME/ACGME questions
- `security-reviewer` - Security vulnerability review
- `data-model-reviewer` - Database schema review

### Recommended Workflow

1. **Research**: Use `/domain` skill or `domain-expert` subagent
2. **Plan**: Enter plan mode, reference skills for context
3. **Implement**: Exit plan mode, write code
4. **Review**: Use `/review` or subagents for code review
5. **Commit**: Use descriptive commits, reference issues

## Key Documents

| Document | Purpose |
|----------|---------|
| `/CLAUDE.md` | Project-level Claude Code instructions |
| `/.claude/skills/domain/SKILL.md` | GME domain knowledge |
| `/.claude/skills/data-model/SKILL.md` | Database schema |
| `/.claude/skills/mvp/SKILL.md` | MVP requirements |
| `/planning/phase-1-mvp/overview.md` | Current phase details |
