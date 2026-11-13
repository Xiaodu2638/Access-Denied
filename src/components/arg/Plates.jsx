import React, { useId } from "react";
import "./plates.scss";

// 没有美术素材，所有“照片”和远程桌面背景都用内联 SVG 画。
// 画面只提供气氛，不放任何文字线索。

const Scenery = ({ variant, sky, sky2, far, near, water, uid }) => {
  const common = (
    <>
      <rect width="1200" height="675" fill={`url(#${uid}-sky)`} />
      <circle cx="946" cy="132" r="46" fill="#f2d9a6" opacity="0.28" />
    </>
  );

  if (variant === "school") {
    return (
      <>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky} />
            <stop offset="1" stopColor={sky2} />
          </linearGradient>
        </defs>
        {common}
        <path d="M0 420 L180 350 L330 400 L470 330 L620 410 L790 350 L960 400 L1200 330 V675 H0 Z" fill={far} />
        <path d="M0 500 L220 455 L420 505 L640 450 L860 500 L1050 460 L1200 490 V675 H0 Z" fill={near} />
        <rect x="360" y="392" width="420" height="164" fill="#2a2521" />
        <path d="M340 392 L570 320 L800 392 Z" fill="#1d1916" />
        <rect x="392" y="428" width="52" height="46" fill="#d9a45b" opacity="0.75" />
        <rect x="472" y="428" width="52" height="46" fill="#d9a45b" opacity="0.75" />
        <rect x="616" y="428" width="52" height="46" fill="#d9a45b" opacity="0.55" />
        <rect x="696" y="428" width="52" height="46" fill="#d9a45b" opacity="0.75" />
        <rect x="548" y="488" width="46" height="68" fill="#151210" />
        <rect x="338" y="330" width="4" height="92" fill="#3a332c" />
        <path d="M342 336 L392 350 L342 366 Z" fill="#a34b3f" />
        <path d="M0 556 H1200 V675 H0 Z" fill="#3b352d" />
        <path d="M120 556 H1080" stroke="#4d463b" strokeWidth="2" />
      </>
    );
  }

  if (variant === "flooded") {
    return (
      <>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky} />
            <stop offset="1" stopColor={sky2} />
          </linearGradient>
          <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={water} />
            <stop offset="1" stopColor="#101c22" />
          </linearGradient>
        </defs>
        {common}
        <path d="M0 430 L240 365 L430 420 L660 355 L900 418 L1200 360 V675 H0 Z" fill={far} />
        <rect x="0" y="470" width="1200" height="205" fill={`url(#${uid}-water)`} />
        <path d="M180 470 V400 H300 V470" fill="#261f1b" />
        <path d="M160 404 L240 366 L320 404 Z" fill="#1b1714" />
        <rect x="196" y="428" width="34" height="30" fill="#d9a45b" opacity="0.5" />
        <path d="M760 470 V390 H900 V470" fill="#221c18" />
        <path d="M740 394 L830 352 L920 394 Z" fill="#191512" />
        <rect x="790" y="420" width="36" height="28" fill="#d9a45b" opacity="0.4" />
        <path d="M470 470 V392" stroke="#1d1815" strokeWidth="14" />
        <circle cx="470" cy="360" r="58" fill="#18251f" />
        <circle cx="430" cy="386" r="38" fill="#15211c" />
        <circle cx="512" cy="390" r="34" fill="#15211c" />
        <path d="M300 442 H980" stroke="#d8c9a4" strokeWidth="3" opacity="0.55" />
        <path d="M0 548 C180 536 300 560 470 550 C660 538 940 566 1200 546" stroke="#2c4a54" strokeWidth="2" fill="none" opacity="0.7" />
      </>
    );
  }

  if (variant === "night") {
    return (
      <>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky} />
            <stop offset="1" stopColor={sky2} />
          </linearGradient>
        </defs>
        {common}
        {[
          [120, 90],
          [260, 150],
          [410, 70],
          [560, 190],
          [700, 110],
          [860, 60],
          [1030, 160],
          [1120, 90],
          [330, 240],
          [760, 260],
        ].map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 2 : 1.3} fill="#cfe3f5" opacity="0.7" />
        ))}
        <path d="M0 440 L210 370 L390 430 L610 360 L830 426 L1030 380 L1200 430 V675 H0 Z" fill={far} />
        <path d="M0 520 L250 470 L500 525 L760 465 L980 520 L1200 480 V675 H0 Z" fill={near} />
        <rect x="0" y="600" width="1200" height="75" fill="#070c12" />
        <rect x="180" y="536" width="8" height="5" fill="#e3b566" opacity="0.8" />
        <rect x="352" y="556" width="7" height="4" fill="#e3b566" opacity="0.6" />
        <rect x="804" y="540" width="8" height="5" fill="#e3b566" opacity="0.7" />
      </>
    );
  }

  // valley / default：老石桥与河。
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={water} />
          <stop offset="1" stopColor="#101d24" />
        </linearGradient>
      </defs>
      {common}
      <path d="M0 400 L170 320 L340 388 L520 300 L700 382 L900 318 L1080 392 L1200 350 V675 H0 Z" fill={far} />
      <path d="M0 492 L260 430 L470 496 L700 424 L930 494 L1130 442 L1200 470 V675 H0 Z" fill={near} />
      <rect x="0" y="540" width="1200" height="135" fill={`url(#${uid}-water)`} />
      <path d="M0 566 C160 552 320 580 480 566 C660 550 840 584 1010 566 C1100 556 1160 564 1200 560" stroke="#3a6270" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M240 540 H860" stroke="#c2a06a" strokeWidth="9" />
      <path d="M240 540 V500 M860 540 V500" stroke="#a6895b" strokeWidth="7" />
      <path d="M300 540 V512 M400 540 V506 M500 540 V506 M600 540 V506 M700 540 V506 M800 540 V512" stroke="#8f7752" strokeWidth="4" />
      <path d="M300 512 H400 M400 506 H500 M500 506 H600 M600 506 H700 M700 506 H800" stroke="#b09163" strokeWidth="4" />
      <path d="M520 405 L560 380 L600 405" stroke="#d8c9a4" strokeWidth="3" fill="none" opacity="0.5" />
    </>
  );
};

export const Plate = ({ variant = "default", className = "" }) => {
  const uid = useId().replace(/:/g, "");

  const palette =
    variant === "school"
      ? {
          sky: "#1c2431",
          sky2: "#6a4f38",
          far: "#243039",
          near: "#1b242a",
        }
      : variant === "flooded"
        ? {
            sky: "#0c141a",
            sky2: "#3a4b50",
            far: "#152127",
            near: "#10191e",
            water: "#27444f",
          }
        : variant === "night"
          ? {
              sky: "#04070d",
              sky2: "#111c2b",
              far: "#0c141d",
              near: "#080e15",
            }
          : {
              sky: "#0c1722",
              sky2: "#3d4f52",
              far: "#14242c",
              near: "#0e1a20",
              water: "#2a4b57",
            };

  return (
    <svg
      className={`arg-plate ${className}`}
      viewBox="0 0 1200 675"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <Scenery variant={variant} uid={uid} {...palette} />
    </svg>
  );
};

export const PlateBackdrop = ({ variant = "default" }) => (
  <div className="arg-plate-backdrop" aria-hidden="true">
    <Plate variant={variant} />
    <div className="arg-plate-shade" />
  </div>
);

export const plateVariantOf = (host) =>
  host === "zhou" ? "night" : host === "chenmo" ? "valley" : "default";

export default Plate;
