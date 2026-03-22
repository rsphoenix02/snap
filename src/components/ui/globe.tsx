"use client";

import createGlobe, { type Arc } from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const CITIES: [number, number][] = [
  [40.7128, -74.006],    // New York
  [51.5074, -0.1278],    // London
  [35.6762, 139.6503],   // Tokyo
  [-33.8688, 151.2093],  // Sydney
  [48.8566, 2.3522],     // Paris
  [55.7558, 37.6173],    // Moscow
  [-23.5505, -46.6333],  // São Paulo
  [19.4326, -99.1332],   // Mexico City
  [1.3521, 103.8198],    // Singapore
  [28.6139, 77.209],     // New Delhi
  [30.0444, 31.2357],    // Cairo
  [39.9042, 116.4074],   // Beijing
  [34.0522, -118.2437],  // Los Angeles
  [-1.2921, 36.8219],    // Nairobi
  [41.0082, 28.9784],    // Istanbul
  [25.2048, 55.2708],    // Dubai
  [37.5665, 126.978],    // Seoul
  [52.52, 13.405],       // Berlin
  [-34.6037, -58.3816],  // Buenos Aires
  [13.7563, 100.5018],   // Bangkok
];

function generateArcs(cities: [number, number][], count: number): Arc[] {
  const arcs: Arc[] = [];
  for (let i = 0; i < count; i++) {
    const fromIdx = Math.floor(Math.random() * cities.length);
    let toIdx = Math.floor(Math.random() * cities.length);
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * cities.length);
    }
    arcs.push({
      from: cities[fromIdx],
      to: cities[toIdx],
      color: [239 / 255, 68 / 255, 68 / 255],
    });
  }
  return arcs;
}

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const rotationRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = canvas.offsetWidth;

    const globe = createGlobe(canvas, {
      width: width * 2,
      height: width * 2,
      devicePixelRatio: 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 2,
      baseColor: [0.15, 0.15, 0.15],
      markerColor: [239 / 255, 68 / 255, 68 / 255],
      glowColor: [0.15, 0.1, 0.1],
      markers: CITIES.map(([lat, lng]) => ({
        location: [lat, lng] as [number, number],
        size: 0.03,
      })),
      arcs: generateArcs(CITIES, 12),
      arcColor: [239 / 255, 68 / 255, 68 / 255] as [number, number, number],
    });

    // Fade in the canvas
    setTimeout(() => {
      canvas.style.opacity = "1";
    });

    // Regenerate arcs periodically without destroying the globe
    const arcInterval = setInterval(() => {
      globe.update({ arcs: generateArcs(CITIES, 12) });
    }, 4000);

    // Single rAF loop for smooth rotation
    let frameId: number;
    const animate = () => {
      if (pointerInteracting.current === null) {
        phiRef.current += 0.005;
      }
      globe.update({
        phi: phiRef.current + rotationRef.current,
        width: width * 2,
        height: width * 2,
      });
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(arcInterval);
      window.removeEventListener("resize", handleResize);
      globe.destroy();
    };
  }, []);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      rotationRef.current = delta / 200;
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-[600px]",
        className
      )}
    >
      <canvas
        className="size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
