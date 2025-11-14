# Rules for creating/updating claude md and other related documentation for claude code

- Make sure the documentation is in a place where claude can and will use it.
- Avoid duplication of information within the document or in other documents
  - Use @ links to other documents instead of duplicating information
- **IMPORTANT** Docs should be short, clear and concise.
- Avoid code examples unless absolutely necessary. State the rule that needs to be followed, though. Point to code in the actual codebase instead. Claude is good at reading the actual code.
  - Code examples ARE necessary when:
    - Showing complex patterns not obvious from reading the code
    - Documenting configuration that doesn't exist in the codebase
    - Illustrating usage patterns that span multiple files/modules
- Make sure to check and update out-of-date information.
- Common docs are in @docs
- Read https://docs.claude.com/en/docs/claude-code/memory#claude-md-imports for more info

## End goal

- The end goal of having these docs is for claude code to read, understand and follow them. So, keep that in mind when creating/updating them.

## Documentation format:

- Use clear markdown headers for sections
- Prefer bullet points over long paragraphs
- Use bold for **critical rules** or warnings
- Keep each point focused on a single concept
- Be short, concise, clear

## Verification:

- After updating docs, test that Claude can find and use them by asking a relevant question
- Ensure @ references resolve correctly

$ARGUMENTS
