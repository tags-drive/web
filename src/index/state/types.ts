export interface State {
    showDropLayer: boolean;
    selectMode: boolean;
    showModalWindow: boolean;
    settings: Settings;
}

export const ViewModes = {
    list: { text: "List", value: "list" },
    cards: { text: "Cards", value: "cards" }
};

export interface Settings {
    showDeletedFiles: boolean;
    viewMode: string;
}
