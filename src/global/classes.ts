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

export function ObjectToFile(obj: any, skipTimeParsing?: boolean): File | null {
    if (
        obj === undefined ||
        obj.id === undefined ||
        obj.type === undefined ||
        obj.filename === undefined ||
        obj.origin === undefined ||
        obj.description === undefined ||
        obj.size === undefined ||
        obj.tags === undefined ||
        obj.addTime === undefined ||
        // Preview can be omitted
        obj.deleted === undefined ||
        obj.timeToDelete === undefined
    ) {
        return null;
    }

    if (
        obj.type.ext === undefined ||
        obj.type.fileType === undefined ||
        obj.type.supported === undefined ||
        obj.type.previewType === undefined
    ) {
        return null;
    }

    let ext = new FileExt();
    ext.ext = obj.type.ext;
    ext.fileType = obj.type.fileType;
    ext.supported = obj.type.supported;
    ext.previewType = obj.type.previewType;

    let file: File = new File();
    file.id = <number>obj.id;
    file.type = ext;
    file.filename = <string>obj.filename;
    file.origin = <string>obj.origin;
    file.description = <string>obj.description;
    file.size = <number>obj.size;
    file.tags = <number[]>obj.tags;

    if (!skipTimeParsing) {
        file.addTime = new Date(obj.addTime);
    } else {
        file.addTime = obj.addTime || new Date();
    }

    file.preview = obj.preview ? <string>obj.preview : "";
    file.deleted = <boolean>obj.deleted;
    file.timeToDelete = <number>obj.timeToDelete;

    return file;
}

export class Tag {
    id: number;
    name: string;
    color: string;
    group: string;

    constructor(id?: number, n?: string, c?: string, g?: string) {
        this.id = id || 0;
        this.name = n || "";
        this.color = c || "";
        this.group = g || "";
    }
}

export function ObjectToTag(obj: any): Tag | null {
    if (obj === undefined || obj.id === undefined || obj.name === undefined || obj.color === undefined) {
        return null;
    }

    // Can be empty
    let group = "";
    if (obj.group !== undefined) {
        group = <string>obj.group;
    }

    return new Tag(<number>obj.id, <string>obj.name, <string>obj.color, group);
}

export class Group {
    name: string = "";
    tags: Tag[] = [];

    constructor(name: string, tags?: Tag[]) {
        this.name = name;

        if (tags !== undefined) {
            this.tags = tags;
        }
    }
}

// Name for group with ungrouped tags
const ungroupedTags = "Ungrouped tags";

function cloneTag(tag: Tag): Tag {
    let copy = new Tag();

    copy.id = tag.id;
    copy.name = tag.name;
    copy.color = tag.color;
    copy.group = tag.group;

    return copy;
}

export function TagsToGroups(tags: Map<number, Tag>): Group[] {
    let groups: Group[] = [];

    let addTagToGroups = (tag: Tag) => {
        // Clone the tag
        let t = cloneTag(tag);

        if (t.group == "") {
            t.group = ungroupedTags;
        }

        for (let i = 0; i < groups.length; i++) {
            if (groups[i].name == t.group) {
                groups[i].tags.push(t);
                return;
            }
        }

        // There's no group with such name
        let newGroup = new Group(t.group);
        newGroup.tags.push(t);
        groups.push(newGroup);
    };

    // Add tags
    tags.forEach(tag => {
        addTagToGroups(tag);
    });

    // Sort groups
    groups.sort((a, b) => {
        // Ungrouped tags must be last
        if (a.name === ungroupedTags) {
            return 1;
        }
        if (b.name === ungroupedTags) {
            return -1;
        }

        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return groups;
}
