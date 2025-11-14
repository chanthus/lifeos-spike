# Code Review Standards & Guidelines

Code review standards, checklists, and processes for the monorepo.

## Code Review Philosophy

Code reviews ensure quality, maintain standards, catch potential issues, and help engineers grow through constructive feedback.

## Clean Code Rules (MANDATORY - Applies to ALL Code)

Verify that all code follows clean code principles from:
https://gist.githubusercontent.com/wojteklu/73c6914cc446146b8b533c0988cf8d29/raw/c7a44d774fc3b09a0d5f0f58888550ba0ac694b9/clean_code.md

## Critical Rules

- **ALWAYS** respect existing codebase patterns and conventions
- **NEVER** suggest unnecessary changes or refactoring unless explicitly problematic
- Preserve existing code style and only flag genuine issues
- Ensure suggestions align with established conventions

## Review Process

### Analysis Areas

1. **Code Quality** - Architecture patterns, consistency
2. **Security** - Vulnerabilities, auth/authorization
3. **Performance** - Bottlenecks, query efficiency
4. **Type Safety** - Proper types (no unnecessary `any`)
5. **Maintainability** - Readability, technical debt
6. **Testing** - Integration test coverage
7. **Error Handling** - Validation, user-friendly errors

### Severity Levels

- **🔴 Critical (must fix)** - Security issues, bugs, data integrity, breaking changes
- **🟡 Important (should fix)** - Performance issues, maintainability, missing tests
- **🟢 Suggestion (consider)** - Nice-to-haves, alternative approaches

### Context & Judgment Framework

**CRITICAL:** Severity levels are **guidelines, not rules**. Exercise judgment based on context.

**Assess severity by:**

1. **Business Impact** - Production outage → 🔴, Degraded UX → 🟡, Minor → 🟢
2. **Data Sensitivity** - Financial/PII → 🔴, Analytics → 🟡, UI state → 🟢
3. **Production Criticality** - Core flows → 🔴, Internal tools → 🟡, Prototypes → 🟢
4. **Project Phase** - Production → higher severity, Beta → moderate, POC → lower
5. **Risk vs. Cost** - Low-effort/high-risk → 🔴, High-effort/low-risk → 🟢

**Always explain WHY** something matters in the specific context.

## Key Checklist Items

### TypeScript & Type Safety

- No use of `any` type (use `unknown` or proper types)
- Exported functions have explicit return types
- No unnecessary type assertions

### React & Frontend

- No missing dependencies in useEffect, useCallback, useMemo
- No state mutations
- Proper cleanup in useEffect
- No memory leaks

### Database & Backend

- No SQL injection vulnerabilities
- Proper transaction usage
- Foreign keys and constraints defined
- Audit columns included
- BaseRepository pattern used
- DI pattern followed

### API Design

- Input validation on all endpoints
- Proper authentication and authorization
- Sensitive data not exposed
- Error messages don't leak internals

### Security

- No hardcoded secrets
- Input sanitization
- Proper authentication on protected routes
- No injection attacks

### Testing

- Integration tests for all new API endpoints (MANDATORY)
- Tests actually test the described behavior
- Tests are not brittle

### Code Quality

- No console.logs or debug code
- No commented-out code
- No temporary comments or TODOs without tickets

## Communication Style

- ✅ Be respectful and constructive
- ✅ Acknowledge good practices
- ✅ Explain the "why" behind suggestions
- ✅ Provide specific examples and solutions
- ✅ Focus on genuine issues, not preferences
- ❌ Never suggest unnecessary refactoring
- ❌ Don't block on style if it follows existing patterns
