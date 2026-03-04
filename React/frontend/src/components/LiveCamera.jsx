import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function LiveCamera() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource("http://localhost:5001/hls/stream.m3u8");

      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    }
  }, []);

  return (
    <div>
      <h2>🚨 Apadamitra Live Camera</h2>
      <video ref={videoRef} controls muted style={{ width: "80%" }} />
    </div>
  );
}