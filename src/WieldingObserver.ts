import { IObserver } from './WieldingInterfaces';

export class WieldingObserver implements IObserver {
    public callback: any;
    public type: string;
    public enabled: boolean;
    public id: number;
    public source: string;

    constructor(id: number, callback: any, type: string, source = 'default') {
        this.callback = callback;
        this.type = type;
        this.enabled = true;
        this.id = id;
        this.source = source;
    }
}
