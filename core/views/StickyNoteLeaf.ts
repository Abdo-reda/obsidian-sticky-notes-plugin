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
import { type SettingService } from "core/services/SettingService";
import { SizeOptions } from "core/enums/sizeOptionEnum";
import { type MarkdownService } from "core/services/MarkdownService";

export class StickyNoteLeaf {
	private static stickyNoteId = 0;
	public static leafsList = new Set<StickyNoteLeaf>();
	private settingService: SettingService;
	private markdownService: MarkdownService;

	id: number;
	leaf: WorkspaceLeaf;
	view: View;
	document: Document;
	mainWindow: Electron.BrowserWindow | undefined;
	colorMenu: ColorMenu;

	constructor(
		leaf: WorkspaceLeaf,
		settingService: SettingService,
		markdownService: MarkdownService
	) {
		this.settingService = settingService;
		this.markdownService = markdownService;
		this.leaf = leaf;
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
		this.initColorMenu(file);
		this.initView();
		this.initMainWindow();
		if (file) await this.leaf.openFile(file);
	}

	initView() {
		LoggingService.info("Initializing Sticky Note view ...");
		this.view = this.leaf.view;
        this.addNoteContainerClass();
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
		this.mainWindow.setResizable(this.settingService.settings.resizable);

		if (
			this.settingService.settings.sizeOption ===
			SizeOptions.REMEMBER_LAST
		) {
			this.mainWindow.on("resize", () => this.saveDimensions());
		}

		this.pinAction(true);
	}

	private saveDimensions() {
		try {
			if (!this.mainWindow) return;
			const [width, height] = this.mainWindow.getSize();
			this.settingService.updateWindowDimensions(width, height);
		} catch (e) {
			LoggingService.warn("Could not get and update size ....");
			return;
		}
	}

	private addNoteContainerClass() {
		const appContainerEl =
			this.document.body.querySelector(".app-container");
		if (!appContainerEl) return;
		appContainerEl.addClass("sticky-note");
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
			.addClasses(["pin-button", "sticky-note-button"]);
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
			this.view.containerEl.querySelector<HTMLElement>(".pin-button");
		if (!pinButton) return;
		setIcon(pinButton, isPinned ? "pin-off" : "pin");
		setTooltip(pinButton, isPinned ? "UnPin" : "Pin");
	}

	private initColorMenu(file: TFile | null = null) {
		this.colorMenu = new ColorMenu(
			this.document.body,
			this.settingService.settings.bgColors,
			this.settingService.settings.rememberBgColors,
			this.markdownService.updateFrontmatterAsync.bind(
				this.markdownService
			)
		);
		this.setDefaultColor(file);
	}

	private async setDefaultColor(file: TFile | null = null) {
		const rememberColors = this.settingService.settings.rememberBgColors;
		let defaultColor = this.settingService.settings.bgColors.find(
			(bg) => bg.isDefault
		);
		if (rememberColors) {
			const frontMatter = await this.markdownService.getFrontmatterAsync(
				file
			);
			for (const [property, value] of Object.entries(frontMatter)) {
				defaultColor =
					this.settingService.settings.bgColors.find(
						(bg) => bg.property === property && bg.value === value
					) ?? defaultColor;
			}
		}
		if (!defaultColor) {
			LoggingService.warn("No default color found ...");
			return;
		}
		this.document.body.setCssProps({
			"--note-light-color": defaultColor.lightColor,
			"--note-dark-color": defaultColor.darkColor,
		});
		if (rememberColors) {
			this.markdownService.updateFrontmatterAsync(file, {
				[defaultColor.property]: defaultColor.value,
			});
		}
	}
}
