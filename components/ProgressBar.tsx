interface Props {
  percent: number;
  className?: string;
}

export default function ProgressBar({ percent, className = "" }: Props) {
  return (
    <div className={`w-full bg-stone-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-sage to-green-400 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}
