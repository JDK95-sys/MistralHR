// Mistral "M" brand mark — angular white polyline on transparent background.
// Wrap in a coloured container (e.g. .sidebar-logo-icon) to add the orange background.

interface MistralMarkProps {
  /** Icon size in px (applied to both width and height). Default: 18 */
  size?: number;
  /** Stroke colour. Default: white */
  color?: string;
  /** Stroke width. Default: 2.5 */
  strokeWidth?: number;
}

export default function MistralMark({
  size = 18,
  color = "white",
  strokeWidth = 2.5,
}: MistralMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points="2,14 2,4 9,10 16,4 16,14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
