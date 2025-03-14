# Work In Progress - TimeCop

## Current Status
We've completed several major features:
- Basic collectors (labels, PR description, commit messages)
- Date validation with timezone support
- PR dependency validation
- Unit tests and integration tests

## Technical Notes
- PR validation uses a two-step process:
  1. Parse PR URL into owner/repo/number
  2. Validate PR status (merged/draft/closed)
- Date handling:
  - All dates are parsed to UTC internally
  - Supports both date-only and date-time formats
  - Timezone support via UTC offset (e.g., UTC+01:00)
- GitHub API interaction:
  - Uses @octokit/rest for API calls
  - Handles rate limits via exponential backoff (TODO)
  - Optional token authentication

## Code Architecture
- Collectors: Independent modules that extract requirements
- Validators: Validate specific requirement types
- GitHub Client: Centralized API interaction
- Types: Shared interfaces and error types

## Recent Changes
- Made GitHub token optional for public repos
- Fixed linting issues across multiple files
- Added integration tests for PR validation
- Updated ROADMAP.md to reflect progress

## Next Tasks (in priority order)
1. Add caching for PR status checks
   - Implement in-memory cache
   - Add cache invalidation
   - Consider persistent cache for long-running instances

2. Handle rate limiting
   - Implement exponential backoff
   - Add rate limit headers handling
   - Consider queue system for bulk operations

3. Mock GitHub API responses
   - Create mock data fixtures
   - Add test helpers for common scenarios
   - Ensure consistent test behavior

## Key Files
- `src/utils/github-client.ts` - Main GitHub API interaction
- `src/utils/pr-validator.ts` - PR validation logic
- `src/collectors/*.ts` - Requirement collectors
- Integration tests in `*integration.test.ts` files

## Notes for Next Session
1. The GitHub client is working without token for public repos
2. Integration tests are using real GitHub API calls
3. Need to consider rate limiting before implementing caching
4. All dates are handled in UTC

## Instructions for User
When resuming work:
1. Check if integration tests pass without token
2. Run `npm test` to verify all unit tests
3. Consider adding test coverage thresholds
4. Let me know if you want to focus on a specific task

## Open Questions
1. Should we implement persistent caching?
2. How to handle rate limits in GitHub Actions context?
3. What's the best way to mock GitHub API for tests?

## Current Test PRs
- Merged PR: https://github.com/hacknlove/timecop/pull/1
- Closed PR: https://github.com/hacknlove/timecop/pull/2
- Open PR: https://github.com/hacknlove/timecop/pull/3
