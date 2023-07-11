import { raise } from './raise.js';

export type GitHubUser = {
	login: string;
	homepage: string;
	name: string;
	email: string;
};

export async function getGitHubUser(): Promise<GitHubUser> {
	raise(process.env['GITHUB_TOKEN'], 'Please set the GITHUB_TOKEN environment variable');

	return fetch('https://api.github.com/user', {
		headers: {
			Authorization: `token ${process.env['GITHUB_TOKEN']}`,
		},
	})
		.then((x) => x.json())
		.then((user: GitHubUser & { blog?: string }) => ({
			login: String(user.login),
			homepage: String(user.blog ?? ''),
			name: String(user.name),
			email: String(user.email),
		}));
}

export async function createGitHubRepo(repo: { name: string; description: string }): Promise<void> {
	raise(process.env['GITHUB_TOKEN'], 'Please set the GITHUB_TOKEN environment variable');

	const result = await fetch(`https://api.github.com/user/repos`, {
		method: 'POST',
		headers: {
			Authorization: `token ${process.env['GITHUB_TOKEN']}`,
		},
		body: JSON.stringify({
			name: repo.name,
			description: repo.description,
			// homepage: 'https://github.com',
			private: false,
			has_issues: true,
			has_projects: false,
			has_wiki: false,
		}),
	});

	raise(result.ok, `Failed to create GitHub repo: ${result.statusText}`);
}
