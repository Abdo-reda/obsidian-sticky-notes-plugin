import {
	DEFAULT_SETTINGS,
	IPluginSettings,
} from "core/interfaces/PluginSettingsInterface";
import { LoggingService } from "./LogginService";
import type StickyNotesPlugin from "main";
import { type StickyNoteLeaf } from "core/views/StickyNoteLeaf";

export class SettingService {
	plugin: StickyNotesPlugin;
	private _settings!: IPluginSettings;

	constructor(plugin: StickyNotesPlugin) {
		this.plugin = plugin;
	}

	get settings(): Readonly<IPluginSettings> {
		return this._settings;
	}

	async initSettings() {
		await this.loadSettings();
	}

	async updateSettings(updatedSettings: Partial<IPluginSettings>) {
		LoggingService.info("Updated settings", updatedSettings);
		this._settings = {
			...this._settings,
			...updatedSettings,
		};
		await this.saveSettings();
	}

	async updateWindowDimensions(width: number, height: number) {
		const newDimensions = `${width}x${height}`;
		this.updateSettings({
			dimensions: newDimensions,
		});
	}

	async updateWorkspaceNotes(leafsList: Map<string, StickyNoteLeaf>) {
		const savedNotes = Array.from(leafsList.values()).map(l => ({
			id: l.leaf.id
		}));
		this.updateSettings({
			workspaceNotes: savedNotes
		})
	}

	getWindowDimensions() {
		return this._settings.dimensions.split("x").map(Number);
	}

	private async loadSettings() {
		this._settings = await Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData(),
		);
		this.plugin.globalSettings = this._settings;
	}

	private async saveSettings() {
		await this.plugin.saveData(this._settings);
	}
}
