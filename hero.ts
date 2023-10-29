export function pattern(color: string, svgContent: string) {
  const svg = encodeURIComponent(
    svgContent.replace(/#[0]{3,6}/, color),
  );
  return `background-image: url('data:image/svg+xml;utf8,${svg}');`;
}
