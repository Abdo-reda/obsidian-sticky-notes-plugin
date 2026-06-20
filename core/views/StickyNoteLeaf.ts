import {
	ItemView,
	MarkdownView,
	type MarkdownViewModeType,
	Platform,
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
import { PinOptions } from "core/enums/pinOptionEnum";
import { IBackgroundColor } from "core/interfaces/BackgroundColorInterface";
import { DEFAULT_COLORS } from "core/constants/defaultColorSettings";

type StickyNoteSubLeaf = WorkspaceLeaf & { id: string };

export class StickyNoteLeaf {
	private static stickyNoteId = 0;
	public static leafsList = new Map<string, StickyNoteLeaf>();
	private settingService: SettingService;
	private markdownService: MarkdownService;

	id: number;
	leaf: StickyNoteSubLeaf;
	view: View;
	document: Document;
	mainWindow: Electron.BrowserWindow | undefined;
	colorMenu: ColorMenu | undefined;
	init: boolean = false;
	color: IBackgroundColor = DEFAULT_COLORS[0];
	private static lastNotePinnedState = true;
	public static lastNoteColor: IBackgroundColor | undefined;

	constructor(
		leaf: WorkspaceLeaf,
		settingService: SettingService,
		markdownService: MarkdownService,
	) {
		this.settingService = settingService;
		this.markdownService = markdownService;
		this.leaf = leaf as StickyNoteSubLeaf;
		this.view = leaf.view;
		this.document = this.leaf.getContainer().win.activeDocument;
		this.id = StickyNoteLeaf.stickyNoteId;
		StickyNoteLeaf.stickyNoteId++;
		StickyNoteLeaf.leafsList.set(this.title, this);
		this.settingService.updateWorkspaceNotes(StickyNoteLeaf.leafsList)
	}

	get title() {
		return `sticky-note-${this.id}`;
	}

	async initStickyNote(file: TFile | null = null, explicitColor: IBackgroundColor | null = null, resize: boolean = true) {
		LoggingService.info(`Init Sticky Note ${this.id} ...`);
		this.document.title = this.title;
		this.document.documentElement.setAttribute("note-id", this.title);
		this.initColorMenu(file, explicitColor);
		this.initView(false);
		this.initMainWindow(resize);
		if (file) await this.leaf.openFile(file);
	}

	initView(init: boolean) {
		if (this.init) return;
		LoggingService.info("Initializing Sticky Note view ...");
		this.init = init;
		this.view = this.leaf.view;
		this.addNoteContainerClass();
		this.removeHeader();
		this.removeDefaultActionsMenu();
		this.addActions();
	}

	private initMainWindow(resize: boolean = true) {
		const windows = BrowserWindow.getAllWindows();
		const mainWindow = windows.find((w) => w.title === this.title);
		if (!mainWindow) {
			LoggingService.warn(
				`Sticky note ${this.title} does not have an electron window`,
			);
			return;
		}

		this.mainWindow = mainWindow;
		
		if (resize) {
			const [width, height] = this.settingService.getWindowDimensions();
			this.mainWindow.setSize(width, height);
		}
		this.mainWindow.setResizable(this.settingService.settings.resizable);

		if (
			this.settingService.settings.sizeOption ===
			SizeOptions.REMEMBER_LAST
		) {
			this.mainWindow.on("resize", () => this.saveDimensions());
		}

		this.mainWindow.setSkipTaskbar(
			!this.settingService.settings.taskbarVisibility,
		);

		let isPinned = StickyNoteLeaf.lastNotePinnedState;
		if (this.settingService.settings.pinOption === PinOptions.ALWAYS)
			isPinned = true;
		else if (this.settingService.settings.pinOption === PinOptions.NEVER)
			isPinned = false;
		this.pinAction(isPinned);

		if (!(this.view instanceof MarkdownView)) return;
		this.viewModeAction(this.view.getMode());
	}

	private saveDimensions() {
		if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
		const [width, height] = this.mainWindow.getSize();
		this.settingService.updateWindowDimensions(width, height);
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
			".workspace-tab-header-container",
		);
		const titleEl = this.document.querySelector(".titlebar");
		const breadcrumbTitleEl = this.document.querySelector(
			".view-header-title-parent",
		); //Note: adding a tooltip with the path of the file will require removing the app-drag
		headerEl?.remove();
		titleEl?.empty();
		breadcrumbTitleEl?.remove();
	}

	private addActions() {
		if (!(this.view instanceof ItemView)) return;

		if (!Platform.isMacOS) {
			this.view
				.addAction("x", "Close", () => this.leaf.detach())
				.addClass("sticky-note-button");
			this.view
				.addAction("minus", "Minimize", () =>
					this.mainWindow?.minimize(),
				)
				.addClass("sticky-note-button");
		}

		this.view
			.addAction(
				this.mainWindow?.isAlwaysOnTop() ? "pin-off" : "pin",
				this.mainWindow?.isAlwaysOnTop() ? "UnPin" : "Pin",
				() => this.pinAction(),
			)
			.addClasses(["pin-button", "sticky-note-button"]);
		this.view
			.addAction("palette", "Color", (event) =>
				this.colorMenu?.showAtMouseEvent(event),
			)
			.addClass("sticky-note-button");

		if (!(this.view instanceof MarkdownView)) return;
		this.view
			.addAction(
				this.view.getMode() === "source" ? "book-open" : "pencil",
				this.view.getMode() === "source" ? "Read mode" : "Edit mode",
				() => this.viewModeAction(),
			)
			.addClasses(["view-mode-button", "sticky-note-button"]);
	}

	private pinAction(pin?: boolean) {
		if (!this.mainWindow) return;
		const isPinned = pin ?? !this.mainWindow.isAlwaysOnTop();
		this.mainWindow.setAlwaysOnTop(isPinned);
		const pinButton =
			this.view.containerEl.querySelector<HTMLElement>(".pin-button");
		if (!pinButton) return;
		setIcon(pinButton, isPinned ? "pin-off" : "pin");
		setTooltip(pinButton, isPinned ? "UnPin" : "Pin");
		StickyNoteLeaf.lastNotePinnedState = isPinned;
	}

	private viewModeAction(mode?: MarkdownViewModeType) {
		if (!(this.view instanceof MarkdownView)) return;

		const newMode =
			mode ?? (this.view.getMode() === "source" ? "preview" : "source");
		this.view.setState({ mode: newMode }, { history: false });

		const viewModeButton =
			this.view.containerEl.querySelector<HTMLElement>(
				".view-mode-button",
			);
		if (!viewModeButton) return;
		setIcon(viewModeButton, newMode == "source" ? "book-open" : "pencil");
		setTooltip(
			viewModeButton,
			newMode == "source" ? "Read mode" : "Edit mode",
		);
	}

	private initColorMenu(file: TFile | null = null, color: IBackgroundColor | null = null) {
		this.colorMenu = new ColorMenu(
			this.settingService.settings.bgColors,
			this.updateColor.bind(this),
		);
		this.setDefaultColor(file, color);
	}

	private updateColor(newColor: IBackgroundColor, file: TFile | null = null) {
		this.document.body.setCssProps({
			"--note-light-color": newColor.lightColor,
			"--note-dark-color": newColor.darkColor,
		});

		this.color = newColor;
		this.settingService.updateWorkspaceNotes(StickyNoteLeaf.leafsList)

		if (this.settingService.settings.rememberBgColors) {
			this.markdownService.updateFrontmatterAsync(file, {
				[newColor.property]: newColor.value,
			});
		}
	}

	private async setDefaultColor(file: TFile | null = null, explicitColor: IBackgroundColor | null = null) {

		if (explicitColor) {
			this.updateColor(explicitColor, file)
			return;
		}

		const rememberColors = this.settingService.settings.rememberBgColors;
		const useRecentColor = this.settingService.settings.useRecentBgColor;

		const defaultColor = this.settingService.settings.bgColors.find(
			(bg) => bg.isDefault,
		);
		const recentColor = StickyNoteLeaf.lastNoteColor ?? defaultColor;

		let currentColor = useRecentColor ? recentColor : defaultColor;

		if (rememberColors) {
			const frontMatter =
				await this.markdownService.getFrontmatterAsync(file);
			for (const [property, value] of Object.entries(frontMatter)) {
				currentColor =
					this.settingService.settings.bgColors.find(
						(bg) => bg.property === property && bg.value === value,
					) ?? currentColor;
			}
		}

		if (!currentColor) {
			LoggingService.warn("No default color found ...");
			return;
		}

		this.updateColor(currentColor, file)
	}
}
