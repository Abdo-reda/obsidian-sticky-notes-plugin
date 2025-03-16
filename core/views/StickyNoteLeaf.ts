import {
	ItemView,
	Menu,
	TFile,
	View,
	WorkspaceLeaf,
	setIcon,
	setTooltip,
} from "obsidian";

import { BrowserWindow } from "@electron/remote";
import { ColorMenu } from "core/menus/colorMenu";
import { LoggingService } from "core/services/LogginService";
import { SettingService } from "core/services/SettingService";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import StickyNotesPlugin from "main";

export class StickyNoteLeaf {
	private static stickyNoteId = 0;
	public static leafsList = new Set<StickyNoteLeaf>();
	private settingService: SettingService;

	id: number;
	leaf: WorkspaceLeaf;
	view: View;
	document: Document;
	mainWindow: Electron.BrowserWindow | undefined;
	colorMenu: ColorMenu;
	plugin: StickyNotesPlugin;
	file: TFile;

	constructor(
		leaf: WorkspaceLeaf,
		settingService: SettingService,
		plugin: StickyNotesPlugin,
		file: TFile
	) {
		this.leaf = leaf;
		this.plugin = plugin;
		this.file = file;
		this.settingService = settingService;
		this.view = leaf.view;
		this.document = this.leaf.getContainer().win.activeDocument;
		this.id = StickyNoteLeaf.stickyNoteId;
		StickyNoteLeaf.stickyNoteId++;
		StickyNoteLeaf.leafsList.add(this);
	}

	get title() {
		return `sticky-note-${this.id}`;
	}

	async initStickyNote(file: TFile | null = null) {
		LoggingService.info(`Init Sticky Note ${this.id} ...`);
		this.document.title = this.title;
		this.document.documentElement.setAttribute("note-id", this.title);
		this.initColorMenu();
		this.initView();
		this.initMainWindow();
		if (file) await this.leaf.openFile(file);
	}

	initView() {
		LoggingService.info("Updating Sticky Note view");
		this.view = this.leaf.view;
		this.removeDefaultActionsMenu();
		this.removeHeader();
		this.addStickyNoteActions();
	}

	private initMainWindow() {
		const windows = BrowserWindow.getAllWindows();
		const mainWindow = windows.find((w) => w.title === this.title);
		if (!mainWindow) {
			LoggingService.warn(
				`Sticky note ${this.title} does not have an electron window`
			);
			return;
		}

		this.mainWindow = mainWindow;

		const [width, height] = this.settingService.getWindowDimensions();
		this.mainWindow.setSize(width, height);
		this.mainWindow.setResizable(true);

		if (
			this.settingService.settings.sizeOption ===
			SizeOptions.REMEMBER_LAST
		) {
			this.mainWindow.on("resize", () => this.saveDimensions());
		}

		this.pinAction(true);
	}

	private saveDimensions() {
		if (!this.mainWindow) return;
		const [width, height] = this.mainWindow.getSize();
		this.settingService.updateWindowDimensions(width, height);
	}

	private removeDefaultActionsMenu() {
		const actionsEl = this.view.containerEl.querySelector(".view-actions");
		const leftActionsEl =
			this.view.containerEl.querySelector(".view-header-left");
		actionsEl?.empty();
		leftActionsEl?.empty();
	}

	private removeHeader() {
		const headerEl = this.document.querySelector(
			".workspace-tab-header-container"
		);
		const titleEl = this.document.querySelector(".titlebar");
		headerEl?.remove();
		titleEl?.empty();
	}

	private addStickyNoteActions() {
		if (!(this.view instanceof ItemView)) return;
		const headerContainerEl = this.document.querySelector<HTMLElement>(
			".view-header-title-container"
		);
		headerContainerEl?.setCssProps({
			"app-region": "drag",
			"-webkit-app-region": "drag",
		});
		this.view
			.addAction("x", "Close", () => this.leaf.detach())
			.addClass("sticky-note-button");
		this.view
			.addAction("minus", "Minimize", () => this.mainWindow?.minimize())
			.addClass("sticky-note-button");
		this.view
			.addAction(
				this.mainWindow?.isAlwaysOnTop() ? "pin-off" : "pin",
				"Pin",
				() => this.pinAction()
			)
			.addClasses(["pinButton", "sticky-note-button"]);
		this.view
			.addAction("palette", "Color", (event) =>
				this.colorMenu.showAtMouseEvent(event)
			)
			.addClass("sticky-note-button");
	}

	private pinAction(pin?: boolean) {
		if (!this.mainWindow) return;
		const isPinned =
			pin !== undefined ? pin : !this.mainWindow.isAlwaysOnTop();
		this.mainWindow.setAlwaysOnTop(isPinned);
		const pinButton =
			this.view.containerEl.querySelector<HTMLElement>(".pinButton");
		if (!pinButton) return;
		setIcon(pinButton, isPinned ? "pin-off" : "pin");
		setTooltip(pinButton, isPinned ? "UnPin" : "Pin");
	}

	private initColorMenu() {
		this.colorMenu = new ColorMenu(
			this.document.body,
			this.settingService,
			this.file,
			this.plugin
		);
		this.setbgColors();
	}

	private setbgColors() {
		const frontmatter = this.plugin.app.metadataCache.getFileCache(
			this.file
		)?.frontmatter;
		console.log("Frontmatter", frontmatter);

		const bgColors = this.settingService.settings.bgColors;

		let selectedColor = bgColors.find((color) => color.order === 1)?.color;

		if (frontmatter) {
			for (const color of bgColors) {
				const { property, value } = color;

				if (
					(Array.isArray(frontmatter[property]) &&
						frontmatter[property].includes(value)) ||
					frontmatter[property] === value
				) {
					selectedColor = color.color;
					break;
				}
			}
		}

		selectedColor = selectedColor || "";
		this.document.body.setCssProps({
			"--background-primary": selectedColor,
		});
	}
}
