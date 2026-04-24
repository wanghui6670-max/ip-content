# Backlog

This backlog starts after PR #2, the P0/P1 baseline PR.

## P1 dashboard productization

### P1.1 Overview and view structure — merged

Goal: make the dashboard easier to understand as a daily operating workspace.

Tasks:

- [x] add clear sections for Overview, Topics, Tasks, Publish, Review, and Assets
- [x] keep the current single page layout until routing is needed
- [x] preserve the current topic detail flow
- [x] keep tests and web build green

Implementation notes:

- added `src/lib/views.js`
- added `src/view.css`
- added `test/views.test.js`
- injected a view navigation panel above the existing dashboard content

### P1.2 Data confidence and source panel — merged

Goal: make data freshness and source mode visible.

Tasks:

- [x] show full source vs fallback snapshot status clearly
- [x] show generated time and mirror time in one place
- [x] add empty states for missing source files
- [x] add copy explaining what users can trust in fallback mode

Implementation notes:

- added data confidence cards inside the Build Mode panel
- added `src/confidence.css`
- updated `src/lib/panels.js`
- expanded `test/panels.test.js`

### P1.3 Task and publish views — in review

Goal: make execution work easier to track.

Tasks:

- [x] separate content tasks from publish receipts
- [x] surface owner, planned date, status, and platform
- [x] add simple filters for status and platform
- [x] keep table rendering small and dependency free

Implementation notes:

- added `src/lib/execution.js`
- added `src/execution.css`
- connected execution filters to dashboard state
- added `test/execution.test.js`

### P1.4 Review and asset views

Goal: make weekly review and reusable assets easier to inspect.

Tasks:

- create a review panel for current week conclusions and next actions
- create an asset list grouped by content line
- show asset reuse direction and linked topic ids

## P2 sync package

### P2.1 feishu-sync skeleton

Goal: move sync-related logic toward `packages/feishu-sync`.

Tasks:

- add package structure
- define mirror manifest shape
- define local CSV read/write helpers
- keep secrets out of committed files

### P2.2 mirror validation

Goal: detect missing or malformed mirror data before build.

Tasks:

- validate required CSV headers
- report missing tables clearly
- add validation output for build logs

## P3 CLI foundation

### P3.1 ip-cli skeleton

Goal: start a small local CLI for repeatable operations.

Tasks:

- add CLI package under `tools/ip-cli`
- expose basic commands for status and validation
- call shared domain helpers instead of duplicating rules

### P3.2 local validation command

Goal: allow local preflight checks before deploy.

Tasks:

- validate dashboard generated data
- validate mirror metadata
- validate domain stage rules
- print actionable errors

## P4 access and release hardening

### P4.1 deployment access policy

Goal: make deployment access expectations explicit.

Tasks:

- document public vs protected deployment modes
- document when Feishu URLs may be exposed
- add release checklist

### P4.2 release notes

Goal: make project changes traceable.

Tasks:

- add changelog
- summarize each merged PR
- track breaking changes and migration notes
