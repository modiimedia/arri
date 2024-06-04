import { defineCommand } from "citty";

import { getArriPackageMetadata, logger } from "../common";

export default defineCommand({
    meta: {
        name: "List",
        description: "List the available arri versions",
    },
    args: {
        tags: {
            type: "boolean",
            default: false,
            description: "List available tags",
        },
    },
    async run({ args }) {
        const arriInfo = await getArriPackageMetadata();
        if (args.tags) {
            const output = Object.keys(arriInfo["dist-tags"]).map(
                (tag) => `- ${tag} (${arriInfo["dist-tags"][tag]})`,
            );
            logger.log(output.join("\n"));
            return;
        }
        const tagMap: Record<string, string> = {};
        for (const key of Object.keys(arriInfo["dist-tags"])) {
            const version = arriInfo["dist-tags"][key]!;
            tagMap[version] = key;
        }
        const output = Object.keys(arriInfo.versions).map((version) => {
            const tag = tagMap[version];
            if (tag) {
                return `- ${version} (${tag})`;
            }
            return `- ${version}`;
        });
        logger.log(output.join("\n"));
    },
});
