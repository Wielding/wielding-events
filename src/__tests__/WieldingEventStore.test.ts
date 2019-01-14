import { WieldingEventStore } from './../WieldingEventStore';

const testStore = new WieldingEventStore('testStore');

test('testStore creation', () => {
  expect(testStore.name).toBe('testStore');
});
