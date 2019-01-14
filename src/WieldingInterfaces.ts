import { WieldingEventStatus } from './WieldingEventStatus';

export interface IEvent<T, X> {
    type: T;
    payload: X;
}

export interface IObserver {
    callback: any;
    type: string;
    enabled: boolean;
    id: number;
    source: string;
}

export interface IObserverMap {
    [type: string]: IObserver[];
}

export interface IEventMap<T, X> {
    [type: string]: IEvent<T, X>;
}

export interface IRedumStore {
    Dispatch(action: IEvent<any, any>, persistent: boolean, notify: boolean): void;
}

export class JsendResponse<T> {
    public code?: number;
    public data?: T;
    public date?: string;
    public endpoint?: string;
    public message?: string;
    public status?: WieldingEventStatus;
}
