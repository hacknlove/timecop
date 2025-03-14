# TimeCop Development Roadmap

## 🔄 Current Sprint
- Implementing requirement collectors
  - [x] Basic project setup
  - [x] Label collector implementation
  - [x] Label collector tests
  - [x] Description collector
  - [x] Commit message collector

## 🎯 Upcoming Tasks

### Phase 1: Core Collectors
- [x] Add error handling for malformed requirements
- [x] Add validation for requirement formats
- [x] Implement requirement priority system
- [x] Add debug logging for requirement collection

### Phase 2: Date Validation
- [x] Implement date parsing
- [ ] Add timezone support
- [ ] Validate date formats
- [ ] Compare dates with current time
- [ ] Handle invalid date formats

### Phase 3: PR Dependency Validation
- [ ] Check PR existence
- [ ] Verify PR merge status
- [ ] Handle cross-repository PRs
- [ ] Add caching for PR status checks
- [ ] Handle rate limiting

### Phase 4: Testing & Documentation
- [ ] Unit tests for all collectors
- [ ] Integration tests
- [ ] Mock GitHub API responses
- [ ] Add test coverage reporting
- [ ] Update documentation with examples

### Phase 5: Enhancements
- [ ] Add configuration options
  - [ ] Custom date formats
  - [ ] Custom requirement prefixes
  - [ ] Source priority override
- [ ] Add detailed error messages
- [ ] Add status checks API integration
- [ ] Add PR comment support
- [ ] Add requirement summary in PR

### Phase 6: Release & Maintenance
- [ ] First beta release
- [ ] GitHub Action marketplace publication
- [ ] Monitor for issues
- [ ] Performance optimization
- [ ] Add usage analytics

## 🔍 Potential Future Features
- Support for additional requirement types
- Web UI for requirement management
- Integration with project management tools
- Custom validation rules
- Release schedule management

## 🐛 Known Issues
- None reported yet

## 📝 Notes
- All dates should be handled in UTC
- PR dependencies can be from any accessible repository
- Requirements can be combined from multiple sources 