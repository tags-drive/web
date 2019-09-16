export interface State {
    user: User;
    shareMode: boolean;
    shareToken: string;

    settings: Settings;

    showDropLayer: boolean;
    selectMode: boolean;
    showModalWindow: boolean;
    showPreviewWindow: boolean;
}

export interface User {
    authorized: boolean;
}

export interface Settings {
    showDeletedFiles: boolean;
    viewMode: string;
}

export const ViewModes = {
    list: { text: "List", value: "list" },
    cards: { text: "Cards", value: "cards" }
};
