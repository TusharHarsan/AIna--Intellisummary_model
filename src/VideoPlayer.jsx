import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import c from "classnames";
import { timeToSecs } from "./utils";

const formatTime = (t) =>
  `${Math.floor(t / 60)}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;

export default function VideoPlayer({
  url,
  timecodeList,
  requestedTimecode,
  isLoadingVideo,
  videoError,
  jumpToTimecode,
}) {
  const [video, setVideo] = useState(null);
  const [duration, setDuration] = useState(0);
  const [scrubberTime, setScrubberTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(null);
  const currentSecs = duration * scrubberTime || 0;
  const currentPercent = scrubberTime * 100;
  const timecodeListReversed = useMemo(
    () => timecodeList?.toReversed(),
    [timecodeList]
  );

  // Ref for scrubber container
  const scrubberRef = useRef(null);

  // Log scrubber container size
  useEffect(() => {
    if (!scrubberRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        console.log("Scrubber resized to:", width, height);
      }
    });

    observer.observe(scrubberRef.current);

    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying, video]);

  const updateDuration = () => setDuration(video.duration);

  const updateTime = () => {
    if (!isScrubbing) {
      setScrubberTime(video.currentTime / video.duration);
    }

    if (timecodeList) {
      setCurrentCaption(
        timecodeListReversed.find(
          (t) => timeToSecs(t.time) <= video.currentTime
        )?.text
      );
    }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  useEffect(() => {
    setScrubberTime(0);
    setIsPlaying(false);
  }, [url]);

  useEffect(() => {
    if (video && requestedTimecode !== null) {
      video.currentTime = requestedTimecode;
    }
  }, [video, requestedTimecode]);

  useEffect(() => {
    const onKeyPress = (e) => {
      if (
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        e.key === " "
      ) {
        togglePlay();
      }
    };

    addEventListener("keypress", onKeyPress);
    return () => removeEventListener("keypress", onKeyPress);
  }, [togglePlay]);

  return (
    <div className="videoPlayer">
      {url && !isLoadingVideo ? (
        <>
          <div>
            <video
              src={url}
              ref={setVideo}
              onClick={togglePlay}
              preload="auto"
              crossOrigin="anonymous"
              onDurationChange={updateDuration}
              onTimeUpdate={updateTime}
              onPlay={onPlay}
              onPause={onPause}
            />

            {currentCaption && (
              <div className="videoCaption">{currentCaption}</div>
            )}
          </div>

          <div className="videoControls">
            <div className="videoScrubber" ref={scrubberRef}>
              <input
                style={{ "--pct": `${currentPercent}%` }}
                type="range"
                min="0"
                max="1"
                value={scrubberTime || 0}
                step="0.000001"
                onChange={(e) => {
                  setScrubberTime(e.target.valueAsNumber);
                  video.currentTime = e.target.valueAsNumber * duration;
                }}
                onPointerDown={() => setIsScrubbing(true)}
                onPointerUp={() => setIsScrubbing(false)}
              />
            </div>

            <div className="timecodeMarkers">
              {timecodeList?.map(({ time, text, value }, i) => {
                const secs = timeToSecs(time);
                const pct = (secs / duration) * 100;

                return (
                  <div
                    className="timecodeMarker"
                    key={i}
                    style={{ left: `${pct}%` }}
                  >
                    <div
                      className="timecodeMarkerTick"
                      onClick={() => jumpToTimecode(secs)}
                    >
                      <div />
                    </div>
                    <div
                      className={c("timecodeMarkerLabel", { right: pct > 50 })}
                    >
                      <div>{time}</div>
                      <p>{value || text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="videoTime">
              <button>
                <span className="icon" onClick={togglePlay}>
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>
              {formatTime(currentSecs)} / {formatTime(duration)}
            </div>
          </div>
        </>
      ) : (
        <div className="emptyVideo w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 p-4 text-center shadow-sm">
          <p className="text-gray-600 text-base font-medium flex items-center gap-2">
            {isLoadingVideo ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full"></span>
                Processing video...
              </>
            ) : videoError ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
                  />
                </svg>
                Error processing video.
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Drag and drop a video file here to get started.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
