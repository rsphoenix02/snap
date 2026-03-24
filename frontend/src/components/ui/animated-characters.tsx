"use client";

import { useState, useEffect, useRef } from "react";

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "#2D2D2D",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  })();

  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "#2D2D2D",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  })();

  return (
    <div
      ref={ref}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

/* ── helpers ── */

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

function useRandomBlink() {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);
  return blinking;
}

function calcBodyPos(
  ref: React.RefObject<HTMLDivElement | null>,
  mouseX: number,
  mouseY: number,
) {
  if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const rect = ref.current.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 3;
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
    bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
  };
}

/* ── CharacterScene ── */

interface CharacterSceneProps {
  isTyping: boolean;
  password: string;
  showPassword: boolean;
}

export function CharacterScene({
  isTyping,
  password,
  showPassword,
}: CharacterSceneProps) {
  const mouse = useMousePosition();
  const redBlinking = useRandomBlink();
  const blackBlinking = useRandomBlink();

  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [redPeeking, setRedPeeking] = useState(false);

  const redRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  // Look at each other when typing starts
  useEffect(() => {
    if (isTyping) {
      setLookingAtEachOther(true);
      const t = setTimeout(() => setLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    }
    setLookingAtEachOther(false);
  }, [isTyping]);

  // Red character sneaky peek when password is visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setRedPeeking(true);
        setTimeout(() => setRedPeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    }
    setRedPeeking(false);
  }, [password, showPassword, redPeeking]);

  const redPos = calcBodyPos(redRef, mouse.x, mouse.y);
  const blackPos = calcBodyPos(blackRef, mouse.x, mouse.y);
  const yellowPos = calcBodyPos(yellowRef, mouse.x, mouse.y);
  const orangePos = calcBodyPos(orangeRef, mouse.x, mouse.y);

  const hiding = password.length > 0 && !showPassword;
  const peeking = password.length > 0 && showPassword;

  return (
    <div className="relative" style={{ width: 550, height: 400 }}>
      {/* Red tall character (back layer) */}
      <div
        ref={redRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 70,
          width: 180,
          height: isTyping || hiding ? 440 : 400,
          backgroundColor: "#EF4444",
          borderRadius: "10px 10px 0 0",
          zIndex: 1,
          transform: peeking
            ? "skewX(0deg)"
            : isTyping || hiding
              ? `skewX(${(redPos.bodySkew || 0) - 12}deg) translateX(40px)`
              : `skewX(${redPos.bodySkew || 0}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left: peeking ? 20 : lookingAtEachOther ? 55 : 45 + redPos.faceX,
            top: peeking ? 35 : lookingAtEachOther ? 65 : 40 + redPos.faceY,
          }}
        >
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            isBlinking={redBlinking}
            forceLookX={peeking ? (redPeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
            forceLookY={peeking ? (redPeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined}
          />
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            isBlinking={redBlinking}
            forceLookX={peeking ? (redPeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
            forceLookY={peeking ? (redPeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined}
          />
        </div>
      </div>

      {/* Black tall character (middle layer) */}
      <div
        ref={blackRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 240,
          width: 120,
          height: 310,
          backgroundColor: "#2D2D2D",
          borderRadius: "8px 8px 0 0",
          zIndex: 2,
          transform: peeking
            ? "skewX(0deg)"
            : lookingAtEachOther
              ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
              : isTyping || hiding
                ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                : `skewX(${blackPos.bodySkew || 0}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left: peeking ? 10 : lookingAtEachOther ? 32 : 26 + blackPos.faceX,
            top: peeking ? 28 : lookingAtEachOther ? 12 : 32 + blackPos.faceY,
          }}
        >
          <EyeBall
            size={16}
            pupilSize={6}
            maxDistance={4}
            isBlinking={blackBlinking}
            forceLookX={peeking ? -4 : lookingAtEachOther ? 0 : undefined}
            forceLookY={peeking ? -4 : lookingAtEachOther ? -4 : undefined}
          />
          <EyeBall
            size={16}
            pupilSize={6}
            maxDistance={4}
            isBlinking={blackBlinking}
            forceLookX={peeking ? -4 : lookingAtEachOther ? 0 : undefined}
            forceLookY={peeking ? -4 : lookingAtEachOther ? -4 : undefined}
          />
        </div>
      </div>

      {/* Orange semi-circle (front left) */}
      <div
        ref={orangeRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 0,
          width: 240,
          height: 200,
          zIndex: 3,
          backgroundColor: "#FF9B6B",
          borderRadius: "120px 120px 0 0",
          transform: peeking ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: peeking ? 50 : 82 + (orangePos.faceX || 0),
            top: peeking ? 85 : 90 + (orangePos.faceY || 0),
          }}
        >
          <Pupil size={12} maxDistance={5} forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
        </div>
      </div>

      {/* Yellow tall character (front right) */}
      <div
        ref={yellowRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 310,
          width: 140,
          height: 230,
          backgroundColor: "#E8D754",
          borderRadius: "70px 70px 0 0",
          zIndex: 4,
          transform: peeking ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: peeking ? 20 : 52 + (yellowPos.faceX || 0),
            top: peeking ? 35 : 40 + (yellowPos.faceY || 0),
          }}
        >
          <Pupil size={12} maxDistance={5} forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} forceLookX={peeking ? -5 : undefined} forceLookY={peeking ? -4 : undefined} />
        </div>
        {/* Mouth */}
        <div
          className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
          style={{
            left: peeking ? 10 : 40 + (yellowPos.faceX || 0),
            top: peeking ? 88 : 88 + (yellowPos.faceY || 0),
          }}
        />
      </div>
    </div>
  );
}
