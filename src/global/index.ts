class params {
    Host: string;

    constructor() {
        this.Host = process.env.VUE_APP_HOST === undefined ? "" : process.env.VUE_APP_HOST; // It is "" when project is built
    }
}

const Version = "v0.5.2";
const Params = new params();

export { Params, Version };
