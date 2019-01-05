export interface State {
    showDropLayer: boolean;
    selectMode: boolean;
    showModalWindow: boolean;
    settings: Settings;
}

export interface Settings {
    showDeletedFiles: boolean;
    scrollOffset: number;
}
