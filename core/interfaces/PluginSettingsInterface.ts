import { SizeOptions } from "core/enums/sizeOptionEnum";
import { IBackgroundColor } from "./BackgroundColorInterface";
import { DEFAULT_COLORS } from "core/constants/defaultColorSettings";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export interface IPluginSettings {
	sizeOption: SizeOptions;
	dimensions: string;
	resizable: boolean;
	rememberBgColors: boolean;
	bgColors: IBackgroundColor[];
}

export const DEFAULT_SETTINGS: IPluginSettings = {
	sizeOption: SizeOptions.DEFAULT,
	dimensions: `${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}`,
	resizable: false,
    rememberBgColors: false,
	bgColors: structuredClone(DEFAULT_COLORS)
};
