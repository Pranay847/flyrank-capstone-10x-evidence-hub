# Evidence

- API/auth: `hashed bearer authentication protects users`.
- Database/isolation: `project and evidence are isolated per user` and `SQLite persistence survives a restart`.
- Cache: `evidence cache is reused then invalidated on write`.
- Jobs/idempotency/LLM/cost: `audit job is idempotent, schema-valid, costed, and completes`.
- Retries/alerts: `invalid AI output retries and raises a durable alert on final failure`.
- Reporting: `PDF report is a real PDF containing an audit page`.

Run `npm test`; expected: 7 pass, 0 fail.
