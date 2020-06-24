import { WieldingEvent } from '../WieldingEvent';
import { WieldingEventStore } from '../WieldingEventStore';
import {IEvent} from "../WieldingInterfaces";

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
  const eventOneObserver: WieldingObserver = testStore.AddObserver(onTestEventReceived, "@@EVENTONE", 'test', true);

  testStore.loadFromLocal();

  testStore.Dispatch(new WieldingEvent("@@EVENTONE", { received: true }))
  
  expect(eventOneRecieved).toBeTruthy();

  expect(localStorage.getItem('testStore@@events')).toBe('["testStore@@EVENTONE"]'); 

  testStore.RemoveObserver(eventOneObserver);
});

test('getEventById', () => {
  const newStore = new WieldingEventStore('testStore');

  const ev = testStore.GetEventById<IEvent<string, {received: false}>>("@@EVENTONE");

  expect(ev.payload.received);
});

test('getEventPayload', () => {
  const newStore = new WieldingEventStore('testStore');

  const ev = testStore.GetEventPayload<{received: false}>("@@EVENTONE");

  expect(ev.received);
});
