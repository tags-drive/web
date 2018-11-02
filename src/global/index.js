export const Params = {
    Host: process.env.VUE_APP_HOST == undefined ? "" : process.env.VUE_APP_HOST // It is "" when project is built
};

export const Const = {
    sortType: {
        name: "name",
        size: "size",
        time: "time"
    },
    sortOrder: {
        asc: "asc",
        desc: "desc"
    },
    logType: {
        info: "info",
        error: "error"
    }
};
