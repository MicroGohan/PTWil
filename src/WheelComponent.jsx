import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import wheelImg from './assets/Llanta.png';
import img1 from './assets/021.jpg';
import img2 from './assets/021.jpg';
import img3 from './assets/021.jpg';
import img4 from './assets/021.jpg';
import img5 from './assets/021.jpg';
import img6 from './assets/021.jpg';

const NUM_MARKS = 6;
const images = [img1, img2, img3, img4, img5, img6];
const titles = ['Tour en Cuadra', 'Cascadas', 'Piscina Termal', 'Mirador', 'Bosque', 'Volcán'];


const WheelComponent = () => {
  const wheelRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const [startAngle, setStartAngle] = useState(0);
  const [startRotation, setStartRotation] = useState(0);

  const rawAngle = useMotionValue(0);
  const angle = useSpring(rawAngle, { damping: 100, stiffness: 999, mass: 1 });

  const outerSize = 1000;
  const redCircleSize = 650;
  const wheelSize = 500;
  const cardWidth = 140;
  const cardHeight = 120;
  const markRadius = (redCircleSize / 2) + 80;

  const getNearestSnapAngle = () => {
    const currentAngle = rawAngle.get();
    const normalized = ((currentAngle % 360) + 360) % 360;
    const indexOnTop = Math.round((-normalized / 360) * NUM_MARKS);
    const targetIndex = (indexOnTop + NUM_MARKS) % NUM_MARKS;
    const snapAngle = -targetIndex * (360 / NUM_MARKS);
    return snapAngle;
  };
  // Drag mouse
  const handleMouseDown = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setCenter({ x: centerX, y: centerY });

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    setStartAngle(angle);
    setStartRotation(rawAngle.get());
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const delta = angle - startAngle;
    rawAngle.set(startRotation + delta);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const snapAngle = getNearestSnapAngle();
    rawAngle.set(snapAngle, true);
  };

  // Drag touch
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setCenter({ x: centerX, y: centerY });

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    setStartAngle(angle);
    setStartRotation(rawAngle.get());
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - center.x;
    const dy = touch.clientY - center.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const delta = angle - startAngle;
    rawAngle.set(startRotation + delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const snapAngle = getNearestSnapAngle();
    rawAngle.set(snapAngle);
  };
  const selectedIndex = useTransform(angle, (a) => {
    const normalized = ((a % 360) + 360) % 360;
    const index = Math.round((-normalized / 360) * NUM_MARKS);
    return (index + NUM_MARKS) % NUM_MARKS;
  });
  // Cards
  const cards = images.map((img, i) => {
    const offset = i * (360 / NUM_MARKS);
    const theta = useTransform(angle, (a) => ((a + offset - 90) % 360) * (Math.PI / 180));
    const x = useTransform(theta, (t) => Math.cos(t) * markRadius);
    const y = useTransform(theta, (t) => Math.sin(t) * markRadius);

    const cosOffset = useTransform(theta, (t) => Math.cos(t + Math.PI / 2));

    const scale = useTransform(cosOffset, (c) => 1 + 1.5 * c);

    const opacity = useTransform(cosOffset, (c) => 0.4 + 0.6 * c);

    const zIndex = useTransform(cosOffset, (c) => Math.round(20 + c * 10));

    return (
      <motion.div
        key={i}
        className="absolute"
        style={{
          width: cardWidth,
          height: cardHeight,
          left: `calc(50% - ${cardWidth / 2}px)`,
          top: `calc(50% - ${cardHeight / 2}px)`,
          x,
          y,
          rotate: useTransform(theta, t => (t * 180 / Math.PI) + 90),
          scale,
          opacity,
          zIndex,
        }}
      >
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-xl border-4 border-white w-full h-full overflow-hidden">
          <img
            src={img}
            alt={`card ${i}`}
            className="w-full h-3/4 object-cover"
            style={{ borderRadius: '0px' }}
            draggable={false}
          />
          <div className="w-full text-center py-1 font-bold text-xs">{titles[i]}</div>
        </div>
      </motion.div>
    );
  });

  const points = images.map((_, i) => {
    const offset = i * (360 / NUM_MARKS);
    const theta = useTransform(angle, (a) => (a + offset - 90) * (Math.PI / 180));
    const px = useTransform(theta, (t) => Math.cos(t) * (redCircleSize / 2));
    const py = useTransform(theta, (t) => Math.sin(t) * (redCircleSize / 2));

    return (
      <motion.div
        key={i}
        className="absolute bg-red-500 rounded-full"
        style={{
          width: 7,
          height: 7,
          left: `calc(50% - 3.5px)`,
          top: `calc(50% - 3.5px)`,
          x: px,
          y: py,
          zIndex: 20,
        }}
      />
    );
  });

  return (
    <div
      className="relative mx-auto my-16 select-none touch-none flex items-center justify-center"
      style={{ width: outerSize, height: outerSize, background: 'black', borderRadius: '50%' }}
      ref={wheelRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Línea roja */}
      <div
        className="absolute border-2 border-red-500 rounded-full"
        style={{
          width: redCircleSize,
          height: redCircleSize,
          left: `calc(50% - ${redCircleSize / 2}px)`,
          top: `calc(50% - ${redCircleSize / 2}px)`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Fondo gris tras la llanta */}
      <div
        className="absolute rounded-full bg-black"
        style={{
          width: wheelSize,
          height: wheelSize,
          left: `calc(50% - ${wheelSize / 2}px)`,
          top: `calc(50% - ${wheelSize / 2}px)`,
          zIndex: 4,
        }}
      />

      {/* Llanta */}
      <motion.img
        src={wheelImg}
        alt="llanta"
        className="absolute object-contain pointer-events-none"
        style={{
          width: wheelSize,
          height: wheelSize,
          left: `calc(50% - ${wheelSize / 2}px)`,
          top: `calc(50% - ${wheelSize / 2}px)`,
          zIndex: 5,
          rotate: angle,
        }}
        transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
        draggable={false}
      />

      {/* Cards */}
      {cards}

      {/* Puntos rojos */}
      {points}
    </div>
  );
};

export default WheelComponent;
