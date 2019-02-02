import { deepCopy } from './Common';
import { IEvent, IEventMap, IObserverMap, IRedumStore } from './WieldingInterfaces';

import { WieldingEvent } from './WieldingEvent';
import { WieldingObserver } from './WieldingObserver';
import { WieldingStoreEvent } from './WieldingStoreEvent';
import { WieldingStoreModel } from './WieldingStoreModel';



export class WieldingEventStore implements IRedumStore {

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

    public nameSpace(eventType: string) : string {
        return this.name + eventType;
    }


    public storeLocal(event: IEvent<any, any>): void {
        let storedEvents = localStorage.getItem('@@events');
        let eventArray = [];

        if (storedEvents) {
            eventArray = JSON.parse(storedEvents);
        }

        const nameSpacedEventType = this.nameSpace(event.type);

        if (eventArray.indexOf(nameSpacedEventType) < 0) {
            eventArray.push(nameSpacedEventType);
            storedEvents = JSON.stringify(eventArray);
            localStorage.setItem(this.name + '@@events', storedEvents);
        }

        // localStorage.setItem(event.type, btoa(JSON.stringify(event)));
        localStorage.setItem(nameSpacedEventType, JSON.stringify(event));
    }


    public SetDefaultEvent(event: IEvent<any, any>): void {
        const nameSpacedEventType = this.nameSpace(event.type);

        if (!this.events[nameSpacedEventType]) {
            this.storeLocal(event);
            this.events[nameSpacedEventType] = deepCopy(event);
        }
    }

    public AddObserver(callback: any, eventName: string, source = 'default', late = false): WieldingObserver {
        const nameSpacedEventType = this.nameSpace(eventName);

        if (!this.observers[nameSpacedEventType]) {
            this.observers[nameSpacedEventType] = [];
        }

        this.observers[nameSpacedEventType].unshift(new WieldingObserver(++this.id, callback, nameSpacedEventType, `${source}:${WieldingEventStore.instance.toString()}`));
        this.AddMessage(`Adding: ${source}:${nameSpacedEventType} id: ${this.observers[nameSpacedEventType][0].id}`);

        if (late) {
            if (this.events[nameSpacedEventType]) {
                callback(deepCopy(this.events[nameSpacedEventType]));
                this.AddMessage(`Late Dispatch: ${source}:${nameSpacedEventType}`);
            }
        }

        this.Dispatch(new WieldingEvent(WieldingStoreEvent.UPDATED, new WieldingStoreModel({
            name: this.name,
            updated: true
        })), false, false);

        return this.observers[nameSpacedEventType][0];
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
        const nameSpacedEventType = this.nameSpace(event.type);

        if (this.events[nameSpacedEventType]) {
            if (this.events[nameSpacedEventType].payload.status === 'FAIL') {
                return 9999999999;
            }
            const currentTime = new Date().getTime();
            const cachedEvent = this.events[nameSpacedEventType] as WieldingEvent<any, any>;

            return currentTime - cachedEvent.updated;
        }

        return 0;
    }

    public GetEvent(event: IEvent<any, any>): any {
        const nameSpacedEventType = this.nameSpace(event.type);

        if (this.events[nameSpacedEventType]) {
            return this.events[nameSpacedEventType];
        }

        return undefined;
    }

    public ReDispatch(event: IEvent<any, any>, reason: string): boolean {
        let foundObserver = false;
        const nameSpacedEventType = this.nameSpace(event.type);

        if (this.events[nameSpacedEventType]) {
            if (this.observers[nameSpacedEventType]) {
                for (const observer of this.observers[nameSpacedEventType]) {
                    if (observer.enabled) {
                        this.AddMessage(`Re-Dispatching (reason: ${reason}) : ${observer.type}:${observer.source} id: ${observer.id}`);
                        observer.callback(deepCopy(this.events[nameSpacedEventType]));
                        foundObserver = true;
                    }
                }
            }
        }

        if (!foundObserver) {
            this.AddMessage(`No Observers: ${nameSpacedEventType}`);
        }

        return foundObserver;
    }

    public Dispatch(event: IEvent<any, any>, persistent = true, notify = true): void {
        let foundObserver = false;
        const nameSpacedEventType = this.nameSpace(event.type);

        if (persistent) {
            this.storeLocal(event);
        }

        this.events[nameSpacedEventType] = deepCopy(event);
        if (this.observers[nameSpacedEventType]) {
            for (const observer of this.observers[nameSpacedEventType]) {
                if (observer.enabled) {
                    this.AddMessage(`Dispatching: ${observer.type}:${observer.source} id: ${observer.id}`);
                    observer.callback(deepCopy(this.events[nameSpacedEventType]));
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
            this.AddMessage(`No Observers: ${nameSpacedEventType}`);
        }
    }

    private loadFromLocal(): void {
        const storedEvents = localStorage.getItem(this.name + '@@events');

        if (storedEvents) {
            const eventTypes = JSON.parse(storedEvents);
            try {
                for (const type of eventTypes) {
                    const nameSpacedEventType = this.nameSpace(type);
                    // this.events[type] = JSON.parse(atob(localStorage.getItem(type)!));
                    this.events[nameSpacedEventType] = JSON.parse(localStorage.getItem(nameSpacedEventType)!);
                }
            } catch (e) {
                for (const type of eventTypes) {
                    const nameSpacedEventType = this.nameSpace(type);
                    delete (this.events[nameSpacedEventType]);
                }

                localStorage.clear();
            }
        }
    }

    private AddMessage(message: string): void {
        if (this.messages.length > 50) {
            if (this.messages.length > 50) {
                this.messages.splice(0, 1);
            }

            this.messages.push(message);
        }
    }
}