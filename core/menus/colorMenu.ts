import { Menu, MenuItem } from "obsidian";
import { type TFile } from "obsidian";
import { IBackgroundColor } from "core/interfaces/BackgroundColorInterface";

export class ColorMenu extends Menu {
	body: HTMLElement;
	items: MenuItem[] = [];
	bgColors: IBackgroundColor[];
	rememberColors: boolean;
	updateFrontMatter: (
		file: TFile | null,
		updates: Record<string, string>
	) => Promise<boolean>;

	constructor(
		body: HTMLElement,
		bgColors: IBackgroundColor[],
		rememberColors: boolean,
		updateFrontMatter: (
			file: TFile | null,
			updates: Record<string, string>
		) => Promise<boolean>
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
				this.items.push(
					item
						.setTitle(color.value)
						.setIcon("circle")
						.onClick(() => {
							this.body.setCssProps({
								"--background-primary": color.lightColor,
							});
							if (this.rememberColors) {
								this.updateFrontMatter(null, {
									[color.property]: color.value,
								});
							}
						})
				)
			);
		}
	}

	override onload(): void {
		super.onload();
		const menuContainer = this.body.querySelector(".menu-scroll");
		if (!menuContainer) return;
		menuContainer.addClass("color-menu");
		for (let i = 0; i < menuContainer.children.length; i++) {
			const itemMenu = menuContainer.children.item(i) as HTMLElement;
			itemMenu?.addClass("color-menu-item");
			const itemIcon = itemMenu?.querySelector("svg");
			if (itemIcon) {
				itemIcon.style.color = this.bgColors[i].lightColor;
				itemIcon.style.fill = this.bgColors[i].lightColor;
			}
		}
	}
}
