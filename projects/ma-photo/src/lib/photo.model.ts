export class PhotoModel {
    public string: string;
    public varbinary: string;
    public active: boolean;

    constructor() {
        this.string = null;
        this.varbinary = null;
        this.active = true;
    }
}

export class Photos extends PhotoModel {
    expanded: boolean;
    rotationIndex: number;
}
