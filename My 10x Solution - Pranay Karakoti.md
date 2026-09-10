# My 10x Solution - Pranay Karakoti

## The problem

Engineering assignments and portfolio projects often require proof scattered across tests, terminal transcripts, logs, and links. Authors spend about 30 minutes manually checking a brief, collecting proof, and rebuilding a reviewer document—and still miss requirements. Reviewers then repeat that navigation. The Evidence Hub makes that evidence explicit once and turns it into a completeness score, gap audit, and readable PDF in under three minutes.

## How I implemented it

The solution has seven program concepts and no swaps: validated API endpoints, SQLite persistence, hashed-token authentication, durable background audit jobs, PDF reporting, versioned caching, and a narrow LLM-compatible gap analyzer. Adding evidence increments the project version and invalidates only its old summary cache. An audit job is unique by idempotency key, retries invalid model output, stores an alert after the final failure, validates the analysis schema, and logs attributed cost. Every database read is scoped to the authenticated user.

Run `npm run seed`, then `npm start` with Node.js 24+. Use bearer token `reviewer-demo-token`, inspect project 1, add evidence, queue and run an audit, and request its `.pdf` report. `npm test` proves authentication, isolation, caching, retries, idempotency, AI validation/costs, PDF output, and persistence across restart.

The explicit non-goal is automatic ingestion of arbitrary GitHub repositories. The core stays small, auditable, and useful.
