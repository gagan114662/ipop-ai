# iPOP Launch Compliance

This repo is the source of truth for the iPOP launch based on Twenty.
Do not treat the project as production-ready until this checklist is closed.

## License Position

- Most of the Twenty codebase is AGPLv3. If iPOP is offered as a network service, users must be able to receive the corresponding source for the modified service.
- Files marked with `@license Enterprise` are governed by the Twenty Commercial License and are not cleared for production resale without a valid Twenty Enterprise subscription or written commercial agreement.
- Production deployment must make a clear choice: AGPL community deployment with source offer, or commercially licensed Enterprise deployment.

## Required Launch Actions

- Preserve upstream Twenty copyright, AGPLv3, and notice files.
- Publish or link the corresponding source for the exact deployed build from this GitHub repo and branch.
- Review the final production image and disable or exclude Enterprise-marked capabilities unless a valid commercial license is recorded.
- Do not imply Twenty endorsement, partnership, or official resale unless a written agreement exists.

## Current Gate

Blocked until issue #15 is closed with evidence for both:

- AGPL source-offer path for the production build.
- Enterprise-marked file decision: excluded/disabled, or commercially licensed without exposing private contract details.
