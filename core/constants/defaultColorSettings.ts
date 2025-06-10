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
		darkColor: "#bf2227",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.ORANGE,
		lightColor: "#fae7d0",
		darkColor: "#ce721c",
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
		darkColor: "#199a53",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.CYAN,
		lightColor: "#d0f0f0",
		darkColor: "#1a99ad",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.BLUE,
		lightColor: "#d0e3fa",
		darkColor: "#247ad6",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.PURPLE,
		lightColor: "#e7dffa",
		darkColor: "#6442d1",
		isDefault: false,
	},
	{
		property: DEFAULT_COLOR_PROPERTY,
		value: Colors.PINK,
		lightColor: "#f5dae7",
		darkColor: "#bb3a7a",
		isDefault: false,
	},
];
