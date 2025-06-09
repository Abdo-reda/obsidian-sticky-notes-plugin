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
import { IBackgroundColor } from "core/interfaces/BackgroundColorInterface";
import {
	DEFAULT_COLOR_PROPERTY,
	DEFAULT_COLORS,
} from "core/constants/defaultColorSettings";
import { IPluginSettings } from "core/interfaces/PluginSettingsInterface";
import { getRandomHexColor, isLightTheme } from "core/utils/colorUtils";

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

		this.addSizeSettings();
		this.addColorSettings();
	}

	rerenderSettings() {
		this.display();
		//TODO: can be enhanced to only rerender the state of each element. instead of clearing the entire thing.
	}

	updateAndRerenderSettings(updatedSettings: Partial<IPluginSettings>) {
		this.settingService.updateSettings(updatedSettings);
		this.rerenderSettings();
	}

	addSizeSettings() {
		const sizeSettings = new Setting(this.containerEl)
			.setName("Size")
			.setHeading();
		this.addDimensionSetting(this.containerEl);
		this.addResizableSetting(this.containerEl);
	}

	addDimensionSetting(ele: HTMLElement) {
		return new Setting(ele)
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
						if (value === SizeOptions.DEFAULT) {
							this.settingService.updateWindowDimensions(
								300,
								300
							);
						} else if (value === SizeOptions.REMEMBER_LAST) {
							this.settingService.updateSettings({
								resizable: true,
							});
						}
						this.updateAndRerenderSettings({
							sizeOption: value as SizeOptions,
						});
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

	addResizableSetting(ele: HTMLElement) {
		return new Setting(ele)
			.setName("Resizable window")
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

	addColorSettings() {
		const colorSettings = new Setting(this.containerEl)
			.setName("Color")
			.setHeading();

		this.addRememberBackgroundColor(this.containerEl);
		this.addBackgroundColorSetting(this.containerEl);

		return colorSettings;
	}

	addRememberBackgroundColor(ele: HTMLElement) {
		return new Setting(ele)
			.setName("Remember background colors")
			.setDesc(
				"Background colors for sticky notes will be stored in the frontmatter of each note."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.settingService.settings.rememberBgColors)
					.onChange((value) => {
						this.updateAndRerenderSettings({
							rememberBgColors: value,
						});
					})
			);
	}

	addBackgroundColorSetting(ele: HTMLElement) {
		const bgSettings = new Setting(ele)
			.setName("Background colors")
			.setDesc(
				"Adjust sticky note background colors. The toggle determines the default color."
			)
			.addExtraButton((b) =>
				b.setIcon("rotate-ccw").onClick(() =>
					this.updateAndRerenderSettings({
						bgColors: structuredClone(DEFAULT_COLORS),
					})
				)
			)
			.addExtraButton((b) =>
				b.setIcon("plus").onClick(() => {
					const randomColor = getRandomHexColor();
					this.settingService.settings.bgColors.push({
						lightColor: randomColor,
						darkColor: randomColor,
						isDefault: false,
						property: DEFAULT_COLOR_PROPERTY,
						value: `Color ${
							this.settingService.settings.bgColors.length + 1
						}`,
					});
					this.updateAndRerenderSettings({});
				})
			);

		const colorContainer = new Setting(ele).setClass("bg-color-settings");
		const settingsContainer = colorContainer.settingEl.createDiv();
		this.settingService.settings.bgColors.forEach((bg) =>
			this.addSingleColorSetting(settingsContainer, bg)
		);

		return bgSettings;
	}

	addSingleColorSetting(ele: HTMLElement, bg: IBackgroundColor) {
		const colorSetting = new Setting(ele)
			.setClass("single-color-setting")
			.addColorPicker((c) =>
				c.setValue(isLightTheme() ? bg.lightColor :  bg.darkColor).onChange((v) => {
					if (isLightTheme()) {
                        bg.lightColor = v;
                    } else {
                        bg.darkColor = v;
                    }
					this.settingService.updateSettings({});
				})
			);

		const rememberColors = this.settingService.settings.rememberBgColors;

		if (rememberColors) {
            //TODO: add a suggestion box / autocomplete
			colorSetting.addText((propertyKey) =>
				propertyKey
					.setPlaceholder("property key")
					.setValue(bg.property)
					.onChange((v) => {
                        bg.property = v;
                        this.settingService.updateSettings({})
                    })
			);
		}

		colorSetting
			.addText((valueText) =>
				valueText
					.setPlaceholder(
						rememberColors ? "property value" : "color name"
					)
					.setValue(bg.value)
					.onChange((v) => {
						bg.value = v;
						this.settingService.updateSettings({});
					})
			)
			.addToggle((defaultToggle) =>
				defaultToggle
					.setValue(bg.isDefault)
					.onChange(() => {
						this.settingService.settings.bgColors.forEach(
							(b) => (b.isDefault = false)
						);
						bg.isDefault = true;
						this.updateAndRerenderSettings({});
					})
					.setDisabled(bg.isDefault)
			)
			.addExtraButton((deleteButton) =>
				deleteButton
					.setIcon("trash")
					.onClick(() => {
						this.settingService.settings.bgColors.remove(bg);
						this.updateAndRerenderSettings({});
					})
					.setDisabled(bg.isDefault)
			);
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
