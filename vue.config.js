const path = require("path");

module.exports = {
    assetsDir: "static",
    pages: {
        index: {
            entry: "src/index/index.ts",
            template: "public/index.html",
            filename: "index.html"
        },
        login: {
            entry: "src/login/index.js",
            template: "public/login.html",
            filename: "login.html"
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                "@app": path.resolve(__dirname, "src/"),
                "@components": path.resolve(__dirname, "src/index/components")
            }
        }
    }
};
