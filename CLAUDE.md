# Residency Management System (RMS)

An enterprise multi-tenant platform for Graduate Medical Education (GME) residency management, focused on EPA assessments, milestones, and competency tracking.

## Project Context

- **Domain**: Graduate Medical Education (ACGME-compliant)
- **Architecture**: Multi-tenant SaaS (companies → institutions → programs)
- **MVP Focus**: EPA Assessment Platform for General Surgery
- **Stack**: TBD (planning phase)

## Development Workflow

### Planning Phase (Current)
- All planning docs live in `/planning/`
- Domain knowledge lives in `.claude/skills/`
- Use `/domain` skill to understand ACGME/GME requirements
- Use `/data-model` skill for database schema reference

### When Implementing
- Always run tests after making changes
- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Prefer editing existing files over creating new ones

## Key Commands

```bash
# Planning
# Review planning docs before implementation

# Development (TBD - will be added as stack is chosen)
```

## Architecture Decisions

See `/planning/decisions/` for ADRs (Architecture Decision Records).

## Multi-Tenant Structure

```
Company (SaaS Customer)
└── Institution (e.g., Massachusetts General Hospital)
    ├── Sponsoring Institution Role (holds ACGME accreditation)
    │   └── Programs (e.g., General Surgery Residency)
    └── Participating Institution Role (affiliate sites)
        └── Clinical Sites
```

## Domain Concepts

- **EPA**: Entrustable Professional Activity - specific clinical tasks residents must demonstrate competency in
- **Milestones**: ACGME developmental markers across 6 core competencies
- **CCC**: Clinical Competency Committee - reviews resident progress
- **Entrustment Levels**: 1-5 scale from "observation only" to "practice ready"

## Skills Available

- `/domain` - GME domain knowledge, ACGME requirements
- `/data-model` - Database schema and relationships
- `/mvp` - MVP scope and feature requirements
- `/fix-issue` - Workflow for fixing GitHub issues
- `/review` - Code review checklist

## Subagents Available

- `domain-expert` - Answers GME/ACGME domain questions
- `security-reviewer` - Reviews code for security issues
- `data-model-reviewer` - Validates data model changes

## Important Notes

- This is a HIPAA-adjacent application (GME data, not PHI, but high privacy requirements)
- ACGME compliance is critical - reference official requirements
- Multi-tenancy must be rock-solid - data isolation between companies/institutions
- Reference data (specialties, EPAs, milestones) is shared; tenant data is isolated
