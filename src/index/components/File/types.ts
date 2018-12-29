import { File } from "@app/index/global";

export class TableFile extends File {
    selected: boolean;

    constructor(f: File) {
        super();

        this.id = f.id;
        this.type = f.type;
        this.filename = f.filename;
        this.description = f.description;
        this.size = f.size;
        this.tags = f.tags;
        this.origin = f.origin;
        this.preview = f.preview;
        this.addTime = f.addTime;
        this.deleted = f.deleted;
        this.timeToDelete = f.timeToDelete;
        //
        this.selected = false;
    }
}
