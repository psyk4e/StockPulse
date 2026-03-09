interface CanDisplayProps {
  condition: boolean;
  children: React.ReactNode;
}
export function CanRender({ condition, children }: CanDisplayProps) {
  return condition ? <>{children}</> : null;
}
