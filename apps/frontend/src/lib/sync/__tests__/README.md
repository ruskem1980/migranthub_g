# Sync Module Tests

This directory contains comprehensive unit tests for the offline synchronization module.

## Test Coverage

### OfflineQueue Tests (`offlineQueue.test.ts`)

Tests for the `OfflineQueue` class that manages the offline operation queue.

#### enqueue
- ✅ Should add an item to the queue with generated ID
- ✅ Should enqueue item without body

#### dequeue
- ✅ Should get and delete the first pending item (FIFO)
- ✅ Should return undefined if no pending items

#### peek
- ✅ Should return the first pending item without deleting it
- ✅ Should return undefined if no pending items

#### getAll
- ✅ Should return all pending items sorted by createdAt

#### getAllIncludingFailed
- ✅ Should return pending and failed items sorted by createdAt

#### clear
- ✅ Should clear all items from the queue

#### clearCompleted
- ✅ Should delete only completed items

#### getCount
- ✅ Should return count of pending items

#### getPendingAndFailedCount
- ✅ Should return count of pending and failed items

#### getById
- ✅ Should return item by ID
- ✅ Should return undefined if item not found

#### updateStatus
- ✅ Should update status without error
- ✅ Should update status with error message

#### incrementRetryCount
- ✅ Should increment retry count and update lastAttemptAt
- ✅ Should not update if item not found

#### resetFailed
- ✅ Should reset all failed items to pending
- ✅ Should return 0 if no failed items

#### remove
- ✅ Should delete item by ID

#### markAsProcessing
- ✅ Should update status to processing

#### markAsCompleted
- ✅ Should delete the item from queue

#### markAsFailed
- ✅ Should increment retry count and update status to failed with error

**Total: 25 tests**

---

### BackgroundSync Tests (`backgroundSync.test.ts`)

Tests for the `BackgroundSync` class that handles synchronization with the server.

#### syncOne
- ✅ Should successfully sync an item with token
- ✅ Should successfully sync an item without token
- ✅ Should handle HTTP error responses
- ✅ Should mark as failed when max retries reached
- ✅ Should handle network errors
- ✅ Should handle timeout with AbortController
- ✅ Should handle response parsing errors gracefully

#### processQueue
- ✅ Should not process if already syncing
- ✅ Should not process if offline
- ✅ Should process all items in queue successfully
- ✅ Should handle mixed success and failures
- ✅ Should skip processing items
- ✅ Should apply exponential backoff delay for retried items
- ✅ Should stop processing if going offline mid-sync
- ✅ Should update lastSyncAt on successful completion
- ✅ Should notify listeners when sync state changes

#### getIsSyncing
- ✅ Should return false initially
- ✅ Should return true during sync

#### getLastSyncAt
- ✅ Should return Date or null
- ✅ Should return Date after successful sync

#### subscribe
- ✅ Should add listener and return unsubscribe function
- ✅ Should call listener on state changes
- ✅ Should not call listener after unsubscribe

#### getConfig
- ✅ Should return a copy of the configuration

#### setConfig
- ✅ Should update configuration partially
- ✅ Should update multiple config values

#### exponential backoff calculation
- ✅ Should calculate correct delays for different retry counts
- ✅ Should cap delay at maxDelay
- ✅ Should respect custom baseDelay and maxDelay

**Total: 28 tests**

---

## Test Summary

- **Total Test Suites**: 2
- **Total Tests**: 53
- **All Tests Passing**: ✅

## Running the Tests

```bash
# Run all sync tests
npm test -- --testPathPatterns="sync/__tests__"

# Run with verbose output
npm test -- --testPathPatterns="sync/__tests__" --verbose

# Run with coverage
npm test -- --testPathPatterns="sync/__tests__" --coverage

# Run in watch mode
npm test -- --testPathPatterns="sync/__tests__" --watch
```

## Test Patterns

All tests follow the Arrange-Act-Assert pattern:

```typescript
it('should do something', async () => {
  // Arrange - Setup test data and mocks
  const mockData = { ... };
  (mockFunction as jest.Mock).mockResolvedValue(mockData);

  // Act - Execute the function under test
  const result = await functionUnderTest();

  // Assert - Verify the results
  expect(result).toEqual(expectedValue);
  expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
});
```

## Mocking Strategy

- **Database (Dexie)**: Mocked using jest.mock with manual mock implementation
- **Token Storage**: Mocked to return predefined tokens
- **Fetch API**: Mocked globally to simulate HTTP responses
- **Navigator.onLine**: Mocked to test offline/online scenarios
- **Timers**: Using jest.useFakeTimers() for testing delays and timeouts

## Edge Cases Covered

1. **Network failures**: Connection errors, timeouts, HTTP errors
2. **Offline scenarios**: Device going offline, staying offline
3. **Retry logic**: Exponential backoff, max retry limits
4. **Concurrent operations**: Preventing multiple simultaneous syncs
5. **State management**: Listener notifications, config updates
6. **Error handling**: Parsing errors, missing data, invalid responses
7. **Queue management**: FIFO ordering, status transitions, cleanup

## Notes

- Tests use mocked dependencies to ensure isolation
- The backgroundSync singleton is reset before each test
- All async operations are properly awaited
- Timers are properly cleaned up after fake timer tests
