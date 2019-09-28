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

export interface IJsendResponse<T> {
    code: number;
    data: T;
    date: string;
    endpoint: string;
    message: string;
    status: WieldingEventStatus;
}
