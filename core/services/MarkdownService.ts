import type StickyNotesPlugin from "main";
import { TFile } from "obsidian";
import { LoggingService } from "./LogginService";

export class MarkdownService {
	plugin: StickyNotesPlugin;

	constructor(plugin: StickyNotesPlugin) {
		this.plugin = plugin;
	}

	async getFrontmatterAsync(
		file: TFile | null = null
	): Promise<Record<string, string>> {
		file = file ?? this.plugin.app.workspace.getActiveFile();
		if (!(file instanceof TFile)) {
			LoggingService.warn("No file is active to retrieve frontmatter");
			return {};
		}
		try {
			let curForntmatter =
				this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
			if (curForntmatter) return curForntmatter;

			await this.plugin.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, string>) => {
					curForntmatter = frontmatter;
				}
			);
			return curForntmatter ?? {};
		} catch (error) {
			LoggingService.warn("Failed to get frontmatter:", error);
			return {};
		}
	}

	async updateFrontmatterAsync(
		file: TFile | null = null,
		updates: Record<string, string>
	): Promise<boolean> {
		file = file ?? this.plugin.app.workspace.getActiveFile();
		if (!(file instanceof TFile)) {
			LoggingService.warn("No file is active to update frontmatter");
			return false;
		}
		try {
			await this.plugin.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, string>) => {
					for (const [key, value] of Object.entries(updates)) {
						frontmatter[key] = value;
					}
				}
			);
			return true;
		} catch (error) {
			LoggingService.warn("Failed to update frontmatter:", error);
			return false;
		}
	}
}
