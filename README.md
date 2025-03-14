This is just to have a closed PR for testing purposes.

# TimeCop

A GitHub Action that enforces PR merge requirements based on dependencies and dates. It prevents PRs from being merged until:

- All dependent PRs are merged
- The specified release date/time has been reached

## Quick Start

```yaml
# .github/workflows/timecop.yml
name: TimeCop Check
on:
  pull_request:
    types: [opened, reopened, edited, labeled, unlabeled, synchronize]

jobs:
  check-requirements:
    runs-on: ubuntu-latest
    steps:
      - uses: hacknlove/timecop@v1
```

## Setting Requirements

Requirements can be specified in three ways (in order of priority):

### 1. Labels (Highest Priority)

```
after: 2024-01-15
merged: https://github.com/org/repo/pull/123
```

### 2. PR Description

```
## MERGE REQUIREMENTS:
* after: 2024-01-15
* merged: https://github.com/org/repo/pull/123
* merged: https://github.com/org/repo/pull/456
```

### 3. Commit Messages (Lowest Priority)

```
feat: implement new feature

## MERGE REQUIREMENTS:
* after: 2024-01-15
* merged: https://github.com/org/repo/pull/123
```

## Requirements Format

### Date Requirements

- Format: `after: YYYY-MM-DD` or `after: YYYY-MM-DD HH:MM`
- Times are in UTC if not specified
- Only the highest priority date is used
- Earlier dates from lower priority sources are ignored

### Dependency Requirements

- Format: `merged: <PR_URL>`
- Must be a valid GitHub PR URL
- All dependencies are combined from all sources
- PRs must be accessible to the action

## Behavior

- 🔄 Checks all sources for requirements
- 📅 Blocks merging until date requirements are met
- 🔗 Ensures all dependent PRs are merged
- ❌ Fails with clear error messages when requirements aren't met

## Examples

### Release Date Only

```
## MERGE REQUIREMENTS:
* after: 2024-01-15 14:30
```

### Dependencies Only

```
## MERGE REQUIREMENTS:
* merged: https://github.com/org/repo/pull/123
* merged: https://github.com/org/repo/pull/456
```

### Combined Requirements

```
## MERGE REQUIREMENTS:
* after: 2024-01-15
* merged: https://github.com/org/repo/pull/123
```

## License

MIT
