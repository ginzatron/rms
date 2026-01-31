---
name: review
description: Code review checklist for RMS codebase
disable-model-invocation: true
---

# Code Review Checklist

Review the code changes: $ARGUMENTS

## Security Review

- [ ] No hardcoded secrets or credentials
- [ ] SQL queries use parameterized statements (no injection)
- [ ] User input is validated and sanitized
- [ ] Authentication/authorization checks in place
- [ ] Multi-tenant data isolation maintained (company_id checks)
- [ ] Audit logging for sensitive operations
- [ ] No sensitive data in logs

## Data Model Review

- [ ] Migrations are reversible
- [ ] Indexes added for frequently queried columns
- [ ] Foreign key constraints appropriate
- [ ] Soft deletes used where audit trail needed
- [ ] Reference data vs tenant data properly separated

## API Review

- [ ] Endpoints follow REST conventions
- [ ] Error responses are consistent
- [ ] Pagination for list endpoints
- [ ] Rate limiting considerations
- [ ] Input validation at API boundary

## Code Quality

- [ ] TypeScript strict mode compliance
- [ ] No `any` types without justification
- [ ] Functions are focused (single responsibility)
- [ ] Error handling is comprehensive
- [ ] No dead code or commented-out code

## Testing

- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Edge cases covered
- [ ] Tests are deterministic (no flaky tests)

## Performance

- [ ] N+1 query patterns avoided
- [ ] Large result sets paginated
- [ ] Expensive operations are async
- [ ] Caching considered where appropriate

## Documentation

- [ ] Complex logic has comments
- [ ] API changes reflected in docs
- [ ] Breaking changes documented

## Provide Feedback

For each issue found, specify:
1. **File and line number**
2. **Issue type** (security, bug, style, performance)
3. **Severity** (critical, major, minor, suggestion)
4. **Description** of the problem
5. **Suggested fix**
