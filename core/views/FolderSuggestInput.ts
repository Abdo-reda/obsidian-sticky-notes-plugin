import { AbstractInputSuggest, App, TFolder } from "obsidian";

//This file was made by the assistance of Claude

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	constructor(
		app: App,
		private inputEl: HTMLInputElement,
		private onSelectCb: (folder: TFolder) => void,
	) {
		super(app, inputEl);
	}

	getSuggestions(query: string): TFolder[] {
		const lowerQuery = query.toLowerCase();
		const folders: TFolder[] = [];

		const walk = (folder: TFolder) => {
			folders.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) walk(child);
			}
		};
		walk(this.app.vault.getRoot());

		return folders.filter((folder) =>
			folder.path.toLowerCase().contains(lowerQuery),
		);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path);
	}

	selectSuggestion(folder: TFolder): void {
		this.inputEl.value = folder.path;
		this.inputEl.trigger("input"); 
		this.onSelectCb(folder);
		this.close();
	}
}