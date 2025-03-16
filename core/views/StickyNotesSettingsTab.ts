import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";

import { SettingService } from "core/services/SettingService";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import type StickyNotesPlugin from "main";

export class StickyNotesSettingsTab extends PluginSettingTab {
	settingService: SettingService;
	dimensionTextSetting: TextComponent;
	windowSizeSettingContainer: HTMLElement;

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
		this.windowSizeSettingContainer = this.containerEl.createDiv({
			cls: "BgColorSettingContainer",
		});
		return new Setting(this.windowSizeSettingContainer)
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

						// TODO : This implementation is getting too complex, can be removed if feels unnecessary
						const stickyNotesResizables = document.querySelectorAll(
							".sticky-notes-resizable-setting"
						);
						// Show or hide the resizable setting
						if (
							value !== SizeOptions.REMEMBER_LAST &&
							!stickyNotesResizables.length
						) {
							this.addResizableSetting();
						} else if (value === SizeOptions.REMEMBER_LAST) {
							this.containerEl
								.querySelector(
									".sticky-notes-resizable-setting"
								)
								?.remove();
								this.settingService.settings.resizable = true;
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
					.setDisabled(
						this.settingService.settings.sizeOption !==
							SizeOptions.CUSTOM
					);
				return this.dimensionTextSetting;
			});
	}

	addResizableSetting() {
		return new Setting(
			this.windowSizeSettingContainer.createDiv(
				"sticky-notes-resizable-setting"
			)
		)
			.setName("Resizable Window")
			.setDesc("Enable or disable window resizing for new sticky notes.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.settingService.settings.resizable)
					.onChange(async (value) => {
						await this.settingService.updateSettings({
							resizable: value,
						});
					})
			);
	}
}
