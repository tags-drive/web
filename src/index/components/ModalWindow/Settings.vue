<template>
	<div id="settings-window">
		<h2>Settings</h2>

		<div id="sections-wrapper">
			<div id="sections">
				<div
					v-for="(section, i) in sections"
					:key="i"
					class="section"
					@click="switchSection(section.key)"
					:class="{ 'chosen-section': section.key === currentSection }"
				>
					<div class="name">{{ section.name }}</div>
				</div>
			</div>

			<div id="content">
				<general-settings v-if="currentSection === 'general'"></general-settings>
			</div>
		</div>

		<!-- Info -->
		<div id="info">
			<span class="noselect">Tags Drive – <a href="https://github.com/tags-drive" target="_blank">github.com/tags-drive</a></span>

			<div id="versions">
				<span class="noselect version">Frontend version - {{ frontendVersion }}</span>

				<div id="separator"></div>

				<span class="noselect version">Backend version - {{ backendVersion }}</span>
			</div>
		</div>
	</div>
</template>


<style lang="scss" scoped>
#settings-window {
    width: 600px;

    h2 {
        margin: 0;
        margin-bottom: 15px;
    }

    > #sections-wrapper {
        $section-width: 150px;

        display: grid;
        grid-gap: 5px;
        grid-template-columns: $section-width auto;
        height: 250px;

        > #sections {
            z-index: 1;

            > .section {
                background-color: #88888810;
                border: 1px solid #88888840;
                cursor: pointer;
                height: 22px;
                line-height: 22px;
                margin-bottom: 5px;

                &:hover {
                    background-color: white;
                }

                > .name {
                    width: $section-width;
                }
            }

            > .chosen-section {
                background-color: white !important;
                border-right: none;
                width: $section-width + 5px;
            }
        }

        > #content {
            border: 1px solid #88888840;
        }
    }

    > #info {
        $height: 18px;

        font-size: 13px;
        margin: 30px auto 0;

        #versions {
            display: grid;
            grid-template-columns: 180px auto 180px;
            margin: 5px auto 0;
            text-align: center;
            width: 180px + 180px + 5px;

            .version {
                line-height: $height;
            }

            #separator {
                border-right: 1px solid #888888;
                height: $height;
                margin: auto;
                width: 1px;
            }
        }
    }
}
</style>


<script lang="ts">
import Vue from "vue";
// Components
import GeneralSettings from "./Settings/General.vue";
// Other
import { Version, Params } from "@app/global";
import { IsErrorStatusCode } from "@app/global/utils";

export default Vue.extend({
    components: {
        "general-settings": GeneralSettings
    },
    //
    data: function() {
        return {
            sections: [{ name: "General", key: "general" }, { name: "Share Access", key: "share" }],
            currentSection: "general",
            //
            frontendVersion: Version,
            backendVersion: "undefined"
        };
    },
    //
    created: function() {
        // Fetch backend version
        fetch(Params.Host + "/version", {
            method: "GET",
            credentials: "same-origin"
        }).then(resp => {
            if (IsErrorStatusCode(resp.status)) {
                return;
            }
            resp.text().then(version => {
                this.backendVersion = version;
            });
        });
    },
    methods: {
        switchSection: function(section: string) {
            this.currentSection = section;
        }
    }
});
</script>
