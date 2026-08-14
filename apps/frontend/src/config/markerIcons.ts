import gasStationSvg from "@/assets/img/gas-station.svg?raw";

const STATION_BADGE_SIZE = 34;
const STATION_ICON_SIZE = 20;
const STATION_BORDER_COLOR = "#2F2F33"; // matches the icon's own outline color
const STATION_BADGE_COLOR = "#ffd49e";
const STATION_BADGE_COLOR_SELECTED = "#ff9f40";

export const createStationMarkerElement = (
  a_IsSelected = false,
  a_OnClick?: () => void,
  a_ObjectId?: number,
): HTMLElement => {
  const badge = document.createElement("div");
  if (a_ObjectId !== undefined) badge.dataset.objectid = String(a_ObjectId);
  badge.style.width = `${STATION_BADGE_SIZE}px`;
  badge.style.height = `${STATION_BADGE_SIZE}px`;
  badge.style.borderRadius = "50%";
  badge.style.backgroundColor = a_IsSelected
    ? STATION_BADGE_COLOR_SELECTED
    : STATION_BADGE_COLOR;
  badge.style.border = a_IsSelected
    ? `2.5px solid ${STATION_BORDER_COLOR}`
    : `1.5px solid ${STATION_BORDER_COLOR}`;
  badge.style.boxShadow = a_IsSelected
    ? "0 2px 6px rgba(0, 0, 0, 0.45)"
    : "0 1px 4px rgba(0, 0, 0, 0.35)";
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

  if (a_OnClick) {
    badge.addEventListener("click", a_OnClick);
  }

  return badge;
};
