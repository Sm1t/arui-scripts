import type { AtRule, Plugin, PluginCreator, Rule } from 'postcss';

import { insertParsedCss, parseImport, parseMediaQuery, parseVariables } from './utils/utils';

type PluginOptions = {
    files?: string[];
};

const postCssGlobalData: PluginCreator<PluginOptions> = (opts?: PluginOptions) => {
	const options = {
        files: [],
        ...opts,
    };

    const parsedVariables: Record<string, string> = {};
    const parsedCustomMedia: Record<string, AtRule> = {};

    let rulesSelectors = new Set<Rule>();

    return {
        postcssPlugin: '@alfalab/postcss-global-data',
        prepare(): Plugin {
            return {
                postcssPlugin: '@alfalab/postcss-global-data',
                Once(root, postcssHelpers): void {
                    if (!Object.keys(parsedVariables).length) {
                        options.files.forEach((filePath) => {
                            const importedCss = parseImport(root, postcssHelpers, filePath);

                            parseVariables(importedCss, parsedVariables);
                            parseMediaQuery(importedCss, parsedCustomMedia);
                        });
                    }

                    const rootRule = insertParsedCss(root, parsedVariables, parsedCustomMedia);

                    root.append(rootRule);
                },
                OnceExit(): void {
                    rulesSelectors.forEach((rule) => {
                        rule.remove();
                    });
                    rulesSelectors = new Set<Rule>();
                },
            };
        },
    };
};

postCssGlobalData.postcss = true;

export { postCssGlobalData };