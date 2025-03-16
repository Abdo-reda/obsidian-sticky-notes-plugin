import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";

import { BgColor } from "core/interfaces/PluginSettingsInterface";
import Pickr from "@simonwep/pickr";
import { SettingService } from "core/services/SettingService";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import Sortable from "sortablejs";
import type StickyNotesPlugin from "main";

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
		this.addBgColorSetting();
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
					.setDisabled(
						this.settingService.settings.sizeOption !==
							SizeOptions.CUSTOM
					);
				return this.dimensionTextSetting;
			});
	}

	addBgColorSetting() {
		const bgColors = this.settingService.settings.bgColors;
		const bgContainer = this.containerEl.createDiv({
			cls: "BgColorSettingContainer",
		});
		new Setting(this.containerEl)
			.setName("Automatic background colors")
			.setDesc(
				"Set the background colors for a corresponding YAML property-value pair to get dynamic colors. Change the order to give them priority. Top-most color will be used as the default color."
			);
		Sortable.create(bgContainer, {
			animation: 150,
			ghostClass: "sticky-note-sortable-ghost",
			chosenClass: "sticky-note-sortable-chosen",
			dragClass: "sticky-note-sortable-drag",
			dragoverBubble: true,
			forceFallback: true,
			fallbackClass: "sticky-note-sortable-fallback",
			easing: "cubic-bezier(1, 0, 0, 1)",
			onSort: async () => {
				const newOrder = Array.from(bgContainer.children)
					.map((child, index) => {
						const propertyName =
							child.getAttribute("data-property-name");
						const valueName = child.getAttribute("data-value-name");

						const tag = this.settingService.settings.bgColors.find(
							(t) =>
								t.property.toString() === propertyName &&
								t.value.toString() === valueName
						);

						if (tag) {
							tag.order = index + 1;
							return tag;
						}
						return null;
					})
					.filter((tag): tag is BgColor => tag !== null);

				await this.settingService.updateSettings(
					this.settingService.settings
				);
			},
		});

		// Render existing tags
		this.settingService.settings.bgColors
			.sort((a, b) => a.order - b.order)
			.forEach((tag, index) => {
				const row = bgContainer.createDiv({
					cls: "sticky-note-bg-color-container-tag-row",
					attr: {
						"data-property-name": tag.property,
						"data-value-name": tag.value,
					},
				});
				// row.style.backgroundColor = tag.color;

				let rgbaInput: any;
				new Setting(row)
					.setClass("sticky-note-bg-color-container-tag-row-element")
					.addButton((drag) =>
						drag
							.setTooltip("Hold and drag")
							.setIcon("grip-horizontal")
							.buttonEl.setCssStyles({
								backgroundColor: tag.color,
							})
					)
					.addText((text) =>
						text
							.setPlaceholder("Property")
							.setValue(tag.property)
							.onChange(async (value) => {
								tag.property = value;
								row.setAttribute(
									"data-property-name",
									tag.property
								);
								await this.settingService.updateSettings(
									this.settingService.settings
								);
							})
							.inputEl.setCssStyles({
								backgroundColor: tag.color,
							})
					)
					.addText((text) =>
						text
							.setPlaceholder("Value")
							.setValue(tag.value)
							.onChange(async (value) => {
								tag.value = value;
								row.setAttribute("data-value-name", tag.value);
								await this.settingService.updateSettings(
									this.settingService.settings
								);
							})
							.inputEl.setCssStyles({
								backgroundColor: tag.color,
							})
					)
					.addText((input) => {
						rgbaInput = input;
						input
							.setPlaceholder("RGBA Color")
							.setValue(tag.color)
							.onChange(async (value) => {
								tag.color = value;
								row.setAttribute(
									"data-tag-color",
									"notes-explorer-tag-color-data"
								);
								row.style.backgroundColor = value;
								await this.settingService.updateSettings(
									this.settingService.settings
								);
							});
						input.inputEl.setCssStyles({
							backgroundColor: tag.color,
							width: "100%",
						});
					})
					.addButton((button) => {
						const pickr = new Pickr({
							el: button.buttonEl,
							theme: "nano",
							default: tag.color || "rgba(255, 0, 0, 1)", // Default alpha to 1
							components: {
								preview: true,
								opacity: true,
								hue: true,
								interaction: {
									rgba: true,
									input: true,
									clear: true,
									cancel: true,
									save: false,
								},
							},
						});

						pickr
							.on("change", (color: any) => {
								const rgbaColor = `rgba(${color
									.toRGBA()
									.map((value: any, index: number) =>
										index < 3 ? Math.round(value) : value
									)
									.join(", ")})`; // Construct valid rgba format
								tag.color = rgbaColor;
								row.style.backgroundColor = rgbaColor;
								rgbaInput.setValue(rgbaColor);
							})
							// .on("save", (color: any) => {
							//   pickr.hide();
							//   const rgbaColor = `rgba(${color
							//     .toRGBA()
							//     .map((value: number, index: number) =>
							//       index < 3 ? Math.round(value) : value
							//     )
							//     .join(", ")})`; // Construct valid rgba format
							//   tag.color = rgbaColor;
							//   row.style.backgroundColor = rgbaColor;
							//   rgbaInput.setValue(rgbaColor);
							//   this.settingService.saveSettings(this.settingService.settings);
							// })
							.on("cancel", () => {
								pickr.hide(); // Close the picker when cancel is pressed
							});

						pickr.on("clear", () => pickr.hide());
					})

					.addButton((deleteButton) =>
						deleteButton
							.setButtonText("Delete")
							.setIcon("trash")
							.setCta()
							.onClick(async () => {
								this.settingService.settings.bgColors.splice(
									index,
									1
								);
								await this.settingService.updateSettings(
									this.settingService.settings
								);
								this.display();
							})
					);
			});
	}
}
