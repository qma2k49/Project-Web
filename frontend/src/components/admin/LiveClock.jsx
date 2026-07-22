import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const LiveClock = ({ match, showIcon = true, className = "" }) => {
  const [seconds, setSeconds] = useState(match?.elapsedSeconds || 0);

  // Sync with prop when match updates or backend refreshes
  useEffect(() => {
    setSeconds(match?.elapsedSeconds || 0);
  }, [match?.elapsedSeconds]);

  // Tick the clock locally in real-time
  useEffect(() => {
    if (!match?.clockRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [match?.clockRunning]);

  const formatMatchClock = (sec) => {
    const totalMinutes = Math.floor(sec / 60);

    if (sec < 45 * 60) {
      return `${totalMinutes + 1}'`; // Hiệp 1: 0s -> 1', 2699s -> 45'
    }

    if (sec < 90 * 60) {
      return `${totalMinutes + 1}'`; // Hiệp 2: 2700s -> 46', 5399s -> 90'
    }

    // Stoppage time Hiệp 2
    return `90+${totalMinutes - 90 + 1}'`;
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5" />}
      <span>{formatMatchClock(seconds)}</span>
    </span>
  );
};

export default LiveClock;
