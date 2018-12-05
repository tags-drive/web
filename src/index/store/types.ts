import { Tag, File } from "../global";

export interface Store {
    allFiles: File[];
    allTags: Map<number, Tag>;
	selectedFiles: File[];
	//
	filesReady: boolean;
	tagsReady: boolean;
}
