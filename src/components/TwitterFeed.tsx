import { FC, useEffect } from 'react';

export const TwitterFeed: FC = () => {
  useEffect(() => {
    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
      <div className="h-[300px] overflow-y-auto">
        <a 
          className="twitter-timeline" 
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="5"
          data-height="300"
          data-dnt="true"
          href="https://twitter.com/AioraAI"
        >
          Loading AIORA's thoughts...
        </a>
      </div>
    </div>
  );
}; 