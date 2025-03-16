import { Notice, TFile } from "obsidian";

import StickyNotesPlugin from "main";

export const readDataOfVaultFiles = async (
	plugin: StickyNotesPlugin,
	filePath: string
): Promise<string> => {
	try {
		const file = plugin.app.vault.getAbstractFileByPath(filePath);
		if (file && file instanceof TFile) {
			const fileData = await plugin.app.vault.cachedRead(file);
			return fileData; // Return the raw content of the file
		} else {
			new Notice(`"File not found at path : ", ${filePath}`);
			throw `File not found at path: ${filePath}`;
		}
	} catch (error) {
		console.error("Error reading file from vault:", error);
		throw error;
	}
};

export const writeDataToVaultFiles = async (
	plugin: StickyNotesPlugin,
	filePath: string,
	newContent: string
): Promise<void> => {
	try {
		const file = plugin.app.vault.getAbstractFileByPath(filePath);
		if (file && file instanceof TFile) {
			await plugin.app.vault.modify(file, newContent);
		} else {
			new Notice(`"File not found at path : ", ${filePath}`);
		}
	} catch (error) {
		console.error("Error writing to file in vault:", error);
		throw error;
	}
};
