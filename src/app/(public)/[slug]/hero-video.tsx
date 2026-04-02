"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // MP4 — native playback
    if (src.endsWith(".mp4")) {
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    // HLS (.m3u8) — use hls.js, or native if supported
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = src;
      video.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 -z-10 size-full object-cover"
    />
  );
}
