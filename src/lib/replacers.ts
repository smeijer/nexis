import { GitHubUser } from './github.js';

export type AppInfo = {
	name: string;
	description: string;
	version: string;
};

export function getReplacers({ app, author }: { app: AppInfo; author: GitHubUser }): [string, string][] {
	const replacerMap = {
		name: app.name.toLowerCase().replace(/\s/g, '-'),
		version: app.version,
		description: app.description,
		author: `${author.name} <${author.email}> (${author.blog})`,
		'author.name': author.name,
		'author.email': author.email,
		'author.homepage': author.blog,
		repository: `${author.login}/${app.name}`,
		funding_url: `https://github.com/${author.login}/${app.name}?sponsor=1`,
		issues_url: `https://github.com/${author.login}/${app.name}/issues`,
		homepage_url: `https://github.com/${author.login}/${app.name}#readme`,
	};

	return Object.entries(replacerMap)
		.filter(([_key, value]) => value)
		.map(([key, value]) => [`{{ ${key.toUpperCase()}}`, String(value)]);
}
