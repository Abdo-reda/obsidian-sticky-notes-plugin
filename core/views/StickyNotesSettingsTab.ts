import {
	App,
	PluginSettingTab,
	Setting,
	TextComponent,
	ToggleComponent,
	ValueComponent,
} from "obsidian";

import { SettingService } from "core/services/SettingService";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import type StickyNotesPlugin from "main";

export class StickyNotesSettingsTab extends PluginSettingTab {
	settingService: SettingService;
	dimensionsSettingComponent: TextComponent;
	resizableSettingComponent: ToggleComponent;

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
		this.addResizableSetting();
	}

	addSizeSetting() {
		return new Setting(this.containerEl)
			.setName("Default size")
			.setDesc(
				"Select what default size each new sticky note window should take. Make sure its in the correct format e.g (width x height)"
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
						this.disabledDimensionSetting(value !== SizeOptions.CUSTOM)
						if (value === SizeOptions.DEFAULT) {
							this.settingService.updateWindowDimensions(
								300,
								300
							);
							this.dimensionsSettingComponent.setValue(
								this.settingService.settings.dimensions
							);
						}
						if (value === SizeOptions.REMEMBER_LAST) {
							this.settingService.updateSettings({
								resizable: true,
							});
							this.resizableSettingComponent.setValue(true);
							this.disabledResizableSetting(true);
						} else {
							this.disabledResizableSetting(false);
						}
					})
			)
			.addText((text) => {
				this.dimensionsSettingComponent = text
					.setPlaceholder("eg.: 300x300")
					.setValue(this.settingService.settings.dimensions)
					.onChange(async (value) => {
						let newDimensions = "300x300";
						if (value.trim() === "") {
							newDimensions = "300x300";
						} else if (value.match(/^\d+x\d+$/)) {
							newDimensions = value;
						} else {
							return;
						}
						await this.settingService.updateSettings({
							dimensions: newDimensions,
						});
					});
				this.disabledDimensionSetting(
					this.settingService.settings.sizeOption !==
						SizeOptions.CUSTOM
				);
				return this.dimensionsSettingComponent;
			});
	}

	addResizableSetting() {
		return new Setting(this.containerEl)
			.setName("Resizable Window")
			.setDesc("Enable or disable window resizing for new sticky notes.")
			.addToggle((toggle) => {
				this.resizableSettingComponent = toggle
					.setValue(
						this.settingService.settings.resizable ||
							this.settingService.settings.sizeOption ===
								SizeOptions.REMEMBER_LAST
					)
					.onChange(async (value) => {
						await this.settingService.updateSettings({
							resizable: value,
						});
					});

				this.disabledResizableSetting(
					this.settingService.settings.sizeOption ===
						SizeOptions.REMEMBER_LAST
				);
				return this.resizableSettingComponent;
			});
	}

	disabledDimensionSetting(value: boolean) {
		if (!this.dimensionsSettingComponent) return;
		this.disableSettingComponent(
			this.dimensionsSettingComponent,
			this.dimensionsSettingComponent.inputEl,
			value
		);
	}

	disabledResizableSetting(value: boolean) {
		if (!this.resizableSettingComponent) return;
		this.disableSettingComponent(
			this.resizableSettingComponent,
			this.resizableSettingComponent.toggleEl,
			value
		);
	}

	disableSettingComponent<T>(
		settingComponent: ValueComponent<T>,
		inputEl: HTMLElement,
		value: boolean
	): ValueComponent<T> {
		settingComponent.setDisabled(value);
		if (value) {
			inputEl.addClass("disabled-setting");
		} else {
			inputEl.removeClass("disabled-setting");
		}
		return settingComponent;
	}
}
