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
            entry: "src/login/index.ts",
            template: "public/login.html",
            filename: "login.html"
        },
        mobile: {
            entry: "src/mobile/index.ts",
            template: "public/mobile.html",
            filename: "mobile.html"
        }
    },
    configureWebpack: {
        devtool: "inline-eval-cheap-source-map",
        resolve: {
            alias: {
                "@app": path.resolve(__dirname, "src/"),
                "@components": path.resolve(__dirname, "src/index/components")
            }
        }
    }
};
