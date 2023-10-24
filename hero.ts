export function pattern(color: string, svgContent: string) {
  const svg = encodeURIComponent(
    svgContent.replace("#000000", color),
  );
  return `background-image: url('data:image/svg+xml;utf8,${svg}');`;
}
