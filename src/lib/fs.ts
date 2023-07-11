import fs from 'fs/promises';

export async function editFile(path: string, callback: (content: string) => Promise<string> | string) {
	const content = await fs.readFile(path, 'utf-8').catch(() => '');
	const newContent = await callback(content);
	if (content === newContent) return;
	await fs.writeFile(path, newContent, 'utf-8');
}
