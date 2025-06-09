export function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export function isLightTheme(): boolean {
  return document.body.classList.contains('theme-light');
}