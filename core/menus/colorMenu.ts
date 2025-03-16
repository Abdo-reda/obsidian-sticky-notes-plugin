import { Menu, MenuItem } from "obsidian";
import {
	readDataOfVaultFiles,
	writeDataToVaultFiles,
} from "core/services/MarkdownFileOperations";

import { BgColor } from "core/interfaces/PluginSettingsInterface";
import { SettingService } from "core/services/SettingService";
import StickyNotesPlugin from "main";
import { TFile } from "obsidian";
import { getColorTextClass } from "core/constants/colors";

export class ColorMenu extends Menu {
	body: HTMLElement;
	items: MenuItem[] = [];
	tempState = false;
	bgColors: BgColor[];
	settingService: SettingService;
	plugin: StickyNotesPlugin;
	file: TFile;

	constructor(
		body: HTMLElement,
		settingService: SettingService,
		file: TFile,
		plugin: StickyNotesPlugin
	) {
		super();
		this.body = body;
		this.bgColors = settingService.settings.bgColors;
		this.settingService = settingService;
		this.file = file;
		this.plugin = plugin;
		this.addColorItems();
	}

	addColorItems() {
		for (const color of this.bgColors) {
			this.addItem((item) =>
				this.items.push(
					item.setTitle(color.value).onClick(() => {
						this.body.setCssProps({
							"--background-primary": color.color,
						});
						this.updateFrontmatter(color);
					})
				)
			);
		}
	}

	async updateFrontmatter(selectedColor: { color: string; value: string }) {
		const filePath = this.file.path;
		const fileContent = await readDataOfVaultFiles(this.plugin, filePath);

		const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
		console.log("Frontmatter matched from regex", frontmatterMatch);
		let newFrontmatter = "";
		let restOfFile = fileContent;

		const colorProperty = this.settingService.settings.bgColors.find(
			(color) => color.color === selectedColor.color
		)?.property;

		if (colorProperty) {
			if (frontmatterMatch) {
				const rawFrontmatter = frontmatterMatch[1];
				const frontmatterLines = rawFrontmatter.split("\n");
				let propertyFound = false;

				newFrontmatter = frontmatterLines
					.map((line: string) => {
						if (line.startsWith(`${colorProperty}:`)) {
							propertyFound = true;
							return `${colorProperty}: ${selectedColor.value}`;
						}
						return line;
					})
					.join("\n");

				if (!propertyFound) {
					newFrontmatter += `\n${colorProperty}: ${selectedColor.value}`;
				}

				newFrontmatter = `---\n${newFrontmatter}\n---`;
				restOfFile = fileContent.slice(frontmatterMatch[0].length);
			} else {
				newFrontmatter = `---\n${colorProperty}: ${selectedColor.value}\n---`;
			}

			const newContent = `${newFrontmatter}${restOfFile}`;
			await writeDataToVaultFiles(this.plugin, filePath, newContent);
		}
	}
}
