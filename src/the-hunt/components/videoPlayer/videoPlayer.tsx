import { useState } from "react";

export default function VideoPlayer({ url, label } : { url: string; label: string }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="w-full mb-3">
      {!showVideo ? (
        <button
          onClick={() => setShowVideo(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:brightness-110"
        >
          {label}
        </button>
      ) : (
        <div className="aspect-video">
         <iframe
            className="w-full h-full rounded-xl"
            src={url}
            title="YouTube Short"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}