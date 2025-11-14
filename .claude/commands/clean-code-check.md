Audit the entire codebase against clean code principles and fix violations.

# Objective

Systematically verify that all code follows clean code principles from:
https://gist.githubusercontent.com/wojteklu/73c6914cc446146b8b533c0988cf8d29/raw/c7a44d774fc3b09a0d5f0f58888550ba0ac694b9/clean_code.md

# Step 1: Fetch Clean Code Principles

Use WebFetch to retrieve the latest clean code principles document and understand:

- General rules (meaningful names, small functions, DRY, etc.)
- Functions (small, do one thing, descriptive names, few arguments)
- Comments (explain why not what, avoid noise)
- Formatting (consistent style, proper indentation)
- Objects and Data Structures (data abstraction, law of Demeter)
- Error Handling (use exceptions, don't return null)
- Tests (one assert per test, FIRST principles)
- Metrics (dead code, duplicate code, commented code)

# Step 2: Parallel Agent Audit

Use multiple code-review-engineer agents in parallel to audit different modules:

**Backend Clean Code Audit**:

- All files in `apps/backend/src/`
- Check: Function sizes, naming conventions, DRY violations, error handling, commented code

**Frontend Clean Code Audit - Marketing**:

- All files in `apps/marketing/src/`
- Check: Component sizes, naming, prop drilling, duplicate logic, commented code

**Frontend Clean Code Audit - Web App**:

- All files in `apps/web/src/`
- Check: Component sizes, naming, prop drilling, duplicate logic, commented code

**Frontend Clean Code Audit - Admin App**:

- All files in `apps/admin/src/`
- Check: Component sizes, naming, prop drilling, duplicate logic, commented code

**Mobile App Clean Code Audit**:

- All files in `apps/mobile/src/`
- Check: Component sizes, naming, prop drilling, duplicate logic, commented code, React Native patterns

**Shared UI Clean Code Audit**:

- All files in `packages/ui/src/`
- Check: Component composition, naming, reusability, commented code

**Database & Utilities Audit**:

- All files in `packages/db/src/`
- Check: Query complexity, naming, abstraction levels

**Test Code Audit**:

- All test files across the codebase
- Check: Test naming, one assert per test, test readability, setup/teardown

# Step 3: Categorize Violations

Group findings by clean code principle violated:

**Naming Violations:**

- Unclear variable/function names
- Non-descriptive names
- Inconsistent naming conventions
- Magic numbers/strings

**Function Violations:**

- Functions too long (>20 lines)
- Functions doing multiple things
- Too many parameters (>3)
- Nested conditionals too deep (>3 levels)

**DRY Violations:**

- Duplicate code blocks
- Copy-pasted logic
- Similar functions that could be abstracted

**Comment Violations:**

- Commented-out code
- Noise comments (obvious statements)
- Comments explaining what instead of why
- Outdated comments

**Structure Violations:**

- Poor abstraction levels
- God objects/components
- Tight coupling
- Law of Demeter violations

**Error Handling Violations:**

- Silent failures
- Returning null instead of throwing
- Generic error messages
- Missing error boundaries (React)

**Code Smells:**

- Dead code
- Unused variables/imports
- Console.logs left in
- TODO comments without tickets

# Step 4: Write Findings to Tracking File

Create a file named `.claude/audit/clean-code-check-YYYY-MM-DD.md` with:

- Summary of total violations by category
- Severity rating (🔴 Critical, 🟡 Important, 🟢 Minor)
- Issues organized with checkboxes
- File paths and line numbers
- Specific clean code principle violated
- Code snippet showing the issue
- Suggested refactoring

Example format:

```markdown
# Clean Code Check Report - 2025-01-15

## Summary

- 🔴 Critical: 2 violations
- 🟡 Important: 18 violations
- 🟢 Minor: 12 violations

## 🔴 Critical Violations

### Dead Code

- [ ] `apps/backend/src/features/legacy/old-auth.ts` - Entire file unused
  - Fix: Remove file if confirmed not needed
- [ ] `apps/web/src/utils/deprecated.ts:15-45` - Commented out function
  - Fix: Remove commented code block

## 🟡 Important Violations

### Function Too Long (Clean Code: Functions should be small)

- [ ] `apps/backend/src/features/users/users.service.ts:45` - createUser() is 78 lines
  - Fix: Extract validation, email sending, and event publishing into separate methods

### DRY Violation (Clean Code: Don't Repeat Yourself)

- [ ] `apps/admin/src/components/UserForm.tsx:20` & `apps/admin/src/components/ProductForm.tsx:18`
  - Duplicate form validation logic (45 lines identical)
  - Fix: Extract shared `useFormValidation()` hook

### Too Many Parameters (Clean Code: Functions should have few arguments)

- [ ] `apps/backend/src/features/reports/reports.service.ts:67` - generateReport() has 7 params
  - Fix: Use options object pattern

## 🟢 Minor Violations

### Naming - Magic Numbers

- [ ] `apps/web/src/components/Pagination.tsx:34` - Hardcoded number `100`
  - Fix: Extract constant `MAX_PAGE_SIZE = 100`

...
```

# Step 5: Interactive Fixing Workflow

- Show the tracking file location
- Ask the user how they want to proceed:
  1. **Fix all at once** - Automatically refactor all violations
  2. **Fix by category** - Go through Naming → Functions → DRY → Comments → etc.
  3. **Fix by severity** - Fix Critical → Important → Minor
  4. **Fix item by item** - Review and approve each refactoring
  5. **Ignore specific items** - Mark certain violations as acceptable exceptions

After each fix:

- Check off the item in the tracking file: `- [ ]` → `- [x]`
- Update the summary counts
- Ensure `pnpm check` still passes
- Ensure `pnpm test` still passes
- Show progress (e.g., "Fixed 12/47 violations")
- Continue until complete or user stops

# Step 6: Progress Tracking

- Maintain the tracking file throughout the process
- Mark completed items with `[x]`
- Update summary with remaining violation counts
- Keep the file for reference and resumption if Claude Code restarts

# Step 6: Verification & Summary

After all fixes:

- Run `pnpm check` to ensure no type/lint errors
- Run `pnpm test` to ensure all tests pass
- Generate before/after metrics:
  - Average function length
  - Number of commented code blocks removed
  - Duplicate code eliminated
  - Dead code removed
- Summarize improvements made

# Important Guidelines

- **DO NOT break functionality** - Only refactor, don't change behavior
- **DO NOT commit automatically** - NEVER create git commits without explicit user permission
- After fixing violations, ask the user if they want to commit the changes
- Only run git commands when the user explicitly requests it
- **Preserve existing patterns** - Clean code within project conventions
- **Be pragmatic** - Some violations may be acceptable (explain why)
- **Use TodoWrite** to track refactoring progress
- **Run tests frequently** to ensure nothing breaks

# Exceptions to Consider

Some violations may be acceptable:

- Long functions in migration scripts (one-time use)
- Magic numbers that are domain-specific constants
- Comments required for complex algorithms
- Test files with multiple asserts for integration tests (per @docs/testing.md)

Ask user before applying fixes to these edge cases.

$ARGUMENTS
