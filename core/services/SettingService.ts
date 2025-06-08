import {
	DEFAULT_SETTINGS,
	IPluginSettings,
} from "core/interfaces/PluginSettingsInterface";

import { LoggingService } from "./LogginService";
import type StickyNotesPlugin from "main";

export class SettingService {
	plugin: StickyNotesPlugin;
	private _settings: IPluginSettings;

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
		LoggingService.info("Updated settings", this.updateSettings);
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

	getWindowDimensions() {
		return this._settings.dimensions.split("x").map(Number);
	}

	private async loadSettings() {
		this._settings = await Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData()
		);
		this.plugin.globalSettings = this._settings;
	}

	private async saveSettings() {
		await this.plugin.saveData(this._settings);
	}
}
