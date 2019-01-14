import { IEvent } from './WieldingInterfaces';
import { WieldingStoreModel } from './WieldingStoreModel';

export enum WieldingStoreEvent {
    UPDATED = '@@store/UPDATED'
}

export interface IWielderStoreUpdate extends IEvent<WieldingStoreEvent.UPDATED, WieldingStoreModel> {}
