import { useRef, useState, TouchEvent } from "react";
import { useControlStore } from "./control-game-store";

const DEADZONE = 8;
const MAX_DRAG = 60;

function clampToRadius(dx: number, dy: number, r = MAX_DRAG) {
  const len = Math.hypot(dx, dy);
  if (len <= r) return { x: dx, y: dy };
  const k = r / len;
  return { x: dx * k, y: dy * k };
}

const JoystickController = () => {
  const areaRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const { setAll, setJump, setRun } = useControlStore();

  const centerFlags = () => {
    setAll({
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
    });
    setRun(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    // старт лише якщо доторк у межах кола
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setPos({ x: 0, y: 0 });
      setActive(true);
      centerFlags();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!active) return;
    const touch = e.touches[0];
    const dx = touch.clientX - originRef.current.x;
    const dy = touch.clientY - originRef.current.y;

    const dist = Math.hypot(dx, dy);
    if (dist < DEADZONE) {
      setPos({ x: 0, y: 0 });
      centerFlags();
      return;
    }

    // позиція ноба в межах радіуса
    const { x, y } = clampToRadius(dx, dy, MAX_DRAG);
    setPos({ x, y });

    // напрями: X вправо/вліво, Y — інвертований (вгору = від’ємний dy)
    const forward = y < -DEADZONE;
    const backward = y > DEADZONE;
    const rightward = x > DEADZONE;
    const leftward = x < -DEADZONE;

    setAll({ forward, backward, leftward, rightward });
    setRun(dist > 30);
  };

  const handleTouchEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    centerFlags();
  };

  // якщо все ж потрібен кут (для візуального повороту іконки), рахуємо з інверсією Y:
  // const angleRad = Math.atan2(-pos.y, pos.x); // 0° = вправо, 90° = вгору

  return (
    <>
      <div
        ref={areaRef}
        className="fixed bottom-6 left-6 w-[100px] h-[100px] z-[10000] touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full rounded-full border border-black/30 bg-white/10">
          <div
            className="absolute w-[50px] h-[50px] top-1/2 left-1/2 rounded-full bg-black/60"
            // не змішуємо transform з класами — усе в одному стилі:
            style={{
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[10000] touch-none">
        <button
          className="w-[60px] h-[60px] rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md active:scale-95 transition-transform"
          onTouchStart={() => setJump(true)}
          onTouchEnd={() => setJump(false)}
        >
          Jump
        </button>
      </div>
    </>
  );
};

export default JoystickController;
