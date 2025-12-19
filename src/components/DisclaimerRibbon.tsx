export function DisclaimerRibbon() {
  const message = '⚠️ SAMPLE DATA MODE — This dashboard is displaying simulated/sample data for demonstration. Enable "Live Data" to use FEMA + NWS feeds.';

  return (
    <div className="bg-danger/20 border-b border-danger/30 text-danger text-sm font-medium py-2 overflow-hidden relative h-10 flex items-center transition-colors duration-300 ease-out">
      <div className="whitespace-nowrap">
        {/* Duplicate content for seamless loop */}
        <span className="inline-block motion-safe:animate-scroll-slow motion-reduce:animate-none">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i}>
              {message} •{' '}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
