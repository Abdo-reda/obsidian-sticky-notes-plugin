import { SizeOptions } from "core/enums/sizeOptionEnum";
import { type IBackgroundColor } from "./BackgroundColorInterface";
import { DEFAULT_COLORS } from "core/constants/defaultColorSettings";
import { PinOptions } from "core/enums/pinOptionEnum";
import { type IStickyNoteState } from "./WorkspaceStickyNoteInterface";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export interface IPluginSettings {
	saveWorkspace: boolean;
	taskbarVisibility: boolean;
	pinOption: PinOptions;
	sizeOption: SizeOptions;
	dimensions: string;
	resizable: boolean;
	useRecentBgColor: boolean;
	rememberBgColors: boolean;
	bgColors: IBackgroundColor[];
	newStickyNotePath: string;
	workspaceNotes: IStickyNoteState[];
}

export const DEFAULT_SETTINGS: IPluginSettings = {
	saveWorkspace: true,
	taskbarVisibility: true,
	pinOption: PinOptions.ALWAYS,
	sizeOption: SizeOptions.DEFAULT,
	dimensions: `${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}`,
	resizable: false,
    useRecentBgColor: true,
    rememberBgColors: false,
	bgColors: structuredClone(DEFAULT_COLORS),
	newStickyNotePath: "",
	workspaceNotes: [],
};
