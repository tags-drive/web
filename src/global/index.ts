class params {
    Host: string;

    Version: string;

    constructor() {
        let host = process.env.VUE_APP_HOST;
        if (host === undefined) {
            host = "";
        }
        this.Host = host;

        let version = process.env.VUE_APP_VERSION;
        if (version === undefined) {
            version = "unknown";
        }
        this.Version = version;
    }
}

const Params = new params();

export { Params };
