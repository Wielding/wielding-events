import { WieldingEvent } from '../WieldingEvent';
import { WieldingEventStore } from './../WieldingEventStore';

import { WieldingObserver } from '../WieldingObserver';

const testStore = new WieldingEventStore('testStore');
let eventOneRecieved = false;

function onTestEventReceived(event: any): void {
  eventOneRecieved = true;
}

test('testStore creation', () => {
  expect(testStore.name).toBe('testStore');
});

test('event one received', () => {
  const eventOneObserver: WieldingObserver = testStore.AddObserver(onTestEventReceived, "EVENTONE");

  testStore.Dispatch(new WieldingEvent("EVENTONE", { received: true }))
  
  expect(eventOneRecieved).toBeTruthy();

  expect(localStorage.getItem('@@events')).toBe('["EVENTONE"]');

  testStore.RemoveObserver(eventOneObserver);
});
