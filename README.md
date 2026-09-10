# 10x Engineering Evidence Hub

The Evidence Hub turns scattered test names, command transcripts, logs, and links into a cached completeness summary, an AI-assisted gap audit, and a reviewer-ready PDF.

**10x claim:** assembling a reliable project evidence pack drops from roughly 30 minutes of manual cross-checking to under 3 minutes of structured entry and one audit request.

## Program concepts

| Concept | Implementation |
|---|---|
| API endpoints | Versioned HTTP boundary in `src/app.js` |
| Database | SQLite migrations and indexes in `src/db.js` |
| Authentication | SHA-256 token lookup; protected, user-scoped resources |
| Background jobs | Durable, idempotent audit queue with retries and alerts |
| Reporting | Dependency-free PDF audit generator |
| Caching | Versioned summary cache, invalidated by evidence writes |
| LLM integration | Narrow schema-validated gap analyzer with per-call cost ledger |

No swaps are used.

```text
evidence API -> SQLite -> versioned summary cache
                   `-> durable audit job -> validated gap analyzer -> cost ledger
                   `-> PDF report
```

## Run and five-minute demo

Requires Node.js 24+; no package install or paid key.

```bash
npm run seed
npm start
```

Use `Authorization: Bearer reviewer-demo-token`. Read the seeded summary, add evidence, observe cache invalidation, queue/run an audit with an `Idempotency-Key`, then open `GET /api/projects/1/report.pdf`. Run `npm test` for all scary cases.

## Non-goal and limitations

Non-goal: ingesting arbitrary GitHub repositories automatically. Evidence is deliberately explicit and explainable. The default gap analyzer is deterministic; a hosted/local LLM can implement the same validated contract without changing workflow code.
