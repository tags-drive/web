class params {
	Host: string;
	
	constructor() {
		this.Host = process.env.VUE_APP_HOST == undefined ? "" : process.env.VUE_APP_HOST // It is "" when project is built
	}
};

export const Params = new params();