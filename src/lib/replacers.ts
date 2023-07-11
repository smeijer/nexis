import { GitHubUser } from './github.js';

export type AppInfo = {
	name: string;
	description: string;
	version: string;
};

export function getReplacers({ app, author }: { app: AppInfo; author: GitHubUser }) {
	return {
		NAME: app.name,
		VERSION: app.version,
		DESCRIPTION: app.description,
		APP_NAME: app.name,
		APP_VERSION: app.version,
		APP_DESCRIPTION: app.description,
		AUTHOR: `${author.name} <${author.email}> (${author.homepage})`,
		AUTHOR_NAME: author.name,
		AUTHOR_EMAIL: author.email,
		AUTHOR_HOMEPAGE: author.homepage,
		REPOSITORY: `${author.login}/${app.name}`,
		FUNDING_URL: `https://github.com/${author.login}/${app.name}?sponsor=1`,
		ISSUES_URL: `https://github.com/${author.login}/${app.name}/issues`,
		HOMEPAGE_URL: `https://github.com/${author.login}/${app.name}#readme`,
	} as const;
}
