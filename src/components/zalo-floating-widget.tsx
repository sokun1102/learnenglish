"use client";

import React, { useState, useEffect, useRef } from "react";

export function ZaloFloatingWidget() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMoved = useRef(false);

  useEffect(() => {
    // Initial position: bottom right once window size is client-available
    const initX = window.innerWidth - 76;
    const initY = window.innerHeight - 86;
    setPosition({ x: initX, y: initY });

    const handleResize = () => {
      if (!isMoved.current) {
        setPosition({
          x: window.innerWidth - 76,
          y: window.innerHeight - 86
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    isMoved.current = false;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    isMoved.current = false;
    const touch = e.touches[0];
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      isMoved.current = true;
      const newX = Math.max(10, Math.min(window.innerWidth - 66, e.clientX - dragStart.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 66, e.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      isMoved.current = true;
      const touch = e.touches[0];
      const newX = Math.max(10, Math.min(window.innerWidth - 66, touch.clientX - dragStart.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 66, touch.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    if (isMoved.current) {
      e.preventDefault();
      return;
    }
    // Opens Zalo chat URL
    window.open("https://zalo.me/0326822268", "_blank", "noopener,noreferrer");
  };

  if (position.x === 0 && position.y === 0) return null;

  return (
    <div
      ref={widgetRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        zIndex: 9999,
        touchAction: "none"
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-150 select-none ${isDragging ? "scale-110" : "hover:scale-105"
        }`}
      title="Chat qua Zalo"
    >
      <div className="relative flex items-center justify-center h-full w-full">
        {/* Styled Zalo text logo */}
        <span className="text-[12px] font-black tracking-tight uppercase font-sans">
          Zalo
        </span>
        {/* Pulsing notification dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[8px] font-extrabold text-white items-center justify-center">
            1
          </span>
        </span>
      </div>
    </div>
  );
}
