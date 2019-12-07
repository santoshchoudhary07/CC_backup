export class Table {
    public dataList: any[];
    public headList: any[];
    public isScrollable: boolean;
    public sorting: boolean;
    public message: string;

    constructor() {
        this.dataList = [];
        this.headList = [];
        this.isScrollable = false;
        this.sorting = false;
        this.message = null;
    }
}