import {
	Menu,
	Plugin,
	TFile,
	WorkspaceLeaf,
	setTooltip,
} from "obsidian";

import { IPluginSettings } from "core/interfaces/PluginSettingsInterface";
import { LoggingService } from "core/services/LogginService";
import { SettingService } from "core/services/SettingService";
import { StickyNoteLeaf } from "core/views/StickyNoteLeaf";
import { StickyNotesSettingsTab } from "core/views/StickyNotesSettingsTab";

export default class StickyNotesPlugin extends Plugin {
	settingsManager: SettingService;
	globalSettings: IPluginSettings;

	async onload() {
		LoggingService.disable();
		LoggingService.info("Sticky Notes : plugin loading....");
		this.addSettings();
		this.addStickyNoteRibbonAction();
		this.addStickyNoteCommand();
		this.addStickyNoteMenuOptions();
		this.addLeafChangeListner();
	}

	onunload() {
		LoggingService.info("Stiky Notes : plugin UN-loading ....");
		// this.destroyAllStickyNotes(); //TODO: its an antipattern to detach leaves in the unload, more research is needed in order to know how to handle this.
	}

	private destroyAllStickyNotes() {
		StickyNoteLeaf.leafsList.forEach(l => l.leaf.detach())
	}

	private addStickyNoteCommand() {
		this.addCommand({
			id: "open-sticky-note-view",
			name: "Open sticky note window",
			icon: "sticky-note",
			callback: () => this.openStickyNotePopup(),
		});
		this.addCommand({
			id: "destroy-sticky-note-views",
			name: "Destroy all sticky notes",
			icon: "copy-x",
			callback: () => this.destroyAllStickyNotes(),
		});
	}

	private addStickyNoteRibbonAction() {
		const stickyNoteRibbon = this.addRibbonIcon(
			"sticky-note",
			"Open sticky note",
			() => this.openStickyNotePopup()
		);

		setTooltip(stickyNoteRibbon, "Sticky note popup");
	}

	private addStickyNoteMenuOptions() {
		const fileMenuEvent = this.app.workspace.on(
			"file-menu",
			(menu, file) =>
				file instanceof TFile && this.addStickyNoteMenuItem(menu, file)
		);
		const editorMenuEvent = this.app.workspace.on(
			"editor-menu",
			(menu, editor, view) => this.addStickyNoteMenuItem(menu, view.file)
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

	private async addSettings() {
		this.settingsManager = new SettingService(this);
		await this.settingsManager.initSettings();
		this.addSettingTab(new StickyNotesSettingsTab(this.app, this, this.settingsManager));
	}

	// private addPopoutClosedListner() {
	// 	const closeEvent = this.app.workspace.on('window-close', (win: WorkspaceWindow, window: Window) => {
	// 		const noteId = win.doc.documentElement.getAttribute('note-id');
	// 		if (noteId) {
	// 			StickyNoteManager.removeBrowserWindow(noteId);
	// 		}
	// 	});
	// 	this.registerEvent(closeEvent);
	// }

	private addLeafChangeListner() {
		const leafChangeEvent = this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
			const noteId = leaf?.getContainer().win.activeDocument.documentElement.getAttribute('note-id');
			StickyNoteLeaf.leafsList.forEach(l => {
				if (l.title === noteId) l.initView()
			})
		})
		this.registerEvent(leafChangeEvent);
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
		const stickNoteLeaf = new StickyNoteLeaf(popoutLeaf, this.settingsManager);
		await stickNoteLeaf.initStickyNote(file);
	}
}
