export class Table {
    public dataList: any[];
    public headList: any[];
    public isScrollable: boolean;
    public sorting: boolean;
    public message: string;
    public pipeName: string;
    public pipeFormat: string;

    constructor() {
        this.dataList = [];
        this.headList = [];
        this.isScrollable = false;
        this.sorting = false;
        this.message = null;
        this.pipeName = null;
        this.pipeFormat = null;
    }
}
