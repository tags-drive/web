export class FileExt {
    ext: string = "";
    fileType: string = "";
    supported: boolean = false;
    previewType: string = "";
}

export class File {
    id: number = 0;
    type: FileExt = new FileExt();
    filename: string = "";
    description: string = "";
    size: number = 0;
    tags: number[] = [];
    // Links
    origin: string = ""; // link
    preview: string = ""; // link
    //
    addTime: Date = new Date(); // UNIX time
    // Deleted info
    deleted: boolean = false;
    timeToDelete: number = 0; // UNIX time
}

export class Tag {
    name: string;
    color: string;
    group: string;

    constructor(n?: string, c?: string, g?: string) {
        this.name = n || "";
        this.color = c || "";
        this.group = g || "";
    }
}
