import ProgressBar from '../ProgressBar';

export default function ProgressBarExample() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <ProgressBar current={3} total={10} />
    </div>
  );
}
