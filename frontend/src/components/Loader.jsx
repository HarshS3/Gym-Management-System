import React from 'react';

const Loader = ({ 
  type = "spinner", 
  size = "medium", 
  color = "white", 
  text = "Loading...",
  fullScreen = false,
  overlay = false 
}) => {
  
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  const colorClasses = {
    white: "text-white",
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    gray: "text-gray-500"
  };

  const SpinnerLoader = () => (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]} ${sizeClasses[size]}`}>
      <div className="sr-only">Loading...</div>
    </div>
  );

  const DotsLoader = () => (
    <div className="flex space-x-1">
      <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`}></div>
      <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{animationDelay: '0.1s'}}></div>
      <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{animationDelay: '0.2s'}}></div>
    </div>
  );

  const PulseLoader = () => (
    <div className={`animate-pulse rounded-full bg-current ${colorClasses[color]} ${sizeClasses[size]}`}></div>
  );

  const RingLoader = () => (
    <div className={`animate-spin rounded-full border-4 border-t-transparent ${colorClasses[color]} ${sizeClasses[size]}`}></div>
  );

  const renderLoader = () => {
    switch(type) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "ring":
        return <RingLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderLoader()}
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <LoaderContent />
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

export default Loader; 