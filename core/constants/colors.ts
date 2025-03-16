export function getColorVariable(color: string) {
	return color === "Default"
		? `--color-base-00`
		: `--sticky-note-${color.toLowerCase()}`;
}

export function getColorCSS(color: string) {
	const colorVar = getColorVariable(color);
	return color === "Default" ? `var(${colorVar})` : `rgb(var(${colorVar}))`;
}

export function getColorTextClass(color: string) {
	return `sticky-note-text-${color.toLowerCase()}`;
}

export function getColorsFromSettings(settings: {
	bgColors: { color: string; label: string }[];
}) {
	return settings.bgColors.map((c) => ({
		color: getColorCSS(c.color),
		label: c.label,
	}));
}
