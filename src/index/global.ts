export class File {
    filename: string = "";
    origin: string = ""; // link
    description: string = "";
    size: number = 0;
    tags: number[] = [];
    addTime: number = 0; // UNIX
    preview: string = ""; // link
}

export class Tag {
    name: string;
    color: string;

    constructor(n?: string, c?: string) {
        this.name = n || "";
        this.color = c || "";
    }
}
