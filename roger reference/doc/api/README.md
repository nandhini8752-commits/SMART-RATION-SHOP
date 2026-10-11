# API Contract

`openapi.yaml` is the canonical contract, currently organized into 47 paths under `/api/v1`.

## Import and inspect

- Swagger Editor: https://editor.swagger.io/ (paste or upload the YAML)
- Keep request/response schemas aligned with the implementation and tests.
- Generate typed frontend clients from this contract if useful, but do not let generated code replace runtime validation.

## Local examples

### Health
```bash
curl http://localhost:3000/api/v1/health
```

### Search fictional demo shops
```bash
curl 'http://localhost:3000/api/v1/public/shops?q=Anna%20Nagar&page=1&pageSize=20'
```

### Verify a synthetic card (demo mode only)
```bash
curl -X POST http://localhost:3000/api/v1/citizen/demo-card-verifications \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-verify-000001' \
  -d '{"cardNumber":"DEMO-TN-0001"}'
```

### Create a token
Replace `<verification-id>` and `<shop-uuid>` with values returned by your local demo API.
```bash
curl -X POST http://localhost:3000/api/v1/queue-tokens \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-token-000001' \
  -d '{"verificationId":"<verification-id>","shopId":"<shop-uuid>"}'
```

### Error format
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "The requested quantity exceeds available demo stock.",
    "requestId": "req_example",
    "details": [{ "field": "items[0].quantity", "issue": "Available quantity is 4 kg." }]
  }
}
```

## Notes

- Browser staff/admin routes use a server-managed cookie session; keep the cookie HTTP-only and never read it in frontend JavaScript.
- Use the `Idempotency-Key` header for state-changing operations where specified.
- Never use actual ration-card numbers in examples, screenshots or test logs.
