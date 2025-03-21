import { LoggingService } from "core/services/LogginService";
import { StickyNoteLeaf } from "core/views/StickyNoteLeaf";
import {
	Menu,
	Plugin,
	setTooltip,
	TFile,
	WorkspaceLeaf,
} from "obsidian";

export default class StickyNotesPlugin extends Plugin {

	async onload() {
		LoggingService.disable();
		LoggingService.info("plugin loading....");

		this.addStickyNoteRibbonAction();
		this.addStickNoteCommand();
		this.addStickyNoteMenuOptions();
		this.addLeafChangeListner();
	}

	onunload() {
		LoggingService.info("plugin UN-loading ....");
	}

	private destroyAllStickyNotes() {
		StickyNoteLeaf.leafsList.forEach(l => l.leaf.detach())
	}

	private addStickNoteCommand() {
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
		const stickNoteLeaf = new StickyNoteLeaf(popoutLeaf);
		await stickNoteLeaf.initStickyNote(file);
	}
}
