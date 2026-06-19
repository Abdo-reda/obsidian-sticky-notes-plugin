import { Menu, MenuItem } from "obsidian";
import { type TFile } from "obsidian";
import { IBackgroundColor } from "core/interfaces/BackgroundColorInterface";
import { isLightTheme } from "core/utils/colorUtils";
import { StickyNoteLeaf } from "core/views/StickyNoteLeaf";

type ColorMenuItem = MenuItem & { dom: HTMLElement };

export class ColorMenu extends Menu {
	body: HTMLElement;
	dom: HTMLElement | undefined;
	items: ColorMenuItem[] = [];
	bgColors: IBackgroundColor[];
	rememberColors: boolean;
	updateFrontMatter: (
		file: TFile | null,
		updates: Record<string, string>,
	) => Promise<boolean>;

	constructor(
		body: HTMLElement,
		bgColors: IBackgroundColor[],
		rememberColors: boolean,
		updateFrontMatter: (
			file: TFile | null,
			updates: Record<string, string>,
		) => Promise<boolean>,
	) {
		super();
		this.body = body;
		this.bgColors = bgColors;
		this.rememberColors = rememberColors;

		this.updateFrontMatter = updateFrontMatter;
		this.addColorItems();
	}

	addColorItems() {
		for (const color of this.bgColors) {
			this.addItem((item) =>
				item
					.setTitle(color.value)
					.setIcon("circle")
					.onClick(() => {
						this.body.setCssProps({
							"--note-light-color": color.lightColor,
							"--note-dark-color": color.darkColor,
						});
						StickyNoteLeaf.lastNoteColor = color;
						if (this.rememberColors) {
							this.updateFrontMatter(null, {
								[color.property]: color.value,
							});
						}
					}),
			);
		}
	}

	override onload(): void {
		super.onload();
		this.dom?.addClass("color-menu");
		if (this.items.length === 0) return;
		this.items.forEach((item, i) => {
			const itemEl = item.dom;
			if (!itemEl) return;
			itemEl.addClass("color-menu-item");
			const itemIcon = itemEl.querySelector("svg");
			if (itemIcon) {
				const curColor = isLightTheme()
					? this.bgColors[i].lightColor
					: this.bgColors[i].darkColor;
				itemIcon.style.color = curColor;
				itemIcon.style.fill = curColor;
			}
		});
	}
}
