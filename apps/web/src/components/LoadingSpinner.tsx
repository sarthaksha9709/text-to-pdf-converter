interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export function LoadingSpinner({ size = 24, label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <span
      className="loading-spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    />
  );
}
