export function Logo({ height = 36, reversed = false }: { height?: number; reversed?: boolean }) {
  const h = height;
  return <img src={reversed ? "/brand/logo-reversed.png" : "/brand/logo-primary.png"} alt="educateU" style={{ height: h, width: "auto" }} draggable={false} />;
}
