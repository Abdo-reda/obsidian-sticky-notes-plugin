import { type IBackgroundColor } from "./BackgroundColorInterface";

export interface IStickyNoteState {
	id: string;
	color: IBackgroundColor;
	// pinned or not
	// read mode or not
}