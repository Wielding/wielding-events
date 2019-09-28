import {WieldingEventStatus} from "./WieldingEventStatus";
import {IJsendResponse} from "./WieldingInterfaces";

export class JSendResponse<T> implements IJsendResponse<T> {
    public code: number;
    public data: T;
    public date: string;
    public endpoint: string;
    public message: string;
    public status: WieldingEventStatus;


    constructor() {
        this.code = 0;
        this.data = {} as T;
        this.date = "";
        this.endpoint = "";
        this.message = "";
        this.status = WieldingEventStatus.UNKNOWN;

    }
}
