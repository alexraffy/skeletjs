

export class Asset {
    id: string;
    isNew: boolean;
    path: string;
    format: string;
    title: string;
    b64Prefix?: string;
    data?: Uint8Array;
    currentPath?: string;
    children: Asset[]
    mime?: string;
    constructor() {
        this.id = "";
        this.isNew = true;
        this.path = "";
        this.format = "";
        this.title = "";
        this.b64Prefix = undefined;
        this.data = undefined;
        this.currentPath = undefined;
        this.children = [];
    }
}