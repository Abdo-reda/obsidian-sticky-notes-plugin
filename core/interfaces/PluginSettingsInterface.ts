import { Colors } from "core/enums/colorEnum";
import { SizeOptions } from "core/enums/sizeOptionEnum";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export interface IPluginSettings {
	sizeOption: SizeOptions;
	dimensions: string;
	resizable: boolean;
    defaultColor: Colors;
}

// - colors
// - defualt color
// - default size
// - enable resize
// - memorize sticky ntoes

export const DEFAULT_SETTINGS: IPluginSettings = {
	sizeOption: SizeOptions.DEFAULT,
	dimensions: `${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}`,
	resizable: false,
	defaultColor: Colors.DEFAULT,
};
