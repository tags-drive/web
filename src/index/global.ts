export class File {
    type: string = "file";
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
