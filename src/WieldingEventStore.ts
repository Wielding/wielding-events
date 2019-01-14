import { deepCopy } from './Common';
import { IEvent, IEventMap, IObserverMap, IRedumStore } from './WieldingInterfaces';

import { WieldingEvent } from './WieldingEvent';
import { WieldingObserver } from './WieldingObserver';
import { WieldingStoreEvent } from './WieldingStoreEvent';
import { WieldingStoreModel } from './WieldingStoreModel';



export class WieldingEventStore implements IRedumStore {

    public static storeLocal(event: IEvent<any, any>): void {
        let storedEvents = localStorage.getItem('@@events');
        let eventArray = [];

        if (storedEvents) {
            eventArray = JSON.parse(storedEvents);
        }

        if (eventArray.indexOf(event.type) < 0) {
            eventArray.push(event.type);
            storedEvents = JSON.stringify(eventArray);
            localStorage.setItem('@@events', storedEvents);
        }

        // localStorage.setItem(event.type, btoa(JSON.stringify(event)));
        localStorage.setItem(event.type, JSON.stringify(event));
    }
    private static instance = 0;

    public name: string;

    private readonly observers: IObserverMap = {};
    private readonly events: IEventMap<any, any> = {};
    private id = 0;
    private messages: string[] = [];

    constructor(name: string) {
        this.name = name;
        WieldingEventStore.instance += 1;
        this.loadFromLocal();
    }

    public SetDefaultEvent(event: IEvent<any, any>): void {
        if (!this.events[event.type]) {
            WieldingEventStore.storeLocal(event);
            this.events[event.type] = deepCopy(event);
        }
    }

    public AddObserver(callback: any, event: string, source = 'default', late = false): WieldingObserver {
        if (!this.observers[event]) {
            this.observers[event] = [];
        }

        this.observers[event].unshift(new WieldingObserver(++this.id, callback, event, `${source}:${WieldingEventStore.instance.toString()}`));
        this.AddMessage(`Adding: ${source}:${event} id: ${this.observers[event][0].id}`);

        if (late) {
            if (this.events[event]) {
                callback(deepCopy(this.events[event]));
                this.AddMessage(`Late Dispatch: ${source}:${event}`);
            }
        }

        this.Dispatch(new WieldingEvent(WieldingStoreEvent.UPDATED, new WieldingStoreModel({
            name: this.name,
            updated: true
        })), false, false);

        return this.observers[event][0];
    }

    public RemoveObserver(observer: WieldingObserver): void {
        let continueLooking = true;

        if (observer === undefined) {
            return;
        }
        this.AddMessage(`Removing: ${observer.source} id: ${observer.id}`);
        if (this.observers[observer.type]) {
            const length = this.observers[observer.type].length;
            for (let idx = 0; idx < length && continueLooking; idx++) {
                if (this.observers[observer.type][idx].id === observer.id) {
                    continueLooking = false;
                    this.observers[observer.type].splice(idx, 1);
                }
            }

            this.Dispatch(new WieldingEvent(WieldingStoreEvent.UPDATED, new WieldingStoreModel({
                name: this.name,
                updated: true
            })), false, false);
        }
    }

    public GetEventAge(event: IEvent<any, any>): number {
        if (this.events[event.type]) {
            if (this.events[event.type].payload.status === 'FAIL') {
                return 9999999999;
            }
            const currentTime = new Date().getTime();
            const cachedEvent = this.events[event.type] as WieldingEvent<any, any>;

            return currentTime - cachedEvent.updated;
        }

        return 0;
    }

    public GetEvent(event: IEvent<any, any>): any {
        if (this.events[event.type]) {
            return this.events[event.type];
        }

        return undefined;
    }

    public ReDispatch(event: IEvent<any, any>, reason: string): boolean {
        let foundObserver = false;

        if (this.events[event.type]) {
            if (this.observers[event.type]) {
                for (const observer of this.observers[event.type]) {
                    if (observer.enabled) {
                        this.AddMessage(`Re-Dispatching (reason: ${reason}) : ${observer.type}:${observer.source} id: ${observer.id}`);
                        observer.callback(deepCopy(this.events[event.type]));
                        foundObserver = true;
                    }
                }
            }
        }

        if (!foundObserver) {
            this.AddMessage(`No Observers: ${event.type}`);
        }

        return foundObserver;
    }

    public Dispatch(event: IEvent<any, any>, persistent = true, notify = true): void {
        let foundObserver = false;

        if (persistent) {
            WieldingEventStore.storeLocal(event);
        }

        this.events[event.type] = deepCopy(event);
        if (this.observers[event.type]) {
            for (const observer of this.observers[event.type]) {
                if (observer.enabled) {
                    this.AddMessage(`Dispatching: ${observer.type}:${observer.source} id: ${observer.id}`);
                    observer.callback(deepCopy(this.events[event.type]));
                    foundObserver = true;
                }
            }
        }

        if (notify) {
            this.Dispatch(new WieldingEvent(WieldingStoreEvent.UPDATED, new WieldingStoreModel({
                name: this.name,
                updated: true
            })), false, false);
        }

        if (!foundObserver) {
            this.AddMessage(`No Observers: ${event.type}`);
        }
    }

    private loadFromLocal(): void {
        const storedEvents = localStorage.getItem('@@events');

        if (storedEvents) {
            const eventTypes = JSON.parse(storedEvents);
            try {
                for (const type of eventTypes) {
                    // this.events[type] = JSON.parse(atob(localStorage.getItem(type)!));
                    this.events[type] = JSON.parse(localStorage.getItem(type)!);
                }
            } catch (e) {
                for (const type of eventTypes) {
                    delete (this.events[type]);
                }

                localStorage.clear();
            }
        }
    }

    private AddMessage(message: string): void {
        if (this.messages.length > 50) {
            this.messages.splice(0, 1);
        }

        this.messages.push(message);
    }
}
