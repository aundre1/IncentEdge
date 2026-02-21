# IncentEdge Test Suite

Comprehensive test suite for IncentEdge application, targeting 80%+ code coverage for business logic.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── utils/
│   └── test-helpers.ts        # Mock factories and utilities
├── lib/                       # Business logic tests (Priority 1)
│   ├── eligibility-engine.test.ts
│   ├── incentive-matcher.test.ts
│   ├── pdf-generator.test.ts
│   ├── direct-pay-checker.test.ts
│   └── stacking-analyzer.test.ts
├── api/                       # API route tests (Priority 2)
│   ├── eligibility.test.ts
│   ├── projects.test.ts
│   └── auth.test.ts
└── components/                # Component tests (Priority 3)
    ├── dashboard.test.tsx
    └── forms.test.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test tests/lib/eligibility-engine.test.ts
```

### Run tests matching pattern
```bash
npm test -- --grep "eligibility"
```

## Test Framework

- **Vitest**: Fast unit test framework
- **Testing Library**: React component testing
- **MSW**: API mocking (when needed)
- **@testing-library/jest-dom**: DOM assertions

## Writing Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '@/lib/module';
import { createMockProject } from '../utils/test-helpers';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should handle happy path', () => {
      const input = createMockProject();
      const result = functionToTest(input);
      expect(result).toBeDefined();
    });

    it('should handle error case', () => {
      const invalidInput = null;
      expect(() => functionToTest(invalidInput)).toThrow();
    });

    it('should handle edge case', () => {
      const edgeInput = createMockProject({ total_units: 0 });
      const result = functionToTest(edgeInput);
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Using Test Helpers

```typescript
import {
  createMockProject,
  createMockIncentive,
  createMockLIHTC,
  mockApiSuccess,
  mockApiError,
} from '../utils/test-helpers';

// Create mock project with defaults
const project = createMockProject();

// Override specific fields
const customProject = createMockProject({
  state: 'CA',
  total_units: 200,
});

// Create mock incentive
const incentive = createMockIncentive({
  jurisdiction_level: 'state',
  amount_fixed: 1000000,
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw on invalid input', () => {
  expect(() => functionWithError()).toThrow('Expected error message');
});

it('should handle async errors', async () => {
  await expect(asyncFunctionWithError()).rejects.toThrow();
});
```

## Coverage Goals

- **Business Logic (lib/)**: 80%+ coverage
- **API Routes**: 70%+ coverage
- **Components**: 60%+ coverage
- **Overall**: 75%+ coverage

## Test Categories

### Unit Tests (lib/)
Test individual functions and modules in isolation.

**Examples:**
- Eligibility engine calculations
- Incentive matching algorithms
- PDF generation logic
- Direct Pay eligibility checks
- Stacking analysis

### Integration Tests (api/)
Test API routes and database interactions.

**Examples:**
- Project CRUD operations
- Eligibility calculation endpoints
- Authentication flows

### Component Tests (components/)
Test React components and user interactions.

**Examples:**
- Dashboard rendering
- Form validation
- User interactions

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the function does, not how
   - Test public APIs, not private internals

2. **Use descriptive test names**
   ```typescript
   ✅ it('should match federal program to NY project')
   ❌ it('test1')
   ```

3. **Follow AAA pattern**
   ```typescript
   it('should calculate total value', () => {
     // Arrange
     const project = createMockProject();

     // Act
     const result = calculateValue(project);

     // Assert
     expect(result).toBe(expected);
   });
   ```

4. **Test edge cases**
   - Empty arrays
   - Null/undefined values
   - Boundary conditions
   - Error states

5. **Keep tests isolated**
   - No shared state between tests
   - Use beforeEach for setup
   - Mock external dependencies

6. **Use meaningful assertions**
   ```typescript
   ✅ expect(result.estimatedValue).toBe(3000000);
   ❌ expect(result).toBeTruthy();
   ```

## Debugging Tests

### Run single test
```bash
npm test -- --run tests/lib/eligibility-engine.test.ts
```

### Run with verbose output
```bash
npm test -- --reporter=verbose
```

### Update snapshots
```bash
npm test -- -u
```

### Debug in VS Code
Add breakpoints and use the VS Code test runner or add to launch.json:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Vitest Debug",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "${file}"],
  "console": "integratedTerminal"
}
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-push hooks (if configured)

### Required Checks
- All tests must pass
- Coverage thresholds must be met
- No failing tests allowed in main branch

## Common Issues

### Tests timing out
Increase timeout in test file:
```typescript
import { it } from 'vitest';
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Mock not working
Ensure mocks are defined before imports:
```typescript
vi.mock('@/lib/module', () => ({
  function: vi.fn(),
}));

import { component } from '@/components/Component';
```

### TypeScript errors
Ensure test files have proper types:
```typescript
import type { Project } from '@/types';
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Assertions](https://vitest.dev/api/expect.html)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)

## Contributing

When adding new features:
1. Write tests first (TDD recommended)
2. Ensure tests pass
3. Verify coverage meets thresholds
4. Update this README if adding new test patterns
