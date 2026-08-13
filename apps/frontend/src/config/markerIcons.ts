import gasStationSvg from "@/assets/img/gas-station.svg?raw";


const STATION_BADGE_SIZE = 34;
const STATION_ICON_SIZE = 20;
const STATION_BORDER_COLOR = "#2F2F33"; // matches the icon's own outline color

// Creates a station pin: a white circular badge holding the gas-station icon.
export const createStationMarkerElement = (): HTMLElement => {
  const badge = document.createElement("div");
  badge.style.width = `${STATION_BADGE_SIZE}px`;
  badge.style.height = `${STATION_BADGE_SIZE}px`;
  badge.style.borderRadius = "50%";
  badge.style.backgroundColor = "#ffd49e";
  badge.style.border = `1.5px solid ${STATION_BORDER_COLOR}`;
  badge.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.35)";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.cursor = "pointer";

  const icon = document.createElement("div");
  icon.style.width = `${STATION_ICON_SIZE}px`;
  icon.style.height = `${STATION_ICON_SIZE}px`;
  icon.innerHTML = gasStationSvg;

  const svg = icon.querySelector("svg");
  if (svg) {
    svg.setAttribute("width", String(STATION_ICON_SIZE));
    svg.setAttribute("height", String(STATION_ICON_SIZE));
  }

  badge.appendChild(icon);
  return badge;
};

const CENTER_DOT_COLOR = "#4ade80"; // light green
const CENTER_HALO_COLOR = "rgba(74, 222, 128, 0.28)";
let centerMarkerStyleInjected = false;

// The pulse keyframes only need to exist once per page, not per marker.
const injectCenterMarkerStyle = () => {
  if (centerMarkerStyleInjected) return;
  centerMarkerStyleInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes tank-radar-center-pulse {
      0% { transform: scale(0.8); opacity: 0.7; }
      70% { transform: scale(2); opacity: 0; }
      100% { transform: scale(2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

// Creates the "you picked this point" marker: a soft pulsing halo behind a
// solid light-green dot - visually distinct from station pins on purpose,
// since this point isn't a station.
export const createCenterMarkerElement = (): HTMLElement => {
  injectCenterMarkerStyle();

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "18px";
  wrapper.style.height = "18px";

  const halo = document.createElement("div");
  halo.style.position = "absolute";
  halo.style.inset = "0";
  halo.style.borderRadius = "50%";
  halo.style.backgroundColor = CENTER_HALO_COLOR;
  halo.style.animation = "tank-radar-center-pulse 1.8s ease-out infinite";

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.inset = "0";
  dot.style.borderRadius = "50%";
  dot.style.backgroundColor = CENTER_DOT_COLOR;
  dot.style.border = "2px solid #ffffff";
  dot.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.35)";

  wrapper.appendChild(halo);
  wrapper.appendChild(dot);
  return wrapper;
};
