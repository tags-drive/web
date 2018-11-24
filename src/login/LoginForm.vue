<template>
	<div id="login-form">
		<div v-if="isError">
			<div id="error-msg">
				<b><span style="font-size: 20px;">Error: </span></b>{{errorMsg}}
			</div>
		</div>
		<p></p>
		<input type="text" v-model="login" placeholder="Login">
		<p></p>
		<input type="password" v-model="password" placeholder="Password">
		<p></p>
		<input type="button" @click="auth" value="Submit">
	</div>
</template>

<style scoped>
input {
    font-size: 16px;
    outline-color: #88888888;
    width: 70%;
}

input[type="button"] {
    background-color: #88888862;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    height: 30px;
    width: 80px;
}

input[type="button"]:hover {
    background-color: #88888888;
}

#login-form {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0px 10px 10px 9px #888888a2;
    margin-top: 50px;
    margin: auto;
    padding: 20px;
    text-align: center;
    width: 40%;
}

#error-msg {
    background-color: rgba(255, 161, 161, 0.883);
    border: 1.5px rgba(255, 0, 0, 0.65) solid;
    border-radius: 5px;
    height: 30px;
    line-height: 30px;
    padding: 3px;
}
</style>

<script>
import { Params } from "../global";
import { sha256 } from "js-sha256";

export default {
    data: function() {
        return {
            login: "",
            password: "",
            isError: false,
            errorMsg: ""
        };
    },
    methods: {
        fail: function(error) {
            setTimeout(() => {
                this.errorMsg = error;
                this.isError = true;
                this.password = "";
            }, 700);
        },
        auth: function() {
            this.isError = false;

            // 11 times
            var hash = sha256(this.password);
            for (var i = 0; i < 10; i++) {
                hash = sha256(hash);
            }

            const params = new URLSearchParams();
            params.append("login", this.login);
            params.append("password", hash);

            fetch(Params.Host + "/login", {
                method: "POST",
                body: params,
                credentials: "same-origin" // for set cookie
            })
                .then(data => {
                    // Valid login and password
                    if (data.status == 200) {
                        window.location.href = "/";
                    }

                    data.text().then(msg => this.fail(msg));
                })
                .catch(err => this.fail(err));
        }
    }
};
</script>

