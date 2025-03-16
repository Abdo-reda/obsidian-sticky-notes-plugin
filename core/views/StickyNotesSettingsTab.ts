import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import type StickyNotesPlugin from "main";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import { SettingService } from "core/services/SettingService";

export class StickyNotesSettingsTab extends PluginSettingTab {
	settingService: SettingService;
	dimensionTextSetting: TextComponent;

	constructor(
		app: App,
		plugin: StickyNotesPlugin,
		settingService: SettingService
	) {
		super(app, plugin);
		this.settingService = settingService;
	}

	async display(): Promise<void> {
		this.containerEl.empty();

		if (!this.settingService.settings) {
			this.containerEl.createEl("p", {
				text: "falied-to-load-settings",
			});
			return;
		}

		this.addSizeSetting();
	}

	addSizeSetting() {
		return new Setting(this.containerEl)
			.setName("Default size")
			.setDesc(
				"Select what default size each new sticky note window should take."
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						Object.fromEntries(
							Object.values(SizeOptions).map((value) => [
								value,
								value,
							])
						)
					)
					.setValue(this.settingService.settings.sizeOption)
					.onChange(async (value) => {
						this.settingService.updateSettings({
							sizeOption: value as SizeOptions,
						});
						this.dimensionTextSetting?.setDisabled(
							value !== SizeOptions.CUSTOM
						);
						if (value === SizeOptions.DEFAULT) {
							this.settingService.updateWindowDimensions(
								300,
								300
							);
							this.dimensionTextSetting.setValue(
								this.settingService.settings.dimensions
							);
						}
					})
			)
			.addText((text) => {
				this.dimensionTextSetting = text
					.setPlaceholder("eg.: 300x300")
					.setValue(this.settingService.settings.dimensions)
					.onChange(async (value) => {
						let newDimensions = "300x300";
						if (value.trim() === "") {
							newDimensions = "300x300";
						} else if (value.match(/^\d+x\d+$/)) {
							newDimensions = value;
						} else {
							new Notice("Invalid number");
							return;
						}
						await this.settingService.updateSettings({
							dimensions: newDimensions,
						});
					})
					.setDisabled(this.settingService.settings.sizeOption !== SizeOptions.CUSTOM);
				return this.dimensionTextSetting;
			});
	}
}
