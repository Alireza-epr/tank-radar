// maplibre-gl@6.x is a pure-ESM package (no "require" condition in its
// exports map), so Jest's default CJS module resolution can't load the
// real thing at all - not even jest.mock()'s factory form, since that
// still needs to resolve the real module path first. jest.config.ts's
// moduleNameMapper redirects every "maplibre-gl" import to this file
// instead, so the real package is never touched during tests.
import { jest } from "@jest/globals";

export const mockRemove = jest.fn();
export const mockAddControl = jest.fn();

export const Map = jest.fn().mockImplementation(() => ({
  addControl: mockAddControl,
  remove: mockRemove,
}));

export const NavigationControl = jest.fn();
