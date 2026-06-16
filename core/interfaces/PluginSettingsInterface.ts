import { SizeOptions } from "core/enums/sizeOptionEnum";
import { IBackgroundColor } from "./BackgroundColorInterface";
import { DEFAULT_COLORS } from "core/constants/defaultColorSettings";
import { PinOptions } from "core/enums/pinOptionEnum";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export interface IPluginSettings {
	taskbarVisibility: boolean;
	pinOption: PinOptions;
	sizeOption: SizeOptions;
	dimensions: string;
	resizable: boolean;
	rememberBgColors: boolean;
	bgColors: IBackgroundColor[];
}

export const DEFAULT_SETTINGS: IPluginSettings = {
	taskbarVisibility: true,
	pinOption: PinOptions.ALWAYS,
	sizeOption: SizeOptions.DEFAULT,
	dimensions: `${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}`,
	resizable: false,
    rememberBgColors: false,
	bgColors: structuredClone(DEFAULT_COLORS)
};
