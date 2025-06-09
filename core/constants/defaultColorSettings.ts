import { Colors } from "core/enums/colorEnum";
import { IBackgroundColor } from "core/interfaces/BackgroundColorInterface";

export const DEFAULT_COLOR_PROPERTY = "background_color";

export const DEFAULT_COLORS: IBackgroundColor[] = [
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.BASE,
		lightColor: "#ffffff",
		darkColor: "#1e1e1e",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.RED,
		lightColor: "#fadadf",
		darkColor: "#ed5465",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.ORANGE,
		lightColor: "#fae7d0",
		darkColor: "#ef8b2b",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.YELLOW,
		lightColor: "#faf0d0",
		darkColor: "#a87b03",
		isDefault: true,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.GREEN,
		lightColor: "#d0f0df",
		darkColor: "#30bb6e",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.CYAN,
		lightColor: "#d0f0f0",
		darkColor: "#2bb4c9",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.BLUE,
		lightColor: "#d0e3fa",
		darkColor: "#3086e5",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.PURPLE,
		lightColor: "#e7dffa",
		darkColor: "#8f70f2",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.PINK,
		lightColor: "#f5dae7",
		darkColor: "#dc5a9a",
		isDefault: false,
	},
];
