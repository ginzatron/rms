---
name: api
description: Guidelines for creating or updating API endpoints - includes testing requirements
---

# API Development Guidelines

When creating or updating API endpoints, follow these steps to ensure consistency and test coverage.

## Adding a New Endpoint

1. **Implement the endpoint** in [src/index.ts](src/index.ts)
   - Follow existing patterns (use `sql` template literals)
   - Add proper error handling with try-catch
   - Return appropriate status codes (200, 201, 400, 404)

2. **Add tests** in `tests/api/`
   - Create a new test file if it's a new resource: `tests/api/{resource}.test.ts`
   - Or add to existing test file if extending a resource
   - Test: success cases, error cases (404), field validation, sorting/filtering

3. **Run the test suite**
   ```bash
   bun test tests/api
   ```

4. **Update documentation** if needed
   - Update the endpoint list in CLAUDE.md
   - Update the server startup banner in src/index.ts

## Updating an Existing Endpoint

1. **Read the existing tests** in `tests/api/` for that endpoint
2. **Make your changes** to the endpoint
3. **Update or add tests** to cover the changes
4. **Run tests** to verify nothing broke:
   ```bash
   bun test tests/api
   ```

## Test File Structure

```typescript
import { describe, test, expect } from "bun:test";
import { fetchApi } from "../utils/test-client";

describe("Resource API", () => {
  describe("GET /api/resource", () => {
    test("returns list of resources", async () => {
      const res = await fetchApi("/api/resource");
      expect(res.status).toBe(200);
      // ... assertions
    });
  });
});
```

## Test Utilities

Use the helpers in [tests/utils/test-client.ts](tests/utils/test-client.ts):
- `fetchApi(path, options)` - Make API requests with proper headers
- `get(path)` - GET request
- `post(path, body)` - POST request
- `patch(path, body)` - PATCH request
- `del(path)` - DELETE request

## Checklist

- [ ] Endpoint implemented with error handling
- [ ] Tests added/updated in `tests/api/`
- [ ] All tests passing (`bun test tests/api`)
- [ ] Server banner updated (if new endpoint)
