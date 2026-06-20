import { Menu, type MenuItem } from "obsidian";
import { type TFile } from "obsidian";
import { type IBackgroundColor } from "core/interfaces/BackgroundColorInterface";
import { isLightTheme } from "core/utils/colorUtils";
import { StickyNoteLeaf } from "core/views/StickyNoteLeaf";

type ColorMenuItem = MenuItem & { dom: HTMLElement };

export class ColorMenu extends Menu {
	dom: HTMLElement | undefined;
	items: ColorMenuItem[] = [];
	bgColors: IBackgroundColor[];
	updateColor: (newColor: IBackgroundColor, file: TFile | null) => void;

	constructor(
		bgColors: IBackgroundColor[],
		updateColor: (newColor: IBackgroundColor, file: TFile | null) => void,
	) {
		super();
		this.bgColors = bgColors;
		this.updateColor = updateColor;
		this.addColorItems();
	}

	addColorItems() {
		for (const color of this.bgColors) {
			this.addItem((item) =>
				item
					.setTitle(color.value)
					.setIcon("circle")
					.onClick(() => {
						this.updateColor(color, null);
						StickyNoteLeaf.lastNoteColor = color;
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
