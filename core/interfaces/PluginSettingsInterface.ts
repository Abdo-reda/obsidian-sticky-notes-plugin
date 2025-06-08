import { SizeOptions } from "core/enums/sizeOptionEnum";

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export interface IPluginSettings {
	sizeOption: SizeOptions;
	dimensions: string;
	bgColors: BgColor[];
}

export interface BgColor {
	order: number;
	property: string;
	value: string;
	color: string;
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
	bgColors: [
		{
			order: 0,
			property: "background",
			value: "yellow",
			color: "rgba(255, 255, 0, 0.5)",
		},
		{
			order: 1,
			property: "background",
			value: "green",
			color: "rgba(0, 128, 0, 0.5)",
		},
		{
			order: 2,
			property: "background",
			value: "red",
			color: "rgba(255, 0, 0, 0.5)",
		},
		{
			order: 3,
			property: "background",
			value: "blue",
			color: "rgba(0, 0, 255, 0.5)",
		},
		{
			order: 4,
			property: "background",
			value: "purple",
			color: "rgba(128, 0, 128, 0.5)",
		},
		{
			order: 5,
			property: "background",
			value: "orange",
			color: "rgba(255, 165, 0, 0.5)",
		},
		{
			order: 6,
			property: "background",
			value: "pink",
			color: "rgba(255, 192, 203, 0.5)",
		},
		{
			order: 7,
			property: "background",
			value: "brown",
			color: "rgba(165, 42, 42, 0.5)",
		},
		{
			order: 8,
			property: "background",
			value: "black",
			color: "rgba(0, 0, 0, 0.5)",
		},
		{
			order: 9,
			property: "background",
			value: "white",
			color: "rgba(255, 255, 255, 0.5)",
		},
	],
	resizable: false,
	defaultColor: Colors.DEFAULT,
};
