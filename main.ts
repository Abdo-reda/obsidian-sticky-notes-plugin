import {
	Menu,
	Plugin,
	TFile,
	WorkspaceLeaf,
	WorkspaceWindow,
	setTooltip,
} from "obsidian";
import { IPluginSettings } from "core/interfaces/PluginSettingsInterface";
import { LoggingService } from "core/services/LogginService";
import { SettingService } from "core/services/SettingService";
import { StickyNoteLeaf } from "core/views/StickyNoteLeaf";
import { StickyNotesSettingsTab } from "core/views/StickyNotesSettingsTab";
import { MarkdownService } from "core/services/MarkdownService";

export default class StickyNotesPlugin extends Plugin {
	markdownService!: MarkdownService;
	settingsService!: SettingService;
	globalSettings!: IPluginSettings;

	async onload() {
		LoggingService.disable();
		LoggingService.info("Sticky Notes : plugin loading....");
		this.addServices();
		this.addSettings();
		this.addStickyNoteRibbonAction();
		this.addStickyNoteCommand();
		this.addStickyNoteMenuOptions();
		this.addLeafChangeListener();
		this.addPopoutClosedListener();
	}

	onunload() {
		LoggingService.info("Stiky Notes : plugin UN-loading ....");
	}

	private destroyAllStickyNotes() {
		StickyNoteLeaf.leafsList.forEach((l) => l.leaf.detach()); //could there be a race issue here with the event that unloads the leafs?
	}

	private addStickyNoteCommand() {
		this.addCommand({
			id: "open-sticky-note-view",
			name: "Open sticky note window",
			icon: "sticky-note",
			callback: () => this.openStickyNotePopup(),
		});
		this.addCommand({
			id: "create-sticky-note",
			name: "Create sticky note",
			icon: "sticky-note-plus",
			callback: () => this.createNewStickyNote(),
		});
		this.addCommand({
			id: "destroy-sticky-note-views",
			name: "Destroy all",
			icon: "copy-x",
			callback: () => this.destroyAllStickyNotes(),
		});
	}

	private addStickyNoteRibbonAction() {
		const stickyNoteRibbon = this.addRibbonIcon(
			"sticky-note",
			"Open sticky note",
			() => this.openStickyNotePopup(),
		);

		setTooltip(stickyNoteRibbon, "Sticky note popup");
	}

	private addStickyNoteMenuOptions() {
		const fileMenuEvent = this.app.workspace.on(
			"file-menu",
			(menu, file) =>
				file instanceof TFile && this.addStickyNoteMenuItem(menu, file),
		);
		const editorMenuEvent = this.app.workspace.on(
			"editor-menu",
			(menu, _editor, view) =>
				this.addStickyNoteMenuItem(menu, view.file),
		);
		this.registerEvent(fileMenuEvent);
		this.registerEvent(editorMenuEvent);
	}

	private addStickyNoteMenuItem(menu: Menu, file: TFile | null) {
		menu.addItem((item) => {
			item.setTitle("Open sticky note")
				.setIcon("sticky-note")
				.onClick(() => this.openStickyNotePopup(file));
		});
	}

	private addServices() {
		this.markdownService = new MarkdownService(this);
	}

	private async addSettings() {
		this.settingsService = new SettingService(this);
		await this.settingsService.initSettings();
		this.addSettingTab(
			new StickyNotesSettingsTab(this.app, this, this.settingsService),
		);
		this.addOnLayoutReadListener();
	}

	private addPopoutClosedListener() {
		const closeEvent = this.app.workspace.on(
			"window-close",
			(win: WorkspaceWindow, _window: Window) => {
				const noteId = win.doc.documentElement.getAttribute("note-id");
				if (noteId) StickyNoteLeaf.leafsList.delete(noteId);
			},
		);
		this.registerEvent(closeEvent);
	}

	private addOnLayoutReadListener() {
		this.app.workspace.onLayoutReady(async () => {
			await this.restoreStickyNotes();
		});
	}

	private async restoreStickyNotes() {
		if (!this.settingsService.settings.saveWorkspace) return;

		const savedWorkspaceNotes =
			this.settingsService.settings.workspaceNotes;
		if (!savedWorkspaceNotes.length) return;

		const popoutLeaves: WorkspaceLeaf[] = [];
		this.app.workspace.iterateAllLeaves((leaf) => {
			const leafRoot = leaf.getRoot();
			const isPopout =
				leafRoot !== this.app.workspace.rootSplit &&
				leaf.getRoot() !== this.app.workspace.leftSplit &&
				leaf.getRoot() !== this.app.workspace.rightSplit;
			if (isPopout) popoutLeaves.push(leaf);
		});

		for (const curSavedNote of savedWorkspaceNotes) {
			const popoutLeaf = popoutLeaves.find(
				(leaf) => (leaf as any).id === curSavedNote.id,
			);
			if (!popoutLeaf) continue;
			const stickyLeaf = new StickyNoteLeaf(
				popoutLeaf,
				this.settingsService,
				this.markdownService,
			);
			await stickyLeaf.initStickyNote(null, curSavedNote.color, false);
		}
	}

	private addLeafChangeListener() {
		const leafChangeEvent = this.app.workspace.on(
			"active-leaf-change",
			(leaf: WorkspaceLeaf | null) => {
				const noteId = leaf
					?.getContainer()
					.win.activeDocument.documentElement.getAttribute("note-id");

				if (noteId) {
					const stickyLeaf = StickyNoteLeaf.leafsList.get(noteId);
					stickyLeaf?.initView(true);
				}
			},
		);
		this.registerEvent(leafChangeEvent);
	}

	private async createNewStickyNote() {
		const now = new Date();
		const datePart = now.toDateString();
		const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "'"); 
		const formattedName = `${datePart} ${timePart}`;

		await this.app.vault
			.create(
				this.settingsService.settings.newStickyNotePath +
					`/${formattedName}.md`,
				"--- empty note ---",
			)
			.then((file) => {
				this.openStickyNotePopup(file);
			})
			.catch((error) => {
				LoggingService.warn("unable to create new sticky note");
			});
	}

	private async openStickyNotePopup(file: TFile | null = null) {
		LoggingService.info("Opened Sticky Note Popup");
		file = file ?? this.app.workspace.getActiveFile();
		const popoutLeaf = this.app.workspace.openPopoutLeaf({
			size: {
				height: 300,
				width: 300,
			},
		});
		const stickNoteLeaf = new StickyNoteLeaf(
			popoutLeaf,
			this.settingsService,
			this.markdownService,
		);
		await stickNoteLeaf.initStickyNote(file);
	}
}
