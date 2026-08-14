import { jest } from "@jest/globals";

export const mockRemove = jest.fn();
export const mockAddControl = jest.fn();
export const mockOn = jest.fn();
export const mockCanvasStyle: { cursor: string } = { cursor: "" };
export const mockGetCanvas = jest.fn(() => ({ style: mockCanvasStyle }));

export const Map = jest.fn().mockImplementation(() => ({
  addControl: mockAddControl,
  remove: mockRemove,
  on: mockOn,
  getCanvas: mockGetCanvas,
}));

export const triggerMapClick = (a_LngLat: { lat: number; lng: number }) => {
  const clickCall = mockOn.mock.calls.find(
    (a_Call) => a_Call[0] === "click",
  ) as
    [string, (e: { lngLat: { lat: number; lng: number } }) => void] | undefined;
  clickCall?.[1]({ lngLat: a_LngLat });
};

export const NavigationControl = jest.fn();

export const mockMarkerRemove = jest.fn();
export const mockSetLngLat = jest.fn();
export const mockSetPopup = jest.fn();
export const mockMarkerAddTo = jest.fn();

export const Marker = jest.fn().mockImplementation(() => {
  const marker = {
    setLngLat: mockSetLngLat,
    setPopup: mockSetPopup,
    addTo: mockMarkerAddTo,
    remove: mockMarkerRemove,
  };
  mockSetLngLat.mockImplementation(() => marker);
  mockSetPopup.mockImplementation(() => marker);
  mockMarkerAddTo.mockImplementation(() => marker);
  return marker;
});

export const mockSetText = jest.fn();

export const Popup = jest.fn().mockImplementation(() => ({
  setText: mockSetText.mockImplementation(() => ({})),
}));
