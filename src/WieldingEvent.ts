import { deepCopy } from './Common';
import { IEvent } from './WieldingInterfaces';

export class WieldingEvent<T, X> implements IEvent<T, X> {
    public type: T;
    public payload: X;
    public updated: number;

    constructor(type: T, payload: X) {
        this.type = type;
        this.payload = deepCopy(payload);
        this.updated = new Date().getTime();
    }
}

