export interface IWieldingStoreModel {
    updated?: boolean;
    name?: string;
}

export class WieldingStoreModel implements IWieldingStoreModel {
    public updated: boolean;
    public name: string;

    constructor(params: IWieldingStoreModel = {}) {
        this.updated = params.updated!;
        this.name = params.name!;
    }
}
