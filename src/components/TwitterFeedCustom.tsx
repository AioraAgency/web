import { FC, useEffect, useState } from 'react';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
}

export const TwitterFeedCustom: FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch('/api/tweets');
        const data = await response.json();
        setTweets(data);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  return (
    <div className="w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
      <div className="h-[300px] overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-gray-400 text-sm">Loading tweets...</div>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet.id} className="text-sm text-gray-300 border-b border-white/10 pb-4">
              <p>{tweet.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(tweet.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 