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
    addTime: string = ""; // UNIX time
    // Deleted info
    deleted: boolean = false;
    timeToDelete: number = 0; // UNIX time
}

export class Tag {
    name: string;
    color: string;

    constructor(n?: string, c?: string) {
        this.name = n || "";
        this.color = c || "";
    }
}
