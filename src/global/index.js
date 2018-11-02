export const Params = {
    Host: process.env.VUE_APP_HOST == undefined ? "" : process.env.VUE_APP_HOST
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
