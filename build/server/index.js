var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, Link as Link$1, useRouteError, Await, useFetcher, useRevalidator } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect, defer } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, PureComponent, useCallback, useMemo, forwardRef, Component, memo, useId, useImperativeHandle, createElement, isValidElement, Children, createRef, useReducer, Suspense } from "react";
import { themes, breakpointsAliases, themeNameDefault, createThemeClassName, themeDefault, getMediaConditions, themeNames } from "@shopify/polaris-tokens";
import { createHmac, timingSafeEqual } from "crypto";
import { SelectIcon, ChevronDownIcon, ChevronUpIcon, AlertCircleIcon, XCircleIcon, SearchIcon, MenuHorizontalIcon, MinusIcon, InfoIcon, AlertDiamondIcon, AlertTriangleIcon, CheckIcon, XIcon, ArrowLeftIcon, SortDescendingIcon, SortAscendingIcon, ChevronLeftIcon, ChevronRightIcon, RefreshIcon, CheckCircleIcon, SettingsIcon, NotificationIcon, ClockIcon, ProductIcon } from "@shopify/polaris-icons";
import { createPortal } from "react-dom";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import { Transition, CSSTransition, TransitionGroup } from "react-transition-group";
import isEqual from "react-fast-compare";
const prisma$1 = global.__prisma ?? new PrismaClient({
  // log: ['query', 'error', 'warn'], // 必要なら一時的に有効化
});
if (process.env.NODE_ENV !== "production") global.__prisma = prisma$1;
const scopeList = (process.env.SCOPES || "").split(",").map((s) => s.trim()).filter(Boolean);
const appUrl = (process.env.SHOPIFY_APP_URL || "").replace(/\/+$/, "");
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: scopeList,
  appUrl,
  // PartnersのApp URLと完全一致させる
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma$1),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true
    // REST使うなら false に
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.January25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
let Key = /* @__PURE__ */ (function(Key2) {
  Key2[Key2["Backspace"] = 8] = "Backspace";
  Key2[Key2["Tab"] = 9] = "Tab";
  Key2[Key2["Enter"] = 13] = "Enter";
  Key2[Key2["Shift"] = 16] = "Shift";
  Key2[Key2["Ctrl"] = 17] = "Ctrl";
  Key2[Key2["Alt"] = 18] = "Alt";
  Key2[Key2["Pause"] = 19] = "Pause";
  Key2[Key2["CapsLock"] = 20] = "CapsLock";
  Key2[Key2["Escape"] = 27] = "Escape";
  Key2[Key2["Space"] = 32] = "Space";
  Key2[Key2["PageUp"] = 33] = "PageUp";
  Key2[Key2["PageDown"] = 34] = "PageDown";
  Key2[Key2["End"] = 35] = "End";
  Key2[Key2["Home"] = 36] = "Home";
  Key2[Key2["LeftArrow"] = 37] = "LeftArrow";
  Key2[Key2["UpArrow"] = 38] = "UpArrow";
  Key2[Key2["RightArrow"] = 39] = "RightArrow";
  Key2[Key2["DownArrow"] = 40] = "DownArrow";
  Key2[Key2["Insert"] = 45] = "Insert";
  Key2[Key2["Delete"] = 46] = "Delete";
  Key2[Key2["Key0"] = 48] = "Key0";
  Key2[Key2["Key1"] = 49] = "Key1";
  Key2[Key2["Key2"] = 50] = "Key2";
  Key2[Key2["Key3"] = 51] = "Key3";
  Key2[Key2["Key4"] = 52] = "Key4";
  Key2[Key2["Key5"] = 53] = "Key5";
  Key2[Key2["Key6"] = 54] = "Key6";
  Key2[Key2["Key7"] = 55] = "Key7";
  Key2[Key2["Key8"] = 56] = "Key8";
  Key2[Key2["Key9"] = 57] = "Key9";
  Key2[Key2["KeyA"] = 65] = "KeyA";
  Key2[Key2["KeyB"] = 66] = "KeyB";
  Key2[Key2["KeyC"] = 67] = "KeyC";
  Key2[Key2["KeyD"] = 68] = "KeyD";
  Key2[Key2["KeyE"] = 69] = "KeyE";
  Key2[Key2["KeyF"] = 70] = "KeyF";
  Key2[Key2["KeyG"] = 71] = "KeyG";
  Key2[Key2["KeyH"] = 72] = "KeyH";
  Key2[Key2["KeyI"] = 73] = "KeyI";
  Key2[Key2["KeyJ"] = 74] = "KeyJ";
  Key2[Key2["KeyK"] = 75] = "KeyK";
  Key2[Key2["KeyL"] = 76] = "KeyL";
  Key2[Key2["KeyM"] = 77] = "KeyM";
  Key2[Key2["KeyN"] = 78] = "KeyN";
  Key2[Key2["KeyO"] = 79] = "KeyO";
  Key2[Key2["KeyP"] = 80] = "KeyP";
  Key2[Key2["KeyQ"] = 81] = "KeyQ";
  Key2[Key2["KeyR"] = 82] = "KeyR";
  Key2[Key2["KeyS"] = 83] = "KeyS";
  Key2[Key2["KeyT"] = 84] = "KeyT";
  Key2[Key2["KeyU"] = 85] = "KeyU";
  Key2[Key2["KeyV"] = 86] = "KeyV";
  Key2[Key2["KeyW"] = 87] = "KeyW";
  Key2[Key2["KeyX"] = 88] = "KeyX";
  Key2[Key2["KeyY"] = 89] = "KeyY";
  Key2[Key2["KeyZ"] = 90] = "KeyZ";
  Key2[Key2["LeftMeta"] = 91] = "LeftMeta";
  Key2[Key2["RightMeta"] = 92] = "RightMeta";
  Key2[Key2["Select"] = 93] = "Select";
  Key2[Key2["Numpad0"] = 96] = "Numpad0";
  Key2[Key2["Numpad1"] = 97] = "Numpad1";
  Key2[Key2["Numpad2"] = 98] = "Numpad2";
  Key2[Key2["Numpad3"] = 99] = "Numpad3";
  Key2[Key2["Numpad4"] = 100] = "Numpad4";
  Key2[Key2["Numpad5"] = 101] = "Numpad5";
  Key2[Key2["Numpad6"] = 102] = "Numpad6";
  Key2[Key2["Numpad7"] = 103] = "Numpad7";
  Key2[Key2["Numpad8"] = 104] = "Numpad8";
  Key2[Key2["Numpad9"] = 105] = "Numpad9";
  Key2[Key2["Multiply"] = 106] = "Multiply";
  Key2[Key2["Add"] = 107] = "Add";
  Key2[Key2["Subtract"] = 109] = "Subtract";
  Key2[Key2["Decimal"] = 110] = "Decimal";
  Key2[Key2["Divide"] = 111] = "Divide";
  Key2[Key2["F1"] = 112] = "F1";
  Key2[Key2["F2"] = 113] = "F2";
  Key2[Key2["F3"] = 114] = "F3";
  Key2[Key2["F4"] = 115] = "F4";
  Key2[Key2["F5"] = 116] = "F5";
  Key2[Key2["F6"] = 117] = "F6";
  Key2[Key2["F7"] = 118] = "F7";
  Key2[Key2["F8"] = 119] = "F8";
  Key2[Key2["F9"] = 120] = "F9";
  Key2[Key2["F10"] = 121] = "F10";
  Key2[Key2["F11"] = 122] = "F11";
  Key2[Key2["F12"] = 123] = "F12";
  Key2[Key2["NumLock"] = 144] = "NumLock";
  Key2[Key2["ScrollLock"] = 145] = "ScrollLock";
  Key2[Key2["Semicolon"] = 186] = "Semicolon";
  Key2[Key2["Equals"] = 187] = "Equals";
  Key2[Key2["Comma"] = 188] = "Comma";
  Key2[Key2["Dash"] = 189] = "Dash";
  Key2[Key2["Period"] = 190] = "Period";
  Key2[Key2["ForwardSlash"] = 191] = "ForwardSlash";
  Key2[Key2["GraveAccent"] = 192] = "GraveAccent";
  Key2[Key2["OpenBracket"] = 219] = "OpenBracket";
  Key2[Key2["BackSlash"] = 220] = "BackSlash";
  Key2[Key2["CloseBracket"] = 221] = "CloseBracket";
  Key2[Key2["SingleQuote"] = 222] = "SingleQuote";
  return Key2;
})({});
const scrollable = {
  props: {
    "data-polaris-scrollable": true
  },
  selector: "[data-polaris-scrollable]"
};
const overlay = {
  props: {
    "data-polaris-overlay": true
  }
};
const layer = {
  props: {
    "data-polaris-layer": true
  },
  selector: "[data-polaris-layer]"
};
const unstyled = {
  props: {
    "data-polaris-unstyled": true
  }
};
const dataPolarisTopBar = {
  selector: "[data-polaris-top-bar]"
};
const headerCell = {
  props: {
    "data-polaris-header-cell": true
  },
  selector: "[data-polaris-header-cell]"
};
const portal = {
  selector: "[data-portal-id]"
};
const ThemeContext = /* @__PURE__ */ createContext(null);
const ThemeNameContext = /* @__PURE__ */ createContext(null);
function getTheme(themeName) {
  return themes[themeName];
}
function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("No theme was provided. Your application must be wrapped in an <AppProvider> or <ThemeProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return theme;
}
function useThemeName() {
  const themeName = useContext(ThemeNameContext);
  if (!themeName) {
    throw new Error("No themeName was provided. Your application must be wrapped in an <AppProvider> or <ThemeProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return themeName;
}
function isObject(value) {
  const type = typeof value;
  return value != null && (type === "object" || type === "function");
}
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function variationName(name, value) {
  return `${name}${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
function sanitizeCustomProperties(styles2) {
  const nonNullValues = Object.entries(styles2).filter(([_, value]) => value != null);
  return nonNullValues.length ? Object.fromEntries(nonNullValues) : void 0;
}
function getResponsiveProps(componentName, componentProp, tokenSubgroup, responsiveProp) {
  if (!responsiveProp) return {};
  let result;
  if (!isObject(responsiveProp)) {
    result = {
      [breakpointsAliases[0]]: `var(--p-${tokenSubgroup}-${responsiveProp})`
    };
  } else {
    result = Object.fromEntries(Object.entries(responsiveProp).map(([breakpointAlias, aliasOrScale]) => [breakpointAlias, `var(--p-${tokenSubgroup}-${aliasOrScale})`]));
  }
  return Object.fromEntries(Object.entries(result).map(([breakpointAlias, value]) => [`--pc-${componentName}-${componentProp}-${breakpointAlias}`, value]));
}
function getResponsiveValue(componentName, componentProp, responsiveProp) {
  if (!responsiveProp) return {};
  if (!isObject(responsiveProp)) {
    return {
      [`--pc-${componentName}-${componentProp}-${breakpointsAliases[0]}`]: responsiveProp
    };
  }
  return Object.fromEntries(Object.entries(responsiveProp).map(([breakpointAlias, responsiveValue]) => [`--pc-${componentName}-${componentProp}-${breakpointAlias}`, responsiveValue]));
}
var styles$T = {
  "themeContainer": "Polaris-ThemeProvider--themeContainer"
};
const themeNamesLocal = ["light", "dark-experimental"];
const isThemeNameLocal = (name) => themeNamesLocal.includes(name);
function ThemeProvider(props) {
  const {
    as: ThemeContainer = "div",
    children,
    className,
    theme: themeName = themeNameDefault
  } = props;
  return /* @__PURE__ */ React.createElement(ThemeNameContext.Provider, {
    value: themeName
  }, /* @__PURE__ */ React.createElement(ThemeContext.Provider, {
    value: getTheme(themeName)
  }, /* @__PURE__ */ React.createElement(ThemeContainer, {
    "data-portal-id": props["data-portal-id"],
    className: classNames(createThemeClassName(themeName), styles$T.themeContainer, className)
  }, children)));
}
const WithinContentContext = /* @__PURE__ */ createContext(false);
const isServer = typeof window === "undefined" || typeof document === "undefined";
const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
function useEventListener(eventName, handler, target, options) {
  const handlerRef = useRef(handler);
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    if (!(typeof eventName === "string" && target !== null)) return;
    let targetElement;
    if (typeof target === "undefined") {
      targetElement = window;
    } else if ("current" in target) {
      if (target.current === null) return;
      targetElement = target.current;
    } else {
      targetElement = target;
    }
    const eventOptions = optionsRef.current;
    const eventListener = (event) => handlerRef.current(event);
    targetElement.addEventListener(eventName, eventListener, eventOptions);
    return () => {
      targetElement.removeEventListener(eventName, eventListener, eventOptions);
    };
  }, [eventName, target]);
}
const Breakpoints = {
  // TODO: Update to smDown
  navigationBarCollapsed: "767.95px",
  // TODO: Update to lgDown
  stackedContent: "1039.95px"
};
const noWindowMatches = {
  media: "",
  addListener: noop$5,
  removeListener: noop$5,
  matches: false,
  onchange: noop$5,
  addEventListener: noop$5,
  removeEventListener: noop$5,
  dispatchEvent: (_) => true
};
function noop$5() {
}
function navigationBarCollapsed() {
  return isServer ? noWindowMatches : window.matchMedia(`(max-width: ${Breakpoints.navigationBarCollapsed})`);
}
function stackedContent() {
  return isServer ? noWindowMatches : window.matchMedia(`(max-width: ${Breakpoints.stackedContent})`);
}
const hookCallbacks = /* @__PURE__ */ new Set();
const breakpointsQueryEntries = getBreakpointsQueryEntries(themeDefault.breakpoints);
if (!isServer) {
  breakpointsQueryEntries.forEach(([breakpointAlias, query]) => {
    const eventListener = (event) => {
      for (const hookCallback of hookCallbacks) {
        hookCallback(breakpointAlias, event.matches);
      }
    };
    const mql = window.matchMedia(query);
    if (mql.addListener) {
      mql.addListener(eventListener);
    } else {
      mql.addEventListener("change", eventListener);
    }
  });
}
function getDefaultMatches(defaults) {
  return Object.fromEntries(breakpointsQueryEntries.map(([directionAlias]) => [directionAlias, false]));
}
function getLiveMatches() {
  return Object.fromEntries(breakpointsQueryEntries.map(([directionAlias, query]) => [directionAlias, window.matchMedia(query).matches]));
}
function useBreakpoints(options) {
  const [breakpoints, setBreakpoints] = useState(getDefaultMatches());
  useIsomorphicLayoutEffect(() => {
    setBreakpoints(getLiveMatches());
    const callback = (breakpointAlias, matches2) => {
      setBreakpoints((prevBreakpoints) => ({
        ...prevBreakpoints,
        [breakpointAlias]: matches2
      }));
    };
    hookCallbacks.add(callback);
    return () => {
      hookCallbacks.delete(callback);
    };
  }, []);
  return breakpoints;
}
function getBreakpointsQueryEntries(breakpoints) {
  const mediaConditionEntries = Object.entries(getMediaConditions(breakpoints));
  return mediaConditionEntries.map(([breakpointsToken, mediaConditions]) => Object.entries(mediaConditions).map(([direction, mediaCondition]) => {
    const breakpointsAlias = breakpointsToken.split("-")[1];
    const directionAlias = `${breakpointsAlias}${capitalize(direction)}`;
    return [directionAlias, mediaCondition];
  })).flat();
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function debounce(func, waitArg, options) {
  let lastArgs;
  let lastThis;
  let maxWait;
  let result;
  let timerId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;
  const useRAF = !waitArg && waitArg !== 0;
  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  const wait = waitArg || 0;
  if (typeof options === "object") {
    leading = Boolean(options.leading);
    maxing = "maxWait" in options;
    maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : void 0;
    trailing = "trailing" in options ? Boolean(options.trailing) : trailing;
  }
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = void 0;
    lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function startTimer(pendingFunc, wait2) {
    if (useRAF) {
      cancelAnimationFrame(timerId);
      return requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, wait2);
  }
  function cancelTimer(id) {
    if (useRAF) {
      return cancelAnimationFrame(id);
    }
    clearTimeout(id);
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxing && maxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && maxWait && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(Date.now());
  }
  function pending() {
    return timerId !== void 0;
  }
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}
class Rect {
  static get zero() {
    return new Rect();
  }
  constructor({
    top = 0,
    left = 0,
    width = 0,
    height = 0
  } = {}) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
  }
  get center() {
    return {
      x: this.left + this.width / 2,
      y: this.top + this.height / 2
    };
  }
}
function getRectForNode(node) {
  try {
    const rect = node.getBoundingClientRect();
    return new Rect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });
  } catch (_) {
    return new Rect({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
}
const SIXTY_FPS = 1e3 / 60;
class StickyManager {
  constructor(container) {
    this.stickyItems = [];
    this.stuckItems = [];
    this.container = null;
    this.topBarOffset = 0;
    this.handleResize = debounce(() => {
      this.manageStickyItems();
    }, SIXTY_FPS, {
      leading: true,
      trailing: true,
      maxWait: SIXTY_FPS
    });
    this.handleScroll = debounce(() => {
      this.manageStickyItems();
    }, SIXTY_FPS, {
      leading: true,
      trailing: true,
      maxWait: SIXTY_FPS
    });
    if (container) {
      this.setContainer(container);
    }
  }
  registerStickyItem(stickyItem) {
    this.stickyItems.push(stickyItem);
  }
  unregisterStickyItem(nodeToRemove) {
    const nodeIndex = this.stickyItems.findIndex(({
      stickyNode
    }) => nodeToRemove === stickyNode);
    this.stickyItems.splice(nodeIndex, 1);
  }
  getStickyItem(node) {
    return this.stickyItems.find(({
      stickyNode
    }) => node === stickyNode);
  }
  setContainer(el) {
    this.container = el;
    if (isDocument$1(el)) {
      this.setTopBarOffset(el);
    }
    this.container.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
    this.manageStickyItems();
  }
  removeScrollListener() {
    if (this.container) {
      this.container.removeEventListener("scroll", this.handleScroll);
      window.removeEventListener("resize", this.handleResize);
    }
  }
  manageStickyItems() {
    if (this.stickyItems.length <= 0) {
      return;
    }
    const scrollTop = this.container ? scrollTopFor(this.container) : 0;
    const containerTop = getRectForNode(this.container).top + this.topBarOffset;
    this.stickyItems.forEach((stickyItem) => {
      const {
        handlePositioning
      } = stickyItem;
      const {
        sticky,
        top,
        left,
        width
      } = this.evaluateStickyItem(stickyItem, scrollTop, containerTop);
      this.updateStuckItems(stickyItem, sticky);
      handlePositioning(sticky, top, left, width);
    });
  }
  evaluateStickyItem(stickyItem, scrollTop, containerTop) {
    var _a;
    const {
      stickyNode,
      placeHolderNode,
      boundingElement,
      offset,
      disableWhenStacked
    } = stickyItem;
    if (disableWhenStacked && stackedContent().matches) {
      return {
        sticky: false,
        top: 0,
        left: 0,
        width: "auto"
      };
    }
    const stickyOffset = offset ? this.getOffset(stickyNode) + parseInt(
      // Important: This will not update when the active theme changes.
      // Update this to `useTheme` once converted to a function component.
      themeDefault.space["space-500"],
      10
    ) : this.getOffset(stickyNode);
    const scrollPosition2 = scrollTop + stickyOffset;
    const placeHolderNodeCurrentTop = placeHolderNode.getBoundingClientRect().top - containerTop + scrollTop;
    const top = containerTop + stickyOffset;
    const width = placeHolderNode.getBoundingClientRect().width;
    const left = placeHolderNode.getBoundingClientRect().left;
    let sticky;
    if (boundingElement == null) {
      sticky = scrollPosition2 >= placeHolderNodeCurrentTop;
    } else {
      const stickyItemHeight = stickyNode.getBoundingClientRect().height || ((_a = stickyNode.firstElementChild) == null ? void 0 : _a.getBoundingClientRect().height) || 0;
      const stickyItemBottomPosition = boundingElement.getBoundingClientRect().bottom - stickyItemHeight + scrollTop - containerTop;
      sticky = scrollPosition2 >= placeHolderNodeCurrentTop && scrollPosition2 < stickyItemBottomPosition;
    }
    return {
      sticky,
      top,
      left,
      width
    };
  }
  updateStuckItems(item, sticky) {
    const {
      stickyNode
    } = item;
    if (sticky && !this.isNodeStuck(stickyNode)) {
      this.addStuckItem(item);
    } else if (!sticky && this.isNodeStuck(stickyNode)) {
      this.removeStuckItem(item);
    }
  }
  addStuckItem(stickyItem) {
    this.stuckItems.push(stickyItem);
  }
  removeStuckItem(stickyItem) {
    const {
      stickyNode: nodeToRemove
    } = stickyItem;
    const nodeIndex = this.stuckItems.findIndex(({
      stickyNode
    }) => nodeToRemove === stickyNode);
    this.stuckItems.splice(nodeIndex, 1);
  }
  getOffset(node) {
    if (this.stuckItems.length === 0) {
      return 0;
    }
    let offset = 0;
    let count = 0;
    const stuckNodesLength = this.stuckItems.length;
    const nodeRect = getRectForNode(node);
    while (count < stuckNodesLength) {
      const stuckNode = this.stuckItems[count].stickyNode;
      if (stuckNode !== node) {
        const stuckNodeRect = getRectForNode(stuckNode);
        if (!horizontallyOverlaps(nodeRect, stuckNodeRect)) {
          offset += getRectForNode(stuckNode).height;
        }
      } else {
        break;
      }
      count++;
    }
    return offset;
  }
  isNodeStuck(node) {
    const nodeFound = this.stuckItems.findIndex(({
      stickyNode
    }) => node === stickyNode);
    return nodeFound >= 0;
  }
  setTopBarOffset(container) {
    const topbarElement = container.querySelector(`:not(${scrollable.selector}) ${dataPolarisTopBar.selector}`);
    this.topBarOffset = topbarElement ? topbarElement.clientHeight : 0;
  }
}
function isDocument$1(node) {
  return node === document;
}
function scrollTopFor(container) {
  return isDocument$1(container) ? document.body.scrollTop || document.documentElement.scrollTop : container.scrollTop;
}
function horizontallyOverlaps(rect1, rect2) {
  const rect1Left = rect1.left;
  const rect1Right = rect1.left + rect1.width;
  const rect2Left = rect2.left;
  const rect2Right = rect2.left + rect2.width;
  return rect2Right < rect1Left || rect1Right < rect2Left;
}
const SCROLL_LOCKING_ATTRIBUTE = "data-lock-scrolling";
const SCROLL_LOCKING_HIDDEN_ATTRIBUTE = "data-lock-scrolling-hidden";
const SCROLL_LOCKING_WRAPPER_ATTRIBUTE = "data-lock-scrolling-wrapper";
let scrollPosition = 0;
function isScrollBarVisible() {
  const {
    body
  } = document;
  return body.scrollHeight > body.clientHeight;
}
class ScrollLockManager {
  constructor() {
    this.scrollLocks = 0;
    this.locked = false;
  }
  registerScrollLock() {
    this.scrollLocks += 1;
    this.handleScrollLocking();
  }
  unregisterScrollLock() {
    this.scrollLocks -= 1;
    this.handleScrollLocking();
  }
  handleScrollLocking() {
    if (isServer) return;
    const {
      scrollLocks
    } = this;
    const {
      body
    } = document;
    const wrapper = body.firstElementChild;
    if (scrollLocks === 0) {
      body.removeAttribute(SCROLL_LOCKING_ATTRIBUTE);
      body.removeAttribute(SCROLL_LOCKING_HIDDEN_ATTRIBUTE);
      if (wrapper) {
        wrapper.removeAttribute(SCROLL_LOCKING_WRAPPER_ATTRIBUTE);
      }
      window.scroll(0, scrollPosition);
      this.locked = false;
    } else if (scrollLocks > 0 && !this.locked) {
      scrollPosition = window.pageYOffset;
      body.setAttribute(SCROLL_LOCKING_ATTRIBUTE, "");
      if (!isScrollBarVisible()) {
        body.setAttribute(SCROLL_LOCKING_HIDDEN_ATTRIBUTE, "");
      }
      if (wrapper) {
        wrapper.setAttribute(SCROLL_LOCKING_WRAPPER_ATTRIBUTE, "");
        wrapper.scrollTop = scrollPosition;
      }
      this.locked = true;
    }
  }
  resetScrollPosition() {
    scrollPosition = 0;
  }
}
const OBJECT_NOTATION_MATCHER = /\[(.*?)\]|(\w+)/g;
function get(obj, keypath, defaultValue) {
  if (obj == null) return void 0;
  const keys = Array.isArray(keypath) ? keypath : getKeypath(keypath);
  let acc = obj;
  for (let i = 0; i < keys.length; i++) {
    const val = acc[keys[i]];
    if (val === void 0) return defaultValue;
    acc = val;
  }
  return acc;
}
function getKeypath(str) {
  const path = [];
  let result;
  while (result = OBJECT_NOTATION_MATCHER.exec(str)) {
    const [, first, second] = result;
    path.push(first || second);
  }
  return path;
}
function merge(...objs) {
  let final = {};
  for (const obj of objs) {
    final = mergeRecursively(final, obj);
  }
  return final;
}
function mergeRecursively(inputObjA, objB) {
  const objA = Array.isArray(inputObjA) ? [...inputObjA] : {
    ...inputObjA
  };
  for (const key in objB) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) {
      continue;
    } else if (isMergeableValue(objB[key]) && isMergeableValue(objA[key])) {
      objA[key] = mergeRecursively(objA[key], objB[key]);
    } else {
      objA[key] = objB[key];
    }
  }
  return objA;
}
function isMergeableValue(value) {
  return value !== null && typeof value === "object";
}
const REPLACE_REGEX$1 = /{([^}]*)}/g;
class I18n {
  /**
   * @param translation A locale object or array of locale objects that overrides default translations. If specifying an array then your desired language dictionary should come first, followed by your fallback language dictionaries
   */
  constructor(translation) {
    this.translation = {};
    this.translation = Array.isArray(translation) ? merge(...translation.slice().reverse()) : translation;
  }
  translate(id, replacements) {
    const text = get(this.translation, id, "");
    if (!text) {
      return "";
    }
    if (replacements) {
      return text.replace(REPLACE_REGEX$1, (match) => {
        const replacement = match.substring(1, match.length - 1);
        if (replacements[replacement] === void 0) {
          const replacementData = JSON.stringify(replacements);
          throw new Error(`Error in translation for key '${id}'. No replacement found for key '${replacement}'. The following replacements were passed: '${replacementData}'`);
        }
        return replacements[replacement];
      });
    }
    return text;
  }
  translationKeyExists(path) {
    return Boolean(get(this.translation, path));
  }
}
const FeaturesContext = /* @__PURE__ */ createContext(void 0);
const I18nContext = /* @__PURE__ */ createContext(void 0);
const ScrollLockManagerContext = /* @__PURE__ */ createContext(void 0);
const StickyManagerContext = /* @__PURE__ */ createContext(void 0);
const LinkContext = /* @__PURE__ */ createContext(void 0);
const MediaQueryContext = /* @__PURE__ */ createContext(void 0);
class EventListener extends PureComponent {
  componentDidMount() {
    this.attachListener();
  }
  componentDidUpdate({
    passive,
    ...detachProps
  }) {
    this.detachListener(detachProps);
    this.attachListener();
  }
  componentWillUnmount() {
    this.detachListener();
  }
  render() {
    return null;
  }
  attachListener() {
    const {
      event,
      handler,
      capture,
      passive,
      window: customWindow
    } = this.props;
    const window2 = customWindow || globalThis.window;
    window2.addEventListener(event, handler, {
      capture,
      passive
    });
  }
  detachListener(prevProps) {
    const {
      event,
      handler,
      capture,
      window: customWindow
    } = prevProps || this.props;
    const window2 = customWindow || globalThis.window;
    window2.removeEventListener(event, handler, capture);
  }
}
const MediaQueryProvider = function MediaQueryProvider2({
  children
}) {
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);
  const handleResize = useCallback(debounce(() => {
    if (isNavigationCollapsed !== navigationBarCollapsed().matches) {
      setIsNavigationCollapsed(!isNavigationCollapsed);
    }
  }, 40, {
    trailing: true,
    leading: true,
    maxWait: 40
  }), [isNavigationCollapsed]);
  useEffect(() => {
    setIsNavigationCollapsed(navigationBarCollapsed().matches);
  }, []);
  const context = useMemo(() => ({
    isNavigationCollapsed
  }), [isNavigationCollapsed]);
  return /* @__PURE__ */ React.createElement(MediaQueryContext.Provider, {
    value: context
  }, /* @__PURE__ */ React.createElement(EventListener, {
    event: "resize",
    handler: handleResize
  }), children);
};
function useIsAfterInitialMount() {
  const [isAfterInitialMount, setIsAfterInitialMount] = useState(false);
  useEffect(() => {
    setIsAfterInitialMount(true);
  }, []);
  return isAfterInitialMount;
}
const PortalsManagerContext = /* @__PURE__ */ createContext(void 0);
function PortalsContainerComponent(_props, ref) {
  return /* @__PURE__ */ React.createElement("div", {
    id: "PolarisPortalsContainer",
    ref
  });
}
const PortalsContainer = /* @__PURE__ */ forwardRef(PortalsContainerComponent);
function PortalsManager({
  children,
  container
}) {
  const isMounted = useIsAfterInitialMount();
  const ref = useRef(null);
  const contextValue = useMemo(() => {
    if (container) {
      return {
        container
      };
    } else if (isMounted) {
      return {
        container: ref.current
      };
    } else {
      return {
        container: null
      };
    }
  }, [container, isMounted]);
  return /* @__PURE__ */ React.createElement(PortalsManagerContext.Provider, {
    value: contextValue
  }, children, container ? null : /* @__PURE__ */ React.createElement(PortalsContainer, {
    ref
  }));
}
const FocusManagerContext = /* @__PURE__ */ createContext(void 0);
function FocusManager({
  children
}) {
  const [trapFocusList, setTrapFocusList] = useState([]);
  const add = useCallback((id) => {
    setTrapFocusList((list) => [...list, id]);
  }, []);
  const remove = useCallback((id) => {
    let removed = true;
    setTrapFocusList((list) => {
      const clone = [...list];
      const index = clone.indexOf(id);
      if (index === -1) {
        removed = false;
      } else {
        clone.splice(index, 1);
      }
      return clone;
    });
    return removed;
  }, []);
  const value = useMemo(() => ({
    trapFocusList,
    add,
    remove
  }), [add, trapFocusList, remove]);
  return /* @__PURE__ */ React.createElement(FocusManagerContext.Provider, {
    value
  }, children);
}
const EphemeralPresenceManagerContext = /* @__PURE__ */ createContext(void 0);
const defaultState = {
  tooltip: 0,
  hovercard: 0
};
function EphemeralPresenceManager({
  children
}) {
  const [presenceCounter, setPresenceCounter] = useState(defaultState);
  const addPresence = useCallback((key) => {
    setPresenceCounter((prevList) => ({
      ...prevList,
      [key]: prevList[key] + 1
    }));
  }, []);
  const removePresence = useCallback((key) => {
    setPresenceCounter((prevList) => ({
      ...prevList,
      [key]: prevList[key] - 1
    }));
  }, []);
  const value = useMemo(() => ({
    presenceList: Object.entries(presenceCounter).reduce((previousValue, currentValue) => {
      const [key, value2] = currentValue;
      return {
        ...previousValue,
        [key]: value2 >= 1
      };
    }, {}),
    presenceCounter,
    addPresence,
    removePresence
  }), [addPresence, removePresence, presenceCounter]);
  return /* @__PURE__ */ React.createElement(EphemeralPresenceManagerContext.Provider, {
    value
  }, children);
}
const MAX_SCROLLBAR_WIDTH = 20;
const SCROLLBAR_TEST_ELEMENT_PARENT_SIZE = 30;
const SCROLLBAR_TEST_ELEMENT_CHILD_SIZE = SCROLLBAR_TEST_ELEMENT_PARENT_SIZE + 10;
function measureScrollbars() {
  var _a;
  const parentEl = document.createElement("div");
  parentEl.setAttribute("style", `position: absolute; opacity: 0; transform: translate3d(-9999px, -9999px, 0); pointer-events: none; width:${SCROLLBAR_TEST_ELEMENT_PARENT_SIZE}px; height:${SCROLLBAR_TEST_ELEMENT_PARENT_SIZE}px;`);
  const child = document.createElement("div");
  child.setAttribute("style", `width:100%; height: ${SCROLLBAR_TEST_ELEMENT_CHILD_SIZE}; overflow:scroll; scrollbar-width: thin;`);
  parentEl.appendChild(child);
  document.body.appendChild(parentEl);
  const scrollbarWidth = SCROLLBAR_TEST_ELEMENT_PARENT_SIZE - (((_a = parentEl.firstElementChild) == null ? void 0 : _a.clientWidth) ?? 0);
  const scrollbarWidthWithSafetyHatch = Math.min(scrollbarWidth, MAX_SCROLLBAR_WIDTH);
  document.documentElement.style.setProperty("--pc-app-provider-scrollbar-width", `${scrollbarWidthWithSafetyHatch}px`);
  document.body.removeChild(parentEl);
}
class AppProvider extends Component {
  constructor(props) {
    super(props);
    this.setBodyStyles = () => {
      document.body.style.backgroundColor = "var(--p-color-bg)";
      document.body.style.color = "var(--p-color-text)";
    };
    this.setRootAttributes = () => {
      const activeThemeName = this.getThemeName();
      themeNames.forEach((themeName) => {
        document.documentElement.classList.toggle(createThemeClassName(themeName), themeName === activeThemeName);
      });
    };
    this.getThemeName = () => this.props.theme ?? themeNameDefault;
    this.stickyManager = new StickyManager();
    this.scrollLockManager = new ScrollLockManager();
    const {
      i18n,
      linkComponent
    } = this.props;
    this.state = {
      link: linkComponent,
      intl: new I18n(i18n)
    };
  }
  componentDidMount() {
    if (document != null) {
      this.stickyManager.setContainer(document);
      this.setBodyStyles();
      this.setRootAttributes();
      const isSafari16 = navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") && (navigator.userAgent.includes("Version/16.1") || navigator.userAgent.includes("Version/16.2") || navigator.userAgent.includes("Version/16.3"));
      const isMobileApp16 = navigator.userAgent.includes("Shopify Mobile/iOS") && (navigator.userAgent.includes("OS 16_1") || navigator.userAgent.includes("OS 16_2") || navigator.userAgent.includes("OS 16_3"));
      if (isSafari16 || isMobileApp16) {
        document.documentElement.classList.add("Polaris-Safari-16-Font-Optical-Sizing-Patch");
      }
    }
    measureScrollbars();
  }
  componentDidUpdate({
    i18n: prevI18n,
    linkComponent: prevLinkComponent
  }) {
    const {
      i18n,
      linkComponent
    } = this.props;
    this.setRootAttributes();
    if (i18n === prevI18n && linkComponent === prevLinkComponent) {
      return;
    }
    this.setState({
      link: linkComponent,
      intl: new I18n(i18n)
    });
  }
  render() {
    const {
      children,
      features = {}
    } = this.props;
    const themeName = this.getThemeName();
    const {
      intl,
      link
    } = this.state;
    return /* @__PURE__ */ React.createElement(ThemeNameContext.Provider, {
      value: themeName
    }, /* @__PURE__ */ React.createElement(ThemeContext.Provider, {
      value: getTheme(themeName)
    }, /* @__PURE__ */ React.createElement(FeaturesContext.Provider, {
      value: features
    }, /* @__PURE__ */ React.createElement(I18nContext.Provider, {
      value: intl
    }, /* @__PURE__ */ React.createElement(ScrollLockManagerContext.Provider, {
      value: this.scrollLockManager
    }, /* @__PURE__ */ React.createElement(StickyManagerContext.Provider, {
      value: this.stickyManager
    }, /* @__PURE__ */ React.createElement(LinkContext.Provider, {
      value: link
    }, /* @__PURE__ */ React.createElement(MediaQueryProvider, null, /* @__PURE__ */ React.createElement(PortalsManager, null, /* @__PURE__ */ React.createElement(FocusManager, null, /* @__PURE__ */ React.createElement(EphemeralPresenceManager, null, children)))))))))));
  }
}
function isElementInViewport(element) {
  const {
    top,
    left,
    bottom,
    right
  } = element.getBoundingClientRect();
  const window2 = element.ownerDocument.defaultView || globalThis.window;
  return top >= 0 && right <= window2.innerWidth && bottom <= window2.innerHeight && left >= 0;
}
const FOCUSABLE_SELECTOR = 'a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not([aria-disabled="true"]):not([tabindex="-1"]):not(:disabled),*[tabindex]';
const KEYBOARD_FOCUSABLE_SELECTORS = 'a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not([aria-disabled="true"]):not([tabindex="-1"]):not(:disabled),*[tabindex]:not([tabindex="-1"])';
const MENUITEM_FOCUSABLE_SELECTORS = 'a[role="menuitem"],frame[role="menuitem"],iframe[role="menuitem"],input[role="menuitem"]:not([type=hidden]):not(:disabled),select[role="menuitem"]:not(:disabled),textarea[role="menuitem"]:not(:disabled),button[role="menuitem"]:not(:disabled),*[tabindex]:not([tabindex="-1"])';
const handleMouseUpByBlurring = ({
  currentTarget
}) => currentTarget.blur();
function nextFocusableNode(node, filter) {
  const allFocusableElements = [...document.querySelectorAll(FOCUSABLE_SELECTOR)];
  const sliceLocation = allFocusableElements.indexOf(node) + 1;
  const focusableElementsAfterNode = allFocusableElements.slice(sliceLocation);
  for (const focusableElement of focusableElementsAfterNode) {
    if (isElementInViewport(focusableElement) && (!filter || filter && filter(focusableElement))) {
      return focusableElement;
    }
  }
  return null;
}
function findFirstFocusableNode(element, onlyDescendants = true) {
  if (!onlyDescendants && matches(element, FOCUSABLE_SELECTOR)) {
    return element;
  }
  return element.querySelector(FOCUSABLE_SELECTOR);
}
function findFirstFocusableNodeIncludingDisabled(element) {
  const focusableSelector = `a,button,frame,iframe,input:not([type=hidden]),select,textarea,*[tabindex]`;
  if (matches(element, focusableSelector)) {
    return element;
  }
  return element.querySelector(focusableSelector);
}
function focusFirstFocusableNode(element, onlyDescendants = true) {
  var _a;
  (_a = findFirstFocusableNode(element, onlyDescendants)) == null ? void 0 : _a.focus();
}
function focusNextFocusableNode(node, filter) {
  const nextFocusable = nextFocusableNode(node, filter);
  if (nextFocusable && nextFocusable instanceof HTMLElement) {
    nextFocusable.focus();
    return true;
  }
  return false;
}
function findFirstKeyboardFocusableNode(element, onlyDescendants = true) {
  if (!onlyDescendants && matches(element, KEYBOARD_FOCUSABLE_SELECTORS)) {
    return element;
  }
  return element.querySelector(KEYBOARD_FOCUSABLE_SELECTORS);
}
function focusFirstKeyboardFocusableNode(element, onlyDescendants = true) {
  const firstFocusable = findFirstKeyboardFocusableNode(element, onlyDescendants);
  if (firstFocusable) {
    firstFocusable.focus();
    return true;
  }
  return false;
}
function findLastKeyboardFocusableNode(element, onlyDescendants = true) {
  if (!onlyDescendants && matches(element, KEYBOARD_FOCUSABLE_SELECTORS)) {
    return element;
  }
  const allFocusable = element.querySelectorAll(KEYBOARD_FOCUSABLE_SELECTORS);
  return allFocusable[allFocusable.length - 1];
}
function focusLastKeyboardFocusableNode(element, onlyDescendants = true) {
  const lastFocusable = findLastKeyboardFocusableNode(element, onlyDescendants);
  if (lastFocusable) {
    lastFocusable.focus();
    return true;
  }
  return false;
}
function wrapFocusPreviousFocusableMenuItem(parentElement, currentFocusedElement) {
  const allFocusableChildren = getMenuFocusableDescendants(parentElement);
  const currentItemIdx = getCurrentFocusedElementIndex(allFocusableChildren, currentFocusedElement);
  if (currentItemIdx === -1) {
    allFocusableChildren[0].focus();
  } else {
    allFocusableChildren[(currentItemIdx - 1 + allFocusableChildren.length) % allFocusableChildren.length].focus();
  }
}
function wrapFocusNextFocusableMenuItem(parentElement, currentFocusedElement) {
  const allFocusableChildren = getMenuFocusableDescendants(parentElement);
  const currentItemIdx = getCurrentFocusedElementIndex(allFocusableChildren, currentFocusedElement);
  if (currentItemIdx === -1) {
    allFocusableChildren[0].focus();
  } else {
    allFocusableChildren[(currentItemIdx + 1) % allFocusableChildren.length].focus();
  }
}
function getMenuFocusableDescendants(element) {
  return element.querySelectorAll(MENUITEM_FOCUSABLE_SELECTORS);
}
function getCurrentFocusedElementIndex(allFocusableChildren, currentFocusedElement) {
  let currentItemIdx = 0;
  for (const focusableChild of allFocusableChildren) {
    if (focusableChild === currentFocusedElement) {
      break;
    }
    currentItemIdx++;
  }
  return currentItemIdx === allFocusableChildren.length ? -1 : currentItemIdx;
}
function matches(node, selector) {
  if (node.matches) {
    return node.matches(selector);
  }
  const matches2 = (node.ownerDocument || document).querySelectorAll(selector);
  let i = matches2.length;
  while (--i >= 0 && matches2.item(i) !== node) return i > -1;
}
var styles$S = {
  "Button": "Polaris-Button",
  "disabled": "Polaris-Button--disabled",
  "pressed": "Polaris-Button--pressed",
  "variantPrimary": "Polaris-Button--variantPrimary",
  "variantSecondary": "Polaris-Button--variantSecondary",
  "variantTertiary": "Polaris-Button--variantTertiary",
  "variantPlain": "Polaris-Button--variantPlain",
  "removeUnderline": "Polaris-Button--removeUnderline",
  "variantMonochromePlain": "Polaris-Button--variantMonochromePlain",
  "toneSuccess": "Polaris-Button--toneSuccess",
  "toneCritical": "Polaris-Button--toneCritical",
  "sizeMicro": "Polaris-Button--sizeMicro",
  "sizeSlim": "Polaris-Button--sizeSlim",
  "sizeMedium": "Polaris-Button--sizeMedium",
  "sizeLarge": "Polaris-Button--sizeLarge",
  "textAlignCenter": "Polaris-Button--textAlignCenter",
  "textAlignStart": "Polaris-Button--textAlignStart",
  "textAlignLeft": "Polaris-Button--textAlignLeft",
  "textAlignEnd": "Polaris-Button--textAlignEnd",
  "textAlignRight": "Polaris-Button--textAlignRight",
  "fullWidth": "Polaris-Button--fullWidth",
  "iconOnly": "Polaris-Button--iconOnly",
  "iconWithText": "Polaris-Button--iconWithText",
  "disclosure": "Polaris-Button--disclosure",
  "loading": "Polaris-Button--loading",
  "pressable": "Polaris-Button--pressable",
  "hidden": "Polaris-Button--hidden",
  "Icon": "Polaris-Button__Icon",
  "Spinner": "Polaris-Button__Spinner"
};
var styles$R = {
  "Icon": "Polaris-Icon",
  "toneInherit": "Polaris-Icon--toneInherit",
  "toneBase": "Polaris-Icon--toneBase",
  "toneSubdued": "Polaris-Icon--toneSubdued",
  "toneCaution": "Polaris-Icon--toneCaution",
  "toneWarning": "Polaris-Icon--toneWarning",
  "toneCritical": "Polaris-Icon--toneCritical",
  "toneInteractive": "Polaris-Icon--toneInteractive",
  "toneInfo": "Polaris-Icon--toneInfo",
  "toneSuccess": "Polaris-Icon--toneSuccess",
  "tonePrimary": "Polaris-Icon--tonePrimary",
  "toneEmphasis": "Polaris-Icon--toneEmphasis",
  "toneMagic": "Polaris-Icon--toneMagic",
  "toneTextCaution": "Polaris-Icon--toneTextCaution",
  "toneTextWarning": "Polaris-Icon--toneTextWarning",
  "toneTextCritical": "Polaris-Icon--toneTextCritical",
  "toneTextInfo": "Polaris-Icon--toneTextInfo",
  "toneTextPrimary": "Polaris-Icon--toneTextPrimary",
  "toneTextSuccess": "Polaris-Icon--toneTextSuccess",
  "toneTextMagic": "Polaris-Icon--toneTextMagic",
  "Svg": "Polaris-Icon__Svg",
  "Img": "Polaris-Icon__Img",
  "Placeholder": "Polaris-Icon__Placeholder"
};
var styles$Q = {
  "root": "Polaris-Text--root",
  "block": "Polaris-Text--block",
  "truncate": "Polaris-Text--truncate",
  "visuallyHidden": "Polaris-Text--visuallyHidden",
  "start": "Polaris-Text--start",
  "center": "Polaris-Text--center",
  "end": "Polaris-Text--end",
  "justify": "Polaris-Text--justify",
  "base": "Polaris-Text--base",
  "inherit": "Polaris-Text--inherit",
  "disabled": "Polaris-Text--disabled",
  "success": "Polaris-Text--success",
  "critical": "Polaris-Text--critical",
  "caution": "Polaris-Text--caution",
  "subdued": "Polaris-Text--subdued",
  "magic": "Polaris-Text--magic",
  "magic-subdued": "Polaris-Text__magic--subdued",
  "text-inverse": "Polaris-Text__text--inverse",
  "text-inverse-secondary": "Polaris-Text--textInverseSecondary",
  "headingXs": "Polaris-Text--headingXs",
  "headingSm": "Polaris-Text--headingSm",
  "headingMd": "Polaris-Text--headingMd",
  "headingLg": "Polaris-Text--headingLg",
  "headingXl": "Polaris-Text--headingXl",
  "heading2xl": "Polaris-Text--heading2xl",
  "heading3xl": "Polaris-Text--heading3xl",
  "bodyXs": "Polaris-Text--bodyXs",
  "bodySm": "Polaris-Text--bodySm",
  "bodyMd": "Polaris-Text--bodyMd",
  "bodyLg": "Polaris-Text--bodyLg",
  "regular": "Polaris-Text--regular",
  "medium": "Polaris-Text--medium",
  "semibold": "Polaris-Text--semibold",
  "bold": "Polaris-Text--bold",
  "break": "Polaris-Text--break",
  "numeric": "Polaris-Text--numeric",
  "line-through": "Polaris-Text__line--through"
};
const deprecatedVariants = {
  heading3xl: "heading2xl"
};
const Text = ({
  alignment,
  as,
  breakWord,
  children,
  tone,
  fontWeight,
  id,
  numeric = false,
  truncate = false,
  variant,
  visuallyHidden = false,
  textDecorationLine
}) => {
  if (process.env.NODE_ENV === "development" && variant && Object.prototype.hasOwnProperty.call(deprecatedVariants, variant)) {
    console.warn(`Deprecation: <Text variant="${variant}" />. The value "${variant}" will be removed in a future major version of Polaris. Use "${deprecatedVariants[variant]}" instead.`);
  }
  const Component2 = as || (visuallyHidden ? "span" : "p");
  const className = classNames(styles$Q.root, variant && styles$Q[variant], fontWeight && styles$Q[fontWeight], (alignment || truncate) && styles$Q.block, alignment && styles$Q[alignment], breakWord && styles$Q.break, tone && styles$Q[tone], numeric && styles$Q.numeric, truncate && styles$Q.truncate, visuallyHidden && styles$Q.visuallyHidden, textDecorationLine && styles$Q[textDecorationLine]);
  return /* @__PURE__ */ React.createElement(Component2, Object.assign({
    className
  }, id && {
    id
  }), children);
};
function Icon({
  source,
  tone,
  accessibilityLabel
}) {
  let sourceType;
  if (typeof source === "function") {
    sourceType = "function";
  } else if (source === "placeholder") {
    sourceType = "placeholder";
  } else {
    sourceType = "external";
  }
  if (tone && sourceType === "external" && process.env.NODE_ENV === "development") {
    console.warn("Recoloring external SVGs is not supported. Set the intended color on your SVG instead.");
  }
  const className = classNames(styles$R.Icon, tone && styles$R[variationName("tone", tone)]);
  const {
    mdDown
  } = useBreakpoints();
  const SourceComponent = source;
  const contentMarkup = {
    function: /* @__PURE__ */ React.createElement(SourceComponent, Object.assign({
      className: styles$R.Svg,
      focusable: "false",
      "aria-hidden": "true"
      // On Mobile we're scaling the viewBox to 18x18 to make the icons bigger
      // Also, we're setting the viewport origin to 1x1 to center the icon
      // We use this syntax so we don't override the existing viewBox value if we don't need to.
    }, mdDown ? {
      viewBox: "1 1 18 18"
    } : {})),
    placeholder: /* @__PURE__ */ React.createElement("div", {
      className: styles$R.Placeholder
    }),
    external: /* @__PURE__ */ React.createElement("img", {
      className: styles$R.Img,
      src: `data:image/svg+xml;utf8,${source}`,
      alt: "",
      "aria-hidden": "true"
    })
  };
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, accessibilityLabel && /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel), contentMarkup[sourceType]);
}
var styles$P = {
  "Spinner": "Polaris-Spinner",
  "sizeSmall": "Polaris-Spinner--sizeSmall",
  "sizeLarge": "Polaris-Spinner--sizeLarge"
};
function Spinner$1({
  size = "large",
  accessibilityLabel,
  hasFocusableParent
}) {
  const isAfterInitialMount = useIsAfterInitialMount();
  const className = classNames(styles$P.Spinner, size && styles$P[variationName("size", size)]);
  const spinnerSVGMarkup = size === "large" ? /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 44 44",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M15.542 1.487A21.507 21.507 0 00.5 22c0 11.874 9.626 21.5 21.5 21.5 9.847 0 18.364-6.675 20.809-16.072a1.5 1.5 0 00-2.904-.756C37.803 34.755 30.473 40.5 22 40.5 11.783 40.5 3.5 32.217 3.5 22c0-8.137 5.3-15.247 12.942-17.65a1.5 1.5 0 10-.9-2.863z"
  })) : /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 20 20",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M7.229 1.173a9.25 9.25 0 1011.655 11.412 1.25 1.25 0 10-2.4-.698 6.75 6.75 0 11-8.506-8.329 1.25 1.25 0 10-.75-2.385z"
  }));
  const spanAttributes = {
    ...!hasFocusableParent && {
      role: "status"
    }
  };
  const accessibilityLabelMarkup = (isAfterInitialMount || !hasFocusableParent) && /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", {
    className
  }, spinnerSVGMarkup), /* @__PURE__ */ React.createElement("span", spanAttributes, accessibilityLabelMarkup));
}
function useDisableClick(disabled, handleClick) {
  const handleClickWrapper = useCallback((event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [disabled]);
  if (!disabled) {
    return handleClick;
  }
  return handleClickWrapper;
}
function useLink() {
  return useContext(LinkContext);
}
const UnstyledLink = /* @__PURE__ */ memo(/* @__PURE__ */ forwardRef(function UnstyledLink2(props, _ref) {
  const LinkComponent = useLink();
  if (LinkComponent) {
    return /* @__PURE__ */ React.createElement(LinkComponent, Object.assign({}, unstyled.props, props, {
      ref: _ref
    }));
  }
  const {
    external,
    url,
    target: targetProp,
    ...rest
  } = props;
  let target;
  if (external) {
    target = "_blank";
  } else {
    target = targetProp ?? void 0;
  }
  const rel = target === "_blank" ? "noopener noreferrer" : void 0;
  return /* @__PURE__ */ React.createElement("a", Object.assign({
    target
  }, rest, {
    href: url,
    rel
  }, unstyled.props, {
    ref: _ref
  }));
}));
function UnstyledButton({
  id,
  children,
  className,
  url,
  external,
  target,
  download,
  submit,
  disabled,
  loading,
  pressed,
  accessibilityLabel,
  role,
  ariaControls,
  ariaExpanded,
  ariaDescribedBy,
  ariaChecked,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  onMouseEnter,
  onTouchStart,
  ...rest
}) {
  let buttonMarkup;
  const commonProps = {
    id,
    className,
    "aria-label": accessibilityLabel
  };
  const interactiveProps = {
    ...commonProps,
    role,
    onClick,
    onFocus,
    onBlur,
    onMouseUp: handleMouseUpByBlurring,
    onMouseEnter,
    onTouchStart
  };
  const handleClick = useDisableClick(disabled, onClick);
  if (url) {
    buttonMarkup = disabled ? (
      // Render an `<a>` so toggling disabled/enabled state changes only the
      // `href` attribute instead of replacing the whole element.
      /* @__PURE__ */ React.createElement("a", commonProps, children)
    ) : /* @__PURE__ */ React.createElement(UnstyledLink, Object.assign({}, interactiveProps, {
      url,
      external,
      target,
      download
    }, rest), children);
  } else {
    buttonMarkup = /* @__PURE__ */ React.createElement("button", Object.assign({}, interactiveProps, {
      "aria-disabled": disabled,
      type: submit ? "submit" : "button",
      "aria-busy": loading ? true : void 0,
      "aria-controls": ariaControls,
      "aria-expanded": ariaExpanded,
      "aria-describedby": ariaDescribedBy,
      "aria-checked": ariaChecked,
      "aria-pressed": pressed,
      onKeyDown,
      onKeyUp,
      onKeyPress,
      onClick: handleClick,
      tabIndex: disabled ? -1 : void 0
    }, rest), children);
  }
  return buttonMarkup;
}
class MissingAppProviderError extends Error {
  constructor(message = "") {
    super(`${message ? `${message} ` : message}Your application must be wrapped in an <AppProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.`);
    this.name = "MissingAppProviderError";
  }
}
function useI18n() {
  const i18n = useContext(I18nContext);
  if (!i18n) {
    throw new MissingAppProviderError("No i18n was provided.");
  }
  return i18n;
}
function Button({
  id,
  children,
  url,
  disabled,
  external,
  download,
  target,
  submit,
  loading,
  pressed,
  accessibilityLabel,
  role,
  ariaControls,
  ariaExpanded,
  ariaDescribedBy,
  ariaChecked,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  onMouseEnter,
  onTouchStart,
  onPointerDown,
  icon,
  disclosure,
  removeUnderline,
  size = "medium",
  textAlign = "center",
  fullWidth,
  dataPrimaryLink,
  tone,
  variant = "secondary"
}) {
  const i18n = useI18n();
  const isDisabled = disabled || loading;
  const {
    mdUp
  } = useBreakpoints();
  const className = classNames(styles$S.Button, styles$S.pressable, styles$S[variationName("variant", variant)], styles$S[variationName("size", size)], styles$S[variationName("textAlign", textAlign)], fullWidth && styles$S.fullWidth, disclosure && styles$S.disclosure, icon && children && styles$S.iconWithText, icon && children == null && styles$S.iconOnly, isDisabled && styles$S.disabled, loading && styles$S.loading, pressed && !disabled && !url && styles$S.pressed, removeUnderline && styles$S.removeUnderline, tone && styles$S[variationName("tone", tone)]);
  const disclosureMarkup = disclosure ? /* @__PURE__ */ React.createElement("span", {
    className: loading ? styles$S.hidden : styles$S.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: loading ? "placeholder" : getDisclosureIconSource(disclosure, ChevronUpIcon, ChevronDownIcon)
  })) : null;
  const iconSource = isIconSource(icon) ? /* @__PURE__ */ React.createElement(Icon, {
    source: loading ? "placeholder" : icon
  }) : icon;
  const iconMarkup = iconSource ? /* @__PURE__ */ React.createElement("span", {
    className: loading ? styles$S.hidden : styles$S.Icon
  }, iconSource) : null;
  const hasPlainText = ["plain", "monochromePlain"].includes(variant);
  let textFontWeight = "medium";
  if (hasPlainText) {
    textFontWeight = "regular";
  } else if (variant === "primary") {
    textFontWeight = mdUp ? "medium" : "semibold";
  }
  let textVariant = "bodySm";
  if (size === "large" || hasPlainText && size !== "micro") {
    textVariant = "bodyMd";
  }
  const childMarkup = children ? /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: textVariant,
    fontWeight: textFontWeight,
    key: disabled ? "text-disabled" : "text"
  }, children) : null;
  const spinnerSVGMarkup = loading ? /* @__PURE__ */ React.createElement("span", {
    className: styles$S.Spinner
  }, /* @__PURE__ */ React.createElement(Spinner$1, {
    size: "small",
    accessibilityLabel: i18n.translate("Polaris.Button.spinnerAccessibilityLabel")
  })) : null;
  const commonProps = {
    id,
    className,
    accessibilityLabel,
    ariaDescribedBy,
    role,
    onClick,
    onFocus,
    onBlur,
    onMouseUp: handleMouseUpByBlurring,
    onMouseEnter,
    onTouchStart,
    "data-primary-link": dataPrimaryLink
  };
  const linkProps = {
    url,
    external,
    download,
    target
  };
  const actionProps = {
    submit,
    disabled: isDisabled,
    loading,
    ariaControls,
    ariaExpanded,
    ariaChecked,
    pressed,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onPointerDown
  };
  const buttonMarkup = /* @__PURE__ */ React.createElement(UnstyledButton, Object.assign({}, commonProps, linkProps, actionProps), spinnerSVGMarkup, iconMarkup, childMarkup, disclosureMarkup);
  return buttonMarkup;
}
function isIconSource(x) {
  return typeof x === "string" || typeof x === "object" && x.body || typeof x === "function";
}
function getDisclosureIconSource(disclosure, upIcon, downIcon) {
  if (disclosure === "select") {
    return SelectIcon;
  }
  return disclosure === "up" ? upIcon : downIcon;
}
function buttonsFrom(actions, overrides = {}) {
  if (Array.isArray(actions)) {
    return actions.map((action2, index) => buttonFrom(action2, overrides, index));
  } else {
    const action2 = actions;
    return buttonFrom(action2, overrides);
  }
}
function buttonFrom({
  content,
  onAction,
  plain,
  destructive,
  ...action2
}, overrides, key) {
  const plainVariant = plain ? "plain" : void 0;
  const destructiveVariant = destructive ? "primary" : void 0;
  const tone = !(overrides == null ? void 0 : overrides.tone) && destructive ? "critical" : overrides == null ? void 0 : overrides.tone;
  return /* @__PURE__ */ React.createElement(Button, Object.assign({
    key,
    onClick: onAction,
    tone,
    variant: plainVariant || destructiveVariant
  }, action2, overrides), content);
}
var styles$O = {
  "ShadowBevel": "Polaris-ShadowBevel"
};
function ShadowBevel(props) {
  const {
    as = "div",
    bevel = true,
    borderRadius,
    boxShadow,
    children,
    zIndex = "0"
  } = props;
  const Component2 = as;
  return /* @__PURE__ */ React.createElement(Component2, {
    className: styles$O.ShadowBevel,
    style: {
      "--pc-shadow-bevel-z-index": zIndex,
      ...getResponsiveValue("shadow-bevel", "content", mapResponsiveProp(bevel, (bevel2) => bevel2 ? '""' : "none")),
      ...getResponsiveValue("shadow-bevel", "box-shadow", mapResponsiveProp(bevel, (bevel2) => bevel2 ? `var(--p-shadow-${boxShadow})` : "none")),
      ...getResponsiveValue("shadow-bevel", "border-radius", mapResponsiveProp(bevel, (bevel2) => bevel2 ? `var(--p-border-radius-${borderRadius})` : "var(--p-border-radius-0)"))
    }
  }, children);
}
function mapResponsiveProp(responsiveProp, callback) {
  if (typeof responsiveProp === "boolean") {
    return callback(responsiveProp);
  }
  return Object.fromEntries(Object.entries(responsiveProp).map(([breakpointsAlias, value]) => [breakpointsAlias, callback(value)]));
}
var styles$N = {
  "listReset": "Polaris-Box--listReset",
  "Box": "Polaris-Box",
  "visuallyHidden": "Polaris-Box--visuallyHidden",
  "printHidden": "Polaris-Box--printHidden"
};
const Box = /* @__PURE__ */ forwardRef(({
  as = "div",
  background,
  borderColor,
  borderStyle,
  borderWidth,
  borderBlockStartWidth,
  borderBlockEndWidth,
  borderInlineStartWidth,
  borderInlineEndWidth,
  borderRadius,
  borderEndStartRadius,
  borderEndEndRadius,
  borderStartStartRadius,
  borderStartEndRadius,
  children,
  color,
  id,
  minHeight,
  minWidth,
  maxWidth,
  overflowX,
  overflowY,
  outlineColor,
  outlineStyle,
  outlineWidth,
  padding,
  paddingBlock,
  paddingBlockStart,
  paddingBlockEnd,
  paddingInline,
  paddingInlineStart,
  paddingInlineEnd,
  role,
  shadow,
  tabIndex,
  width,
  printHidden,
  visuallyHidden,
  position,
  insetBlockStart,
  insetBlockEnd,
  insetInlineStart,
  insetInlineEnd,
  zIndex,
  opacity,
  ...restProps
}, ref) => {
  const borderStyleValue = borderStyle ? borderStyle : borderColor || borderWidth || borderBlockStartWidth || borderBlockEndWidth || borderInlineStartWidth || borderInlineEndWidth ? "solid" : void 0;
  const outlineStyleValue = outlineStyle ? outlineStyle : outlineColor || outlineWidth ? "solid" : void 0;
  const style = {
    "--pc-box-color": color ? `var(--p-color-${color})` : void 0,
    "--pc-box-background": background ? `var(--p-color-${background})` : void 0,
    // eslint-disable-next-line no-nested-ternary
    "--pc-box-border-color": borderColor ? borderColor === "transparent" ? "transparent" : `var(--p-color-${borderColor})` : void 0,
    "--pc-box-border-style": borderStyleValue,
    "--pc-box-border-radius": borderRadius ? `var(--p-border-radius-${borderRadius})` : void 0,
    "--pc-box-border-end-start-radius": borderEndStartRadius ? `var(--p-border-radius-${borderEndStartRadius})` : void 0,
    "--pc-box-border-end-end-radius": borderEndEndRadius ? `var(--p-border-radius-${borderEndEndRadius})` : void 0,
    "--pc-box-border-start-start-radius": borderStartStartRadius ? `var(--p-border-radius-${borderStartStartRadius})` : void 0,
    "--pc-box-border-start-end-radius": borderStartEndRadius ? `var(--p-border-radius-${borderStartEndRadius})` : void 0,
    "--pc-box-border-width": borderWidth ? `var(--p-border-width-${borderWidth})` : void 0,
    "--pc-box-border-block-start-width": borderBlockStartWidth ? `var(--p-border-width-${borderBlockStartWidth})` : void 0,
    "--pc-box-border-block-end-width": borderBlockEndWidth ? `var(--p-border-width-${borderBlockEndWidth})` : void 0,
    "--pc-box-border-inline-start-width": borderInlineStartWidth ? `var(--p-border-width-${borderInlineStartWidth})` : void 0,
    "--pc-box-border-inline-end-width": borderInlineEndWidth ? `var(--p-border-width-${borderInlineEndWidth})` : void 0,
    "--pc-box-min-height": minHeight,
    "--pc-box-min-width": minWidth,
    "--pc-box-max-width": maxWidth,
    "--pc-box-outline-color": outlineColor ? `var(--p-color-${outlineColor})` : void 0,
    "--pc-box-outline-style": outlineStyleValue,
    "--pc-box-outline-width": outlineWidth ? `var(--p-border-width-${outlineWidth})` : void 0,
    "--pc-box-overflow-x": overflowX,
    "--pc-box-overflow-y": overflowY,
    ...getResponsiveProps("box", "padding-block-start", "space", paddingBlockStart || paddingBlock || padding),
    ...getResponsiveProps("box", "padding-block-end", "space", paddingBlockEnd || paddingBlock || padding),
    ...getResponsiveProps("box", "padding-inline-start", "space", paddingInlineStart || paddingInline || padding),
    ...getResponsiveProps("box", "padding-inline-end", "space", paddingInlineEnd || paddingInline || padding),
    "--pc-box-shadow": shadow ? `var(--p-shadow-${shadow})` : void 0,
    "--pc-box-width": width,
    position,
    "--pc-box-inset-block-start": insetBlockStart ? `var(--p-space-${insetBlockStart})` : void 0,
    "--pc-box-inset-block-end": insetBlockEnd ? `var(--p-space-${insetBlockEnd})` : void 0,
    "--pc-box-inset-inline-start": insetInlineStart ? `var(--p-space-${insetInlineStart})` : void 0,
    "--pc-box-inset-inline-end": insetInlineEnd ? `var(--p-space-${insetInlineEnd})` : void 0,
    zIndex,
    opacity
  };
  const className = classNames(styles$N.Box, visuallyHidden && styles$N.visuallyHidden, printHidden && styles$N.printHidden, as === "ul" && styles$N.listReset);
  return /* @__PURE__ */ React.createElement(as, {
    className,
    id,
    ref,
    style: sanitizeCustomProperties(style),
    role,
    tabIndex,
    ...restProps
  }, children);
});
Box.displayName = "Box";
const Card = ({
  children,
  background = "bg-surface",
  padding = {
    xs: "400"
  },
  roundedAbove = "sm"
}) => {
  const breakpoints = useBreakpoints();
  const defaultBorderRadius = "300";
  const hasBorderRadius = Boolean(breakpoints[`${roundedAbove}Up`]);
  return /* @__PURE__ */ React.createElement(WithinContentContext.Provider, {
    value: true
  }, /* @__PURE__ */ React.createElement(ShadowBevel, {
    boxShadow: "100",
    borderRadius: hasBorderRadius ? defaultBorderRadius : "0",
    zIndex: "32"
  }, /* @__PURE__ */ React.createElement(Box, {
    background,
    padding,
    overflowX: "clip",
    overflowY: "clip",
    minHeight: "100%"
  }, children)));
};
var styles$M = {
  "InlineStack": "Polaris-InlineStack"
};
const InlineStack = function InlineStack2({
  as: Element2 = "div",
  align,
  direction = "row",
  blockAlign,
  gap,
  wrap = true,
  children
}) {
  const style = {
    "--pc-inline-stack-align": align,
    "--pc-inline-stack-block-align": blockAlign,
    "--pc-inline-stack-wrap": wrap ? "wrap" : "nowrap",
    ...getResponsiveProps("inline-stack", "gap", "space", gap),
    ...getResponsiveValue("inline-stack", "flex-direction", direction)
  };
  return /* @__PURE__ */ React.createElement(Element2, {
    className: styles$M.InlineStack,
    style
  }, children);
};
var styles$L = {
  "BlockStack": "Polaris-BlockStack",
  "listReset": "Polaris-BlockStack--listReset",
  "fieldsetReset": "Polaris-BlockStack--fieldsetReset"
};
const BlockStack = ({
  as = "div",
  children,
  align,
  inlineAlign,
  gap,
  id,
  reverseOrder = false,
  ...restProps
}) => {
  const className = classNames(styles$L.BlockStack, (as === "ul" || as === "ol") && styles$L.listReset, as === "fieldset" && styles$L.fieldsetReset);
  const style = {
    "--pc-block-stack-align": align ? `${align}` : null,
    "--pc-block-stack-inline-align": inlineAlign ? `${inlineAlign}` : null,
    "--pc-block-stack-order": reverseOrder ? "column-reverse" : "column",
    ...getResponsiveProps("block-stack", "gap", "space", gap)
  };
  return /* @__PURE__ */ React.createElement(as, {
    className,
    id,
    style: sanitizeCustomProperties(style),
    ...restProps
  }, children);
};
const Image = /* @__PURE__ */ forwardRef(({
  alt,
  sourceSet,
  source,
  crossOrigin,
  onLoad,
  className,
  ...rest
}, ref) => {
  const finalSourceSet = sourceSet ? sourceSet.map(({
    source: subSource,
    descriptor
  }) => `${subSource} ${descriptor}`).join(",") : null;
  const handleLoad = useCallback(() => {
    if (onLoad) onLoad();
  }, [onLoad]);
  return /* @__PURE__ */ React.createElement("img", Object.assign({
    ref,
    alt,
    src: source,
    crossOrigin,
    className,
    onLoad: handleLoad
  }, finalSourceSet ? {
    srcSet: finalSourceSet
  } : {}, rest));
});
Image.displayName = "Image";
const FilterActionsContext = /* @__PURE__ */ createContext(false);
function FilterActionsProvider({
  children,
  filterActions
}) {
  return /* @__PURE__ */ React.createElement(FilterActionsContext.Provider, {
    value: filterActions
  }, children);
}
var styles$K = {
  "Item": "Polaris-ActionList__Item",
  "default": "Polaris-ActionList--default",
  "active": "Polaris-ActionList--active",
  "destructive": "Polaris-ActionList--destructive",
  "disabled": "Polaris-ActionList--disabled",
  "Prefix": "Polaris-ActionList__Prefix",
  "Suffix": "Polaris-ActionList__Suffix",
  "indented": "Polaris-ActionList--indented",
  "menu": "Polaris-ActionList--menu",
  "Text": "Polaris-ActionList__Text"
};
const WithinFilterContext = /* @__PURE__ */ createContext(false);
var styles$J = {
  "Badge": "Polaris-Badge",
  "toneSuccess": "Polaris-Badge--toneSuccess",
  "toneSuccess-strong": "Polaris-Badge__toneSuccess--strong",
  "toneInfo": "Polaris-Badge--toneInfo",
  "toneInfo-strong": "Polaris-Badge__toneInfo--strong",
  "toneAttention": "Polaris-Badge--toneAttention",
  "toneAttention-strong": "Polaris-Badge__toneAttention--strong",
  "toneWarning": "Polaris-Badge--toneWarning",
  "toneWarning-strong": "Polaris-Badge__toneWarning--strong",
  "toneCritical": "Polaris-Badge--toneCritical",
  "toneCritical-strong": "Polaris-Badge__toneCritical--strong",
  "toneNew": "Polaris-Badge--toneNew",
  "toneMagic": "Polaris-Badge--toneMagic",
  "toneRead-only": "Polaris-Badge__toneRead--only",
  "toneEnabled": "Polaris-Badge--toneEnabled",
  "sizeLarge": "Polaris-Badge--sizeLarge",
  "withinFilter": "Polaris-Badge--withinFilter",
  "Icon": "Polaris-Badge__Icon",
  "PipContainer": "Polaris-Badge__PipContainer"
};
let ToneValue = /* @__PURE__ */ (function(ToneValue2) {
  ToneValue2["Info"] = "info";
  ToneValue2["Success"] = "success";
  ToneValue2["Warning"] = "warning";
  ToneValue2["Critical"] = "critical";
  ToneValue2["Attention"] = "attention";
  ToneValue2["New"] = "new";
  ToneValue2["Magic"] = "magic";
  ToneValue2["InfoStrong"] = "info-strong";
  ToneValue2["SuccessStrong"] = "success-strong";
  ToneValue2["WarningStrong"] = "warning-strong";
  ToneValue2["CriticalStrong"] = "critical-strong";
  ToneValue2["AttentionStrong"] = "attention-strong";
  ToneValue2["ReadOnly"] = "read-only";
  ToneValue2["Enabled"] = "enabled";
  return ToneValue2;
})({});
let ProgressValue = /* @__PURE__ */ (function(ProgressValue2) {
  ProgressValue2["Incomplete"] = "incomplete";
  ProgressValue2["PartiallyComplete"] = "partiallyComplete";
  ProgressValue2["Complete"] = "complete";
  return ProgressValue2;
})({});
function getDefaultAccessibilityLabel(i18n, progress, tone) {
  let progressLabel = "";
  let toneLabel = "";
  if (!progress && !tone) {
    return "";
  }
  switch (progress) {
    case ProgressValue.Incomplete:
      progressLabel = i18n.translate("Polaris.Badge.PROGRESS_LABELS.incomplete");
      break;
    case ProgressValue.PartiallyComplete:
      progressLabel = i18n.translate("Polaris.Badge.PROGRESS_LABELS.partiallyComplete");
      break;
    case ProgressValue.Complete:
      progressLabel = i18n.translate("Polaris.Badge.PROGRESS_LABELS.complete");
      break;
  }
  switch (tone) {
    case ToneValue.Info:
    case ToneValue.InfoStrong:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.info");
      break;
    case ToneValue.Success:
    case ToneValue.SuccessStrong:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.success");
      break;
    case ToneValue.Warning:
    case ToneValue.WarningStrong:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.warning");
      break;
    case ToneValue.Critical:
    case ToneValue.CriticalStrong:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.critical");
      break;
    case ToneValue.Attention:
    case ToneValue.AttentionStrong:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.attention");
      break;
    case ToneValue.New:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.new");
      break;
    case ToneValue.ReadOnly:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.readOnly");
      break;
    case ToneValue.Enabled:
      toneLabel = i18n.translate("Polaris.Badge.TONE_LABELS.enabled");
      break;
  }
  if (!tone && progress) {
    return progressLabel;
  } else if (tone && !progress) {
    return toneLabel;
  } else {
    return i18n.translate("Polaris.Badge.progressAndTone", {
      progressLabel,
      toneLabel
    });
  }
}
var styles$I = {
  "Pip": "Polaris-Badge-Pip",
  "toneInfo": "Polaris-Badge-Pip--toneInfo",
  "toneSuccess": "Polaris-Badge-Pip--toneSuccess",
  "toneNew": "Polaris-Badge-Pip--toneNew",
  "toneAttention": "Polaris-Badge-Pip--toneAttention",
  "toneWarning": "Polaris-Badge-Pip--toneWarning",
  "toneCritical": "Polaris-Badge-Pip--toneCritical",
  "progressIncomplete": "Polaris-Badge-Pip--progressIncomplete",
  "progressPartiallyComplete": "Polaris-Badge-Pip--progressPartiallyComplete",
  "progressComplete": "Polaris-Badge-Pip--progressComplete"
};
function Pip({
  tone,
  progress = "complete",
  accessibilityLabelOverride
}) {
  const i18n = useI18n();
  const className = classNames(styles$I.Pip, tone && styles$I[variationName("tone", tone)], progress && styles$I[variationName("progress", progress)]);
  const accessibilityLabel = accessibilityLabelOverride ? accessibilityLabelOverride : getDefaultAccessibilityLabel(i18n, progress, tone);
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel));
}
const DEFAULT_SIZE = "medium";
const progressIconMap = {
  complete: () => /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 20 20"
  }, /* @__PURE__ */ React.createElement("path", {
    d: "M6 10c0-.93 0-1.395.102-1.776a3 3 0 0 1 2.121-2.122C8.605 6 9.07 6 10 6c.93 0 1.395 0 1.776.102a3 3 0 0 1 2.122 2.122C14 8.605 14 9.07 14 10s0 1.395-.102 1.777a3 3 0 0 1-2.122 2.12C11.395 14 10.93 14 10 14s-1.395 0-1.777-.102a3 3 0 0 1-2.12-2.121C6 11.395 6 10.93 6 10Z"
  })),
  partiallyComplete: () => /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 20 20"
  }, /* @__PURE__ */ React.createElement("path", {
    fillRule: "evenodd",
    d: "m8.888 6.014-.017-.018-.02.02c-.253.013-.45.038-.628.086a3 3 0 0 0-2.12 2.122C6 8.605 6 9.07 6 10s0 1.395.102 1.777a3 3 0 0 0 2.121 2.12C8.605 14 9.07 14 10 14c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.121C14 11.395 14 10.93 14 10c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.122-2.122C11.395 6 10.93 6 10 6c-.475 0-.829 0-1.112.014ZM8.446 7.34a1.75 1.75 0 0 0-1.041.94l4.314 4.315c.443-.2.786-.576.941-1.042L8.446 7.34Zm4.304 2.536L10.124 7.25c.908.001 1.154.013 1.329.06a1.75 1.75 0 0 1 1.237 1.237c.047.175.059.42.06 1.329ZM8.547 12.69c.182.05.442.06 1.453.06h.106L7.25 9.894V10c0 1.01.01 1.27.06 1.453a1.75 1.75 0 0 0 1.237 1.237Z"
  })),
  incomplete: () => /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 20 20"
  }, /* @__PURE__ */ React.createElement("path", {
    fillRule: "evenodd",
    d: "M8.547 12.69c.183.05.443.06 1.453.06s1.27-.01 1.453-.06a1.75 1.75 0 0 0 1.237-1.237c.05-.182.06-.443.06-1.453s-.01-1.27-.06-1.453a1.75 1.75 0 0 0-1.237-1.237c-.182-.05-.443-.06-1.453-.06s-1.27.01-1.453.06A1.75 1.75 0 0 0 7.31 8.547c-.05.183-.06.443-.06 1.453s.01 1.27.06 1.453a1.75 1.75 0 0 0 1.237 1.237ZM6.102 8.224C6 8.605 6 9.07 6 10s0 1.395.102 1.777a3 3 0 0 0 2.122 2.12C8.605 14 9.07 14 10 14s1.395 0 1.777-.102a3 3 0 0 0 2.12-2.121C14 11.395 14 10.93 14 10c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.121-2.122C11.395 6 10.93 6 10 6c-.93 0-1.395 0-1.776.102a3 3 0 0 0-2.122 2.122Z"
  }))
};
function Badge({
  children,
  tone,
  progress,
  icon,
  size = DEFAULT_SIZE,
  toneAndProgressLabelOverride
}) {
  const i18n = useI18n();
  const withinFilter = useContext(WithinFilterContext);
  const className = classNames(styles$J.Badge, tone && styles$J[variationName("tone", tone)], size && size !== DEFAULT_SIZE && styles$J[variationName("size", size)], withinFilter && styles$J.withinFilter);
  const accessibilityLabel = toneAndProgressLabelOverride ? toneAndProgressLabelOverride : getDefaultAccessibilityLabel(i18n, progress, tone);
  let accessibilityMarkup = Boolean(accessibilityLabel) && /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel);
  if (progress && !icon) {
    accessibilityMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$J.Icon
    }, /* @__PURE__ */ React.createElement(Icon, {
      accessibilityLabel,
      source: progressIconMap[progress]
    }));
  }
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, accessibilityMarkup, icon && /* @__PURE__ */ React.createElement("span", {
    className: styles$J.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: icon
  })), children && /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodySm",
    fontWeight: tone === "new" ? "medium" : void 0
  }, children));
}
Badge.Pip = Pip;
function useToggle(initialState) {
  const [value, setState] = useState(initialState);
  return {
    value,
    toggle: useCallback(() => setState((state) => !state), []),
    setTrue: useCallback(() => setState(true), []),
    setFalse: useCallback(() => setState(false), [])
  };
}
var styles$H = {
  "TooltipContainer": "Polaris-Tooltip__TooltipContainer",
  "HasUnderline": "Polaris-Tooltip__HasUnderline"
};
function useEphemeralPresenceManager() {
  const ephemeralPresenceManager = useContext(EphemeralPresenceManagerContext);
  if (!ephemeralPresenceManager) {
    throw new Error("No ephemeral presence manager was provided. Your application must be wrapped in an <AppProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return ephemeralPresenceManager;
}
function usePortalsManager() {
  const portalsManager = useContext(PortalsManagerContext);
  if (!portalsManager) {
    throw new Error("No portals manager was provided. Your application must be wrapped in an <AppProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return portalsManager;
}
function Portal({
  children,
  idPrefix = "",
  onPortalCreated = noop$4
}) {
  const themeName = useThemeName();
  const {
    container
  } = usePortalsManager();
  const uniqueId = useId();
  const portalId = idPrefix !== "" ? `${idPrefix}-${uniqueId}` : uniqueId;
  useEffect(() => {
    onPortalCreated();
  }, [onPortalCreated]);
  return container ? /* @__PURE__ */ createPortal(/* @__PURE__ */ React.createElement(ThemeProvider, {
    theme: isThemeNameLocal(themeName) ? themeName : themeNameDefault,
    "data-portal-id": portalId
  }, children), container) : null;
}
function noop$4() {
}
var styles$G = {
  "TooltipOverlay": "Polaris-Tooltip-TooltipOverlay",
  "Tail": "Polaris-Tooltip-TooltipOverlay__Tail",
  "positionedAbove": "Polaris-Tooltip-TooltipOverlay--positionedAbove",
  "measuring": "Polaris-Tooltip-TooltipOverlay--measuring",
  "measured": "Polaris-Tooltip-TooltipOverlay--measured",
  "instant": "Polaris-Tooltip-TooltipOverlay--instant",
  "Content": "Polaris-Tooltip-TooltipOverlay__Content",
  "default": "Polaris-Tooltip-TooltipOverlay--default",
  "wide": "Polaris-Tooltip-TooltipOverlay--wide"
};
function calculateVerticalPosition(activatorRect, overlayRect, overlayMargins, scrollableContainerRect, containerRect, preferredPosition, fixed, topBarOffset = 0) {
  const activatorTop = activatorRect.top;
  const activatorBottom = activatorTop + activatorRect.height;
  const spaceAbove = activatorRect.top - topBarOffset;
  const spaceBelow = containerRect.height - activatorRect.top - activatorRect.height;
  const desiredHeight = overlayRect.height;
  const verticalMargins = overlayMargins.activator + overlayMargins.container;
  const minimumSpaceToScroll = overlayMargins.container;
  const distanceToTopScroll = activatorRect.top - Math.max(scrollableContainerRect.top, 0);
  const distanceToBottomScroll = containerRect.top + Math.min(containerRect.height, scrollableContainerRect.top + scrollableContainerRect.height) - (activatorRect.top + activatorRect.height);
  const enoughSpaceFromTopScroll = distanceToTopScroll >= minimumSpaceToScroll;
  const enoughSpaceFromBottomScroll = distanceToBottomScroll >= minimumSpaceToScroll;
  const heightIfAbove = Math.min(spaceAbove, desiredHeight);
  const heightIfBelow = Math.min(spaceBelow, desiredHeight);
  const heightIfAboveCover = Math.min(spaceAbove + activatorRect.height, desiredHeight);
  const heightIfBelowCover = Math.min(spaceBelow + activatorRect.height, desiredHeight);
  const containerRectTop = fixed ? 0 : containerRect.top;
  const positionIfAbove = {
    height: heightIfAbove - verticalMargins,
    top: activatorTop + containerRectTop - heightIfAbove,
    positioning: "above"
  };
  const positionIfBelow = {
    height: heightIfBelow - verticalMargins,
    top: activatorBottom + containerRectTop,
    positioning: "below"
  };
  const positionIfCoverBelow = {
    height: heightIfBelowCover - verticalMargins,
    top: activatorTop + containerRectTop,
    positioning: "cover"
  };
  const positionIfCoverAbove = {
    height: heightIfAboveCover - verticalMargins,
    top: activatorTop + containerRectTop - heightIfAbove + activatorRect.height + verticalMargins,
    positioning: "cover"
  };
  if (preferredPosition === "above") {
    return (enoughSpaceFromTopScroll || distanceToTopScroll >= distanceToBottomScroll && !enoughSpaceFromBottomScroll) && (spaceAbove > desiredHeight || spaceAbove > spaceBelow) ? positionIfAbove : positionIfBelow;
  }
  if (preferredPosition === "below") {
    return (enoughSpaceFromBottomScroll || distanceToBottomScroll >= distanceToTopScroll && !enoughSpaceFromTopScroll) && (spaceBelow > desiredHeight || spaceBelow > spaceAbove) ? positionIfBelow : positionIfAbove;
  }
  if (preferredPosition === "cover") {
    return (enoughSpaceFromBottomScroll || distanceToBottomScroll >= distanceToTopScroll && !enoughSpaceFromTopScroll) && (spaceBelow + activatorRect.height > desiredHeight || spaceBelow > spaceAbove) ? positionIfCoverBelow : positionIfCoverAbove;
  }
  if (enoughSpaceFromTopScroll && enoughSpaceFromBottomScroll) {
    return spaceAbove > spaceBelow ? positionIfAbove : positionIfBelow;
  }
  return distanceToTopScroll > minimumSpaceToScroll ? positionIfAbove : positionIfBelow;
}
function calculateHorizontalPosition(activatorRect, overlayRect, containerRect, overlayMargins, preferredAlignment) {
  const maximum = containerRect.width - overlayRect.width;
  if (preferredAlignment === "left") {
    return Math.min(maximum, Math.max(0, activatorRect.left - overlayMargins.horizontal));
  } else if (preferredAlignment === "right") {
    const activatorRight = containerRect.width - (activatorRect.left + activatorRect.width);
    return Math.min(maximum, Math.max(0, activatorRight - overlayMargins.horizontal));
  }
  return Math.min(maximum, Math.max(0, activatorRect.center.x - overlayRect.width / 2));
}
function rectIsOutsideOfRect(inner, outer) {
  const {
    center
  } = inner;
  return center.y < outer.top || center.y > outer.top + outer.height;
}
function intersectionWithViewport(rect, viewport = windowRect()) {
  const top = Math.max(rect.top, 0);
  const left = Math.max(rect.left, 0);
  const bottom = Math.min(rect.top + rect.height, viewport.height);
  const right = Math.min(rect.left + rect.width, viewport.width);
  return new Rect({
    top,
    left,
    height: bottom - top,
    width: right - left
  });
}
function windowRect(node) {
  const document2 = (node == null ? void 0 : node.ownerDocument) || globalThis.document;
  const window2 = document2.defaultView || globalThis.window;
  return new Rect({
    top: window2.scrollY,
    left: window2.scrollX,
    height: window2.innerHeight,
    width: document2.body.clientWidth
  });
}
var styles$F = {
  "PositionedOverlay": "Polaris-PositionedOverlay",
  "fixed": "Polaris-PositionedOverlay--fixed",
  "preventInteraction": "Polaris-PositionedOverlay--preventInteraction"
};
const UNIQUE_IDENTIFIER = Symbol("unique_identifier");
function useLazyRef(initialValue) {
  const lazyRef = useRef(UNIQUE_IDENTIFIER);
  if (lazyRef.current === UNIQUE_IDENTIFIER) {
    lazyRef.current = initialValue();
  }
  return lazyRef;
}
function useComponentDidMount(callback) {
  const isAfterInitialMount = useIsAfterInitialMount();
  const hasInvokedLifeCycle = useRef(false);
  if (isAfterInitialMount && !hasInvokedLifeCycle.current) {
    hasInvokedLifeCycle.current = true;
    return callback();
  }
}
const ScrollableContext = /* @__PURE__ */ createContext(void 0);
var styles$E = {
  "Scrollable": "Polaris-Scrollable",
  "hasTopShadow": "Polaris-Scrollable--hasTopShadow",
  "hasBottomShadow": "Polaris-Scrollable--hasBottomShadow",
  "horizontal": "Polaris-Scrollable--horizontal",
  "vertical": "Polaris-Scrollable--vertical",
  "scrollbarWidthThin": "Polaris-Scrollable--scrollbarWidthThin",
  "scrollbarWidthNone": "Polaris-Scrollable--scrollbarWidthNone",
  "scrollbarWidthAuto": "Polaris-Scrollable--scrollbarWidthAuto",
  "scrollbarGutterStable": "Polaris-Scrollable--scrollbarGutterStable",
  "scrollbarGutterStableboth-edges": "Polaris-Scrollable__scrollbarGutterStableboth--edges"
};
function ScrollTo() {
  const anchorNode = useRef(null);
  const scrollToPosition = useContext(ScrollableContext);
  useEffect(() => {
    if (!scrollToPosition || !anchorNode.current) {
      return;
    }
    scrollToPosition(anchorNode.current.offsetTop);
  }, [scrollToPosition]);
  const id = useId();
  return /* @__PURE__ */ React.createElement("a", {
    id,
    ref: anchorNode
  });
}
const MAX_SCROLL_HINT_DISTANCE = 100;
const LOW_RES_BUFFER = 2;
const ScrollableComponent = /* @__PURE__ */ forwardRef(({
  children,
  className,
  horizontal = true,
  vertical = true,
  shadow,
  hint,
  focusable,
  scrollbarWidth = "thin",
  scrollbarGutter,
  onScrolledToBottom,
  ...rest
}, forwardedRef) => {
  const [topShadow, setTopShadow] = useState(false);
  const [bottomShadow, setBottomShadow] = useState(false);
  const stickyManager = useLazyRef(() => new StickyManager());
  const scrollArea = useRef(null);
  const scrollTo = useCallback((scrollY, options = {}) => {
    var _a;
    const optionsBehavior = options.behavior || "smooth";
    const behavior = prefersReducedMotion() ? "auto" : optionsBehavior;
    (_a = scrollArea.current) == null ? void 0 : _a.scrollTo({
      top: scrollY,
      behavior
    });
  }, []);
  const defaultRef = useRef();
  useImperativeHandle(forwardedRef || defaultRef, () => ({
    scrollTo
  }));
  const handleScroll = useCallback(() => {
    const currentScrollArea = scrollArea.current;
    if (!currentScrollArea) {
      return;
    }
    requestAnimationFrame(() => {
      const {
        scrollTop,
        clientHeight,
        scrollHeight
      } = currentScrollArea;
      const canScroll = Boolean(scrollHeight > clientHeight);
      const isBelowTopOfScroll = Boolean(scrollTop > 0);
      const isAtBottomOfScroll = Boolean(scrollTop + clientHeight >= scrollHeight - LOW_RES_BUFFER);
      setTopShadow(isBelowTopOfScroll);
      setBottomShadow(!isAtBottomOfScroll);
      if (canScroll && isAtBottomOfScroll && onScrolledToBottom) {
        onScrolledToBottom();
      }
    });
  }, [onScrolledToBottom]);
  useComponentDidMount(() => {
    handleScroll();
    if (hint) {
      requestAnimationFrame(() => performScrollHint(scrollArea.current));
    }
  });
  useEffect(() => {
    var _a;
    const currentScrollArea = scrollArea.current;
    if (!currentScrollArea) {
      return;
    }
    const handleResize = debounce(handleScroll, 50, {
      trailing: true
    });
    (_a = stickyManager.current) == null ? void 0 : _a.setContainer(currentScrollArea);
    currentScrollArea.addEventListener("scroll", handleScroll);
    globalThis.addEventListener("resize", handleResize);
    return () => {
      currentScrollArea.removeEventListener("scroll", handleScroll);
      globalThis.removeEventListener("resize", handleResize);
    };
  }, [stickyManager, handleScroll]);
  const finalClassName = classNames(className, styles$E.Scrollable, vertical && styles$E.vertical, horizontal && styles$E.horizontal, shadow && topShadow && styles$E.hasTopShadow, shadow && bottomShadow && styles$E.hasBottomShadow, scrollbarWidth && styles$E[variationName("scrollbarWidth", scrollbarWidth)], scrollbarGutter && styles$E[variationName("scrollbarGutter", scrollbarGutter.replace(" ", ""))]);
  return /* @__PURE__ */ React.createElement(ScrollableContext.Provider, {
    value: scrollTo
  }, /* @__PURE__ */ React.createElement(StickyManagerContext.Provider, {
    value: stickyManager.current
  }, /* @__PURE__ */ React.createElement("div", Object.assign({
    className: finalClassName
  }, scrollable.props, rest, {
    ref: scrollArea,
    tabIndex: focusable ? 0 : void 0
  }), children)));
});
ScrollableComponent.displayName = "Scrollable";
function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    return false;
  }
}
function performScrollHint(elem) {
  if (!elem || prefersReducedMotion()) {
    return;
  }
  const scrollableDistance = elem.scrollHeight - elem.clientHeight;
  const distanceToPeek = Math.min(MAX_SCROLL_HINT_DISTANCE, scrollableDistance) - LOW_RES_BUFFER;
  const goBackToTop = () => {
    requestAnimationFrame(() => {
      if (elem.scrollTop >= distanceToPeek) {
        elem.removeEventListener("scroll", goBackToTop);
        elem.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    });
  };
  elem.addEventListener("scroll", goBackToTop);
  elem.scrollTo({
    top: MAX_SCROLL_HINT_DISTANCE,
    behavior: "smooth"
  });
}
const forNode = (node) => {
  const closestElement = node.closest(scrollable.selector);
  return closestElement instanceof HTMLElement ? closestElement : document;
};
const Scrollable = ScrollableComponent;
Scrollable.ScrollTo = ScrollTo;
Scrollable.forNode = forNode;
const OBSERVER_CONFIG = {
  childList: true,
  subtree: true,
  characterData: true,
  attributeFilter: ["style"]
};
class PositionedOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      measuring: true,
      activatorRect: getRectForNode(this.props.activator),
      right: void 0,
      left: void 0,
      top: 0,
      height: 0,
      width: null,
      positioning: "below",
      zIndex: null,
      outsideScrollableContainer: false,
      lockPosition: false,
      chevronOffset: 0
    };
    this.overlay = null;
    this.scrollableContainers = [];
    this.overlayDetails = () => {
      const {
        measuring,
        left,
        right,
        positioning,
        height,
        activatorRect,
        chevronOffset
      } = this.state;
      return {
        measuring,
        left,
        right,
        desiredHeight: height,
        positioning,
        activatorRect,
        chevronOffset
      };
    };
    this.setOverlay = (node) => {
      this.overlay = node;
    };
    this.setScrollableContainers = () => {
      const containers = [];
      let scrollableContainer = Scrollable.forNode(this.props.activator);
      if (scrollableContainer) {
        containers.push(scrollableContainer);
        while (scrollableContainer == null ? void 0 : scrollableContainer.parentElement) {
          scrollableContainer = Scrollable.forNode(scrollableContainer.parentElement);
          containers.push(scrollableContainer);
        }
      }
      this.scrollableContainers = containers;
    };
    this.registerScrollHandlers = () => {
      this.scrollableContainers.forEach((node) => {
        node.addEventListener("scroll", this.handleMeasurement);
      });
    };
    this.unregisterScrollHandlers = () => {
      this.scrollableContainers.forEach((node) => {
        node.removeEventListener("scroll", this.handleMeasurement);
      });
    };
    this.handleMeasurement = () => {
      const {
        lockPosition,
        top
      } = this.state;
      this.observer.disconnect();
      this.setState(({
        left,
        top: top2,
        right
      }) => ({
        left,
        right,
        top: top2,
        height: 0,
        positioning: "below",
        measuring: true
      }), () => {
        if (this.overlay == null || this.firstScrollableContainer == null) {
          return;
        }
        const {
          activator,
          preferredPosition = "below",
          preferredAlignment = "center",
          onScrollOut,
          fullWidth,
          fixed,
          preferInputActivator = true
        } = this.props;
        const document2 = activator.ownerDocument;
        const preferredActivator = preferInputActivator ? activator.querySelector("input") || activator : activator;
        const activatorRect = getRectForNode(preferredActivator);
        const currentOverlayRect = getRectForNode(this.overlay);
        const scrollableElement = isDocument(this.firstScrollableContainer) ? document2.body : this.firstScrollableContainer;
        const scrollableContainerRect = getRectForNode(scrollableElement);
        const overlayRect = fullWidth || preferredPosition === "cover" ? new Rect({
          ...currentOverlayRect,
          width: activatorRect.width
        }) : currentOverlayRect;
        if (scrollableElement === document2.body) {
          scrollableContainerRect.height = document2.body.scrollHeight;
        }
        let topBarOffset = 0;
        const topBarElement = scrollableElement.querySelector(`${dataPolarisTopBar.selector}`);
        if (topBarElement) {
          topBarOffset = topBarElement.clientHeight;
        }
        let overlayMargins = {
          activator: 0,
          container: 0,
          horizontal: 0
        };
        if (this.overlay.firstElementChild) {
          const nodeMargins = getMarginsForNode(this.overlay.firstElementChild);
          overlayMargins = nodeMargins;
        }
        const containerRect = windowRect(activator);
        const zIndexForLayer = getZIndexForLayerFromNode(activator);
        const zIndex = zIndexForLayer == null ? zIndexForLayer : zIndexForLayer + 1;
        const verticalPosition = calculateVerticalPosition(activatorRect, overlayRect, overlayMargins, scrollableContainerRect, containerRect, preferredPosition, fixed, topBarOffset);
        const horizontalPosition = calculateHorizontalPosition(activatorRect, overlayRect, containerRect, overlayMargins, preferredAlignment);
        const chevronOffset = activatorRect.center.x - horizontalPosition + overlayMargins.horizontal * 2;
        this.setState({
          measuring: false,
          activatorRect: getRectForNode(activator),
          left: preferredAlignment !== "right" ? horizontalPosition : void 0,
          right: preferredAlignment === "right" ? horizontalPosition : void 0,
          top: lockPosition ? top : verticalPosition.top,
          lockPosition: Boolean(fixed),
          height: verticalPosition.height || 0,
          width: fullWidth || preferredPosition === "cover" ? overlayRect.width : null,
          positioning: verticalPosition.positioning,
          outsideScrollableContainer: onScrollOut != null && rectIsOutsideOfRect(activatorRect, intersectionWithViewport(scrollableContainerRect, containerRect)),
          zIndex,
          chevronOffset
        }, () => {
          if (!this.overlay) return;
          this.observer.observe(this.overlay, OBSERVER_CONFIG);
          this.observer.observe(activator, OBSERVER_CONFIG);
        });
      });
    };
    this.observer = new MutationObserver(this.handleMeasurement);
  }
  componentDidMount() {
    this.setScrollableContainers();
    if (this.scrollableContainers.length && !this.props.fixed) {
      this.registerScrollHandlers();
    }
    this.handleMeasurement();
  }
  componentWillUnmount() {
    this.observer.disconnect();
    if (this.scrollableContainers.length && !this.props.fixed) {
      this.unregisterScrollHandlers();
    }
  }
  componentDidUpdate() {
    const {
      outsideScrollableContainer,
      top
    } = this.state;
    const {
      onScrollOut,
      active
    } = this.props;
    if (active && onScrollOut != null && top !== 0 && outsideScrollableContainer) {
      onScrollOut();
    }
  }
  render() {
    var _a;
    const {
      left,
      right,
      top,
      zIndex,
      width
    } = this.state;
    const {
      render,
      fixed,
      preventInteraction,
      classNames: propClassNames,
      zIndexOverride
    } = this.props;
    const style = {
      top: top == null || isNaN(top) ? void 0 : top,
      left: left == null || isNaN(left) ? void 0 : left,
      right: right == null || isNaN(right) ? void 0 : right,
      width: width == null || isNaN(width) ? void 0 : width,
      zIndex: zIndexOverride || zIndex || void 0
    };
    const className = classNames(styles$F.PositionedOverlay, fixed && styles$F.fixed, preventInteraction && styles$F.preventInteraction, propClassNames);
    return /* @__PURE__ */ React.createElement("div", {
      className,
      style,
      ref: this.setOverlay
    }, /* @__PURE__ */ React.createElement(EventListener, {
      event: "resize",
      handler: this.handleMeasurement,
      window: (_a = this.overlay) == null ? void 0 : _a.ownerDocument.defaultView
    }), render(this.overlayDetails()));
  }
  get firstScrollableContainer() {
    return this.scrollableContainers[0] ?? null;
  }
  forceUpdatePosition() {
    requestAnimationFrame(this.handleMeasurement);
  }
}
function getMarginsForNode(node) {
  const window2 = node.ownerDocument.defaultView || globalThis.window;
  const nodeStyles = window2.getComputedStyle(node);
  return {
    activator: parseFloat(nodeStyles.marginTop || "0"),
    container: parseFloat(nodeStyles.marginBottom || "0"),
    horizontal: parseFloat(nodeStyles.marginLeft || "0")
  };
}
function getZIndexForLayerFromNode(node) {
  const layerNode = node.closest(layer.selector) || node.ownerDocument.body;
  const zIndex = layerNode === node.ownerDocument.body ? "auto" : parseInt(window.getComputedStyle(layerNode).zIndex || "0", 10);
  return zIndex === "auto" || isNaN(zIndex) ? null : zIndex;
}
function isDocument(node) {
  return node.ownerDocument === null;
}
const tailUpPaths = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", {
  d: "M18.829 8.171 11.862.921A3 3 0 0 0 7.619.838L0 8.171h1.442l6.87-6.612a2 2 0 0 1 2.83.055l6.3 6.557h1.387Z",
  fill: "var(--p-color-tooltip-tail-up-border)"
}), /* @__PURE__ */ React.createElement("path", {
  d: "M17.442 10.171h-16v-2l6.87-6.612a2 2 0 0 1 2.83.055l6.3 6.557v2Z",
  fill: "var(--p-color-bg-surface)"
}));
const tailDownPaths = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", {
  d: "m0 2 6.967 7.25a3 3 0 0 0 4.243.083L18.829 2h-1.442l-6.87 6.612a2 2 0 0 1-2.83-.055L1.387 2H0Z",
  fill: "var(--p-color-tooltip-tail-down-border)"
}), /* @__PURE__ */ React.createElement("path", {
  d: "M1.387 0h16v2l-6.87 6.612a2 2 0 0 1-2.83-.055L1.387 2V0Z",
  fill: "var(--p-color-bg-surface)"
}));
function TooltipOverlay({
  active,
  activator,
  preferredPosition = "above",
  preventInteraction,
  id,
  children,
  accessibilityLabel,
  width,
  padding,
  borderRadius,
  zIndexOverride,
  instant
}) {
  const i18n = useI18n();
  const markup = active ? /* @__PURE__ */ React.createElement(PositionedOverlay, {
    active,
    activator,
    preferredPosition,
    preventInteraction,
    render: renderTooltip,
    zIndexOverride
  }) : null;
  return markup;
  function renderTooltip(overlayDetails) {
    const {
      measuring,
      desiredHeight,
      positioning,
      chevronOffset
    } = overlayDetails;
    const containerClassName = classNames(styles$G.TooltipOverlay, measuring && styles$G.measuring, !measuring && styles$G.measured, instant && styles$G.instant, positioning === "above" && styles$G.positionedAbove);
    const contentClassName = classNames(styles$G.Content, width && styles$G[width]);
    const contentStyles = measuring ? void 0 : {
      minHeight: desiredHeight
    };
    const style = {
      "--pc-tooltip-chevron-x-pos": `${chevronOffset}px`,
      "--pc-tooltip-border-radius": borderRadius ? `var(--p-border-radius-${borderRadius})` : void 0,
      "--pc-tooltip-padding": padding && padding === "default" ? "var(--p-space-100) var(--p-space-200)" : `var(--p-space-${padding})`
    };
    return /* @__PURE__ */ React.createElement("div", Object.assign({
      style,
      className: containerClassName
    }, layer.props), /* @__PURE__ */ React.createElement("svg", {
      className: styles$G.Tail,
      width: "19",
      height: "11",
      fill: "none"
    }, positioning === "above" ? tailDownPaths : tailUpPaths), /* @__PURE__ */ React.createElement("div", {
      id,
      role: "tooltip",
      className: contentClassName,
      style: {
        ...contentStyles,
        ...style
      },
      "aria-label": accessibilityLabel ? i18n.translate("Polaris.TooltipOverlay.accessibilityLabel", {
        label: accessibilityLabel
      }) : void 0
    }, children));
  }
}
const HOVER_OUT_TIMEOUT = 150;
function Tooltip({
  children,
  content,
  dismissOnMouseOut,
  active: originalActive,
  hoverDelay,
  preferredPosition = "above",
  activatorWrapper = "span",
  accessibilityLabel,
  width = "default",
  padding = "default",
  borderRadius: borderRadiusProp,
  zIndexOverride,
  hasUnderline,
  persistOnClick,
  onOpen,
  onClose
}) {
  const borderRadius = borderRadiusProp || "200";
  const WrapperComponent = activatorWrapper;
  const {
    value: active,
    setTrue: setActiveTrue,
    setFalse: handleBlur
  } = useToggle(Boolean(originalActive));
  const {
    value: persist,
    toggle: togglePersisting
  } = useToggle(Boolean(originalActive) && Boolean(persistOnClick));
  const [activatorNode, setActivatorNode] = useState(null);
  const {
    presenceList,
    addPresence,
    removePresence
  } = useEphemeralPresenceManager();
  const id = useId();
  const activatorContainer = useRef(null);
  const mouseEntered = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(Boolean(!originalActive));
  const hoverDelayTimeout = useRef(null);
  const hoverOutTimeout = useRef(null);
  const handleFocus = useCallback(() => {
    if (originalActive !== false) {
      setActiveTrue();
    }
  }, [originalActive, setActiveTrue]);
  useEffect(() => {
    const firstFocusable = activatorContainer.current ? findFirstFocusableNode(activatorContainer.current) : null;
    const accessibilityNode = firstFocusable || activatorContainer.current;
    if (!accessibilityNode) return;
    accessibilityNode.tabIndex = 0;
    accessibilityNode.setAttribute("aria-describedby", id);
    accessibilityNode.setAttribute("data-polaris-tooltip-activator", "true");
  }, [id, children]);
  useEffect(() => {
    return () => {
      if (hoverDelayTimeout.current) {
        clearTimeout(hoverDelayTimeout.current);
      }
      if (hoverOutTimeout.current) {
        clearTimeout(hoverOutTimeout.current);
      }
    };
  }, []);
  const handleOpen = useCallback(() => {
    setShouldAnimate(!presenceList.tooltip && !active);
    onOpen == null ? void 0 : onOpen();
    addPresence("tooltip");
  }, [addPresence, presenceList.tooltip, onOpen, active]);
  const handleClose = useCallback(() => {
    onClose == null ? void 0 : onClose();
    setShouldAnimate(false);
    hoverOutTimeout.current = setTimeout(() => {
      removePresence("tooltip");
    }, HOVER_OUT_TIMEOUT);
  }, [removePresence, onClose]);
  const handleKeyUp = useCallback((event) => {
    if (event.key !== "Escape") return;
    handleClose == null ? void 0 : handleClose();
    handleBlur();
    persistOnClick && togglePersisting();
  }, [handleBlur, handleClose, persistOnClick, togglePersisting]);
  useEffect(() => {
    if (originalActive === false && active) {
      handleClose();
      handleBlur();
    }
  }, [originalActive, active, handleClose, handleBlur]);
  const portal2 = activatorNode ? /* @__PURE__ */ React.createElement(Portal, {
    idPrefix: "tooltip"
  }, /* @__PURE__ */ React.createElement(TooltipOverlay, {
    id,
    preferredPosition,
    activator: activatorNode,
    active,
    accessibilityLabel,
    onClose: noop$3,
    preventInteraction: dismissOnMouseOut,
    width,
    padding,
    borderRadius,
    zIndexOverride,
    instant: !shouldAnimate
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, content))) : null;
  const wrapperClassNames = classNames(activatorWrapper === "div" && styles$H.TooltipContainer, hasUnderline && styles$H.HasUnderline);
  return /* @__PURE__ */ React.createElement(WrapperComponent, {
    onFocus: () => {
      handleOpen();
      handleFocus();
    },
    onBlur: () => {
      handleClose();
      handleBlur();
      if (persistOnClick) {
        togglePersisting();
      }
    },
    onMouseLeave: handleMouseLeave,
    onMouseOver: handleMouseEnterFix,
    onMouseDown: persistOnClick ? togglePersisting : void 0,
    ref: setActivator,
    onKeyUp: handleKeyUp,
    className: wrapperClassNames
  }, children, portal2);
  function setActivator(node) {
    const activatorContainerRef = activatorContainer;
    if (node == null) {
      activatorContainerRef.current = null;
      setActivatorNode(null);
      return;
    }
    if (node.firstElementChild) {
      setActivatorNode(node.firstElementChild);
    }
    activatorContainerRef.current = node;
  }
  function handleMouseEnter() {
    mouseEntered.current = true;
    if (hoverDelay && !presenceList.tooltip) {
      hoverDelayTimeout.current = setTimeout(() => {
        handleOpen();
        handleFocus();
      }, hoverDelay);
    } else {
      handleOpen();
      handleFocus();
    }
  }
  function handleMouseLeave() {
    if (hoverDelayTimeout.current) {
      clearTimeout(hoverDelayTimeout.current);
      hoverDelayTimeout.current = null;
    }
    mouseEntered.current = false;
    handleClose();
    if (!persist) {
      handleBlur();
    }
  }
  function handleMouseEnterFix() {
    !mouseEntered.current && handleMouseEnter();
  }
}
function noop$3() {
}
function Item$5({
  id,
  badge,
  content,
  accessibilityLabel,
  helpText,
  url,
  onAction,
  onMouseEnter,
  icon,
  image,
  prefix,
  suffix,
  disabled,
  external,
  destructive,
  ellipsis,
  truncate,
  active,
  role,
  variant = "default"
}) {
  const className = classNames(styles$K.Item, disabled && styles$K.disabled, destructive && styles$K.destructive, active && styles$K.active, variant === "default" && styles$K.default, variant === "indented" && styles$K.indented, variant === "menu" && styles$K.menu);
  let prefixMarkup = null;
  if (prefix) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$K.Prefix
    }, prefix);
  } else if (icon) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$K.Prefix
    }, /* @__PURE__ */ React.createElement(Icon, {
      source: icon
    }));
  } else if (image) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      role: "presentation",
      className: styles$K.Prefix,
      style: {
        backgroundImage: `url(${image}`
      }
    });
  }
  let contentText = content || "";
  if (truncate && content) {
    contentText = /* @__PURE__ */ React.createElement(TruncateText, null, content);
  } else if (ellipsis) {
    contentText = `${content}…`;
  }
  const contentMarkup = helpText ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, null, contentText), /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodySm",
    tone: active || disabled ? void 0 : "subdued"
  }, helpText)) : /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd",
    fontWeight: active ? "semibold" : "regular"
  }, contentText);
  const badgeMarkup = badge && /* @__PURE__ */ React.createElement("span", {
    className: styles$K.Suffix
  }, /* @__PURE__ */ React.createElement(Badge, {
    tone: badge.tone
  }, badge.content));
  const suffixMarkup = suffix && /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement("span", {
    className: styles$K.Suffix
  }, suffix));
  const textMarkup = /* @__PURE__ */ React.createElement("span", {
    className: styles$K.Text
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd",
    fontWeight: active ? "semibold" : "regular"
  }, contentMarkup));
  const contentElement = /* @__PURE__ */ React.createElement(InlineStack, {
    blockAlign: "center",
    gap: "150",
    wrap: false
  }, prefixMarkup, textMarkup, badgeMarkup, suffixMarkup);
  const contentWrapper = /* @__PURE__ */ React.createElement(Box, {
    width: "100%"
  }, contentElement);
  const scrollMarkup = active ? /* @__PURE__ */ React.createElement(Scrollable.ScrollTo, null) : null;
  const control = url ? /* @__PURE__ */ React.createElement(UnstyledLink, {
    id,
    url: disabled ? null : url,
    className,
    external,
    "aria-label": accessibilityLabel,
    onClick: disabled ? null : onAction,
    role
  }, contentWrapper) : /* @__PURE__ */ React.createElement("button", {
    id,
    type: "button",
    className,
    disabled,
    "aria-label": accessibilityLabel,
    onClick: onAction,
    onMouseUp: handleMouseUpByBlurring,
    role,
    onMouseEnter
  }, contentWrapper);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, scrollMarkup, control);
}
const TruncateText = ({
  children
}) => {
  const theme = useTheme();
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > textRef.current.offsetWidth);
    }
  }, [children]);
  const text = /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    truncate: true
  }, /* @__PURE__ */ React.createElement(Box, {
    width: "100%",
    ref: textRef
  }, children));
  return isOverflowing ? /* @__PURE__ */ React.createElement(Tooltip, {
    zIndexOverride: Number(theme.zIndex["z-index-11"]),
    preferredPosition: "above",
    hoverDelay: 1e3,
    content: children,
    dismissOnMouseOut: true
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    truncate: true
  }, children)) : text;
};
function Section$3({
  section,
  hasMultipleSections,
  isFirst,
  actionRole,
  onActionAnyItem
}) {
  const handleAction = (itemOnAction) => {
    return () => {
      if (itemOnAction) {
        itemOnAction();
      }
      if (onActionAnyItem) {
        onActionAnyItem();
      }
    };
  };
  const actionMarkup = section.items.map(({
    content,
    helpText,
    onAction,
    ...item
  }, index) => {
    const itemMarkup = /* @__PURE__ */ React.createElement(Item$5, Object.assign({
      content,
      helpText,
      role: actionRole,
      onAction: handleAction(onAction)
    }, item));
    return /* @__PURE__ */ React.createElement(Box, {
      as: "li",
      key: `${content}-${index}`,
      role: actionRole === "menuitem" ? "presentation" : void 0
    }, /* @__PURE__ */ React.createElement(InlineStack, {
      wrap: false
    }, itemMarkup));
  });
  let titleMarkup = null;
  if (section.title) {
    titleMarkup = typeof section.title === "string" ? /* @__PURE__ */ React.createElement(Box, {
      paddingBlockStart: "300",
      paddingBlockEnd: "100",
      paddingInlineStart: "300",
      paddingInlineEnd: "300"
    }, /* @__PURE__ */ React.createElement(Text, {
      as: "p",
      variant: "headingSm"
    }, section.title)) : /* @__PURE__ */ React.createElement(Box, {
      padding: "200",
      paddingInlineEnd: "150"
    }, section.title);
  }
  let sectionRole;
  switch (actionRole) {
    case "option":
      sectionRole = "presentation";
      break;
    case "menuitem":
      sectionRole = !hasMultipleSections ? "menu" : "presentation";
      break;
    default:
      sectionRole = void 0;
      break;
  }
  const sectionMarkup = /* @__PURE__ */ React.createElement(React.Fragment, null, titleMarkup, /* @__PURE__ */ React.createElement(Box, Object.assign({
    as: "div",
    padding: "150"
  }, hasMultipleSections && {
    paddingBlockStart: "0"
  }, {
    tabIndex: !hasMultipleSections ? -1 : void 0
  }), /* @__PURE__ */ React.createElement(BlockStack, Object.assign({
    gap: "050",
    as: "ul"
  }, sectionRole && {
    role: sectionRole
  }), actionMarkup)));
  return hasMultipleSections ? /* @__PURE__ */ React.createElement(Box, Object.assign({
    as: "li",
    role: "presentation",
    borderColor: "border-secondary"
  }, !isFirst && {
    borderBlockStartWidth: "025"
  }, !section.title && {
    paddingBlockStart: "150"
  }), sectionMarkup) : sectionMarkup;
}
function KeypressListener({
  keyCode,
  handler,
  keyEvent = "keyup",
  options,
  useCapture,
  document: ownerDocument = globalThis.document
}) {
  const tracked = useRef({
    handler,
    keyCode
  });
  useIsomorphicLayoutEffect(() => {
    tracked.current = {
      handler,
      keyCode
    };
  }, [handler, keyCode]);
  const handleKeyEvent = useCallback((event) => {
    const {
      handler: handler2,
      keyCode: keyCode2
    } = tracked.current;
    if (event.keyCode === keyCode2) {
      handler2(event);
    }
  }, []);
  useEffect(() => {
    ownerDocument.addEventListener(keyEvent, handleKeyEvent, useCapture || options);
    return () => {
      ownerDocument.removeEventListener(keyEvent, handleKeyEvent, useCapture || options);
    };
  }, [keyEvent, handleKeyEvent, useCapture, options, ownerDocument]);
  return null;
}
var styles$D = {
  "TextField": "Polaris-TextField",
  "ClearButton": "Polaris-TextField__ClearButton",
  "Loading": "Polaris-TextField__Loading",
  "disabled": "Polaris-TextField--disabled",
  "error": "Polaris-TextField--error",
  "readOnly": "Polaris-TextField--readOnly",
  "Input": "Polaris-TextField__Input",
  "Backdrop": "Polaris-TextField__Backdrop",
  "multiline": "Polaris-TextField--multiline",
  "hasValue": "Polaris-TextField--hasValue",
  "focus": "Polaris-TextField--focus",
  "VerticalContent": "Polaris-TextField__VerticalContent",
  "InputAndSuffixWrapper": "Polaris-TextField__InputAndSuffixWrapper",
  "toneMagic": "Polaris-TextField--toneMagic",
  "Prefix": "Polaris-TextField__Prefix",
  "Suffix": "Polaris-TextField__Suffix",
  "AutoSizeWrapper": "Polaris-TextField__AutoSizeWrapper",
  "AutoSizeWrapperWithSuffix": "Polaris-TextField__AutoSizeWrapperWithSuffix",
  "suggestion": "Polaris-TextField--suggestion",
  "borderless": "Polaris-TextField--borderless",
  "slim": "Polaris-TextField--slim",
  "Input-hasClearButton": "Polaris-TextField__Input--hasClearButton",
  "Input-suffixed": "Polaris-TextField__Input--suffixed",
  "Input-alignRight": "Polaris-TextField__Input--alignRight",
  "Input-alignLeft": "Polaris-TextField__Input--alignLeft",
  "Input-alignCenter": "Polaris-TextField__Input--alignCenter",
  "Input-autoSize": "Polaris-TextField__Input--autoSize",
  "PrefixIcon": "Polaris-TextField__PrefixIcon",
  "CharacterCount": "Polaris-TextField__CharacterCount",
  "AlignFieldBottom": "Polaris-TextField__AlignFieldBottom",
  "Spinner": "Polaris-TextField__Spinner",
  "SpinnerIcon": "Polaris-TextField__SpinnerIcon",
  "Resizer": "Polaris-TextField__Resizer",
  "DummyInput": "Polaris-TextField__DummyInput",
  "Segment": "Polaris-TextField__Segment",
  "monospaced": "Polaris-TextField--monospaced"
};
var styles$C = {
  "hidden": "Polaris-Labelled--hidden",
  "LabelWrapper": "Polaris-Labelled__LabelWrapper",
  "disabled": "Polaris-Labelled--disabled",
  "HelpText": "Polaris-Labelled__HelpText",
  "readOnly": "Polaris-Labelled--readOnly",
  "Error": "Polaris-Labelled__Error",
  "Action": "Polaris-Labelled__Action"
};
var styles$B = {
  "InlineError": "Polaris-InlineError",
  "Icon": "Polaris-InlineError__Icon"
};
function InlineError({
  message,
  fieldID
}) {
  if (!message) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("div", {
    id: errorTextID(fieldID),
    className: styles$B.InlineError
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$B.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: AlertCircleIcon
  })), /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, message));
}
function errorTextID(id) {
  return `${id}Error`;
}
var styles$A = {
  "Label": "Polaris-Label",
  "hidden": "Polaris-Label--hidden",
  "Text": "Polaris-Label__Text",
  "RequiredIndicator": "Polaris-Label__RequiredIndicator"
};
function labelID(id) {
  return `${id}Label`;
}
function Label({
  children,
  id,
  hidden,
  requiredIndicator
}) {
  const className = classNames(styles$A.Label, hidden && styles$A.hidden);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("label", {
    id: labelID(id),
    htmlFor: id,
    className: classNames(styles$A.Text, requiredIndicator && styles$A.RequiredIndicator)
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, children)));
}
function Labelled({
  id,
  label,
  error,
  action: action2,
  helpText,
  children,
  labelHidden,
  requiredIndicator,
  disabled,
  readOnly,
  ...rest
}) {
  const className = classNames(labelHidden && styles$C.hidden, disabled && styles$C.disabled, readOnly && styles$C.readOnly);
  const actionMarkup = action2 ? /* @__PURE__ */ React.createElement("div", {
    className: styles$C.Action
  }, buttonFrom(action2, {
    variant: "plain"
  })) : null;
  const helpTextMarkup = helpText ? /* @__PURE__ */ React.createElement("div", {
    className: styles$C.HelpText,
    id: helpTextID$1(id),
    "aria-disabled": disabled
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    tone: "subdued",
    variant: "bodyMd",
    breakWord: true
  }, helpText)) : null;
  const errorMarkup = error && typeof error !== "boolean" && /* @__PURE__ */ React.createElement("div", {
    className: styles$C.Error
  }, /* @__PURE__ */ React.createElement(InlineError, {
    message: error,
    fieldID: id
  }));
  const labelMarkup = label ? /* @__PURE__ */ React.createElement("div", {
    className: styles$C.LabelWrapper
  }, /* @__PURE__ */ React.createElement(Label, Object.assign({
    id,
    requiredIndicator
  }, rest, {
    hidden: false
  }), label), actionMarkup) : null;
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, labelMarkup, children, errorMarkup, helpTextMarkup);
}
function helpTextID$1(id) {
  return `${id}HelpText`;
}
var styles$z = {
  "Connected": "Polaris-Connected",
  "Item": "Polaris-Connected__Item",
  "Item-primary": "Polaris-Connected__Item--primary",
  "Item-focused": "Polaris-Connected__Item--focused"
};
function Item$4({
  children,
  position
}) {
  const {
    value: focused,
    setTrue: forceTrueFocused,
    setFalse: forceFalseFocused
  } = useToggle(false);
  const className = classNames(styles$z.Item, focused && styles$z["Item-focused"], position === "primary" ? styles$z["Item-primary"] : styles$z["Item-connection"]);
  return /* @__PURE__ */ React.createElement("div", {
    onBlur: forceFalseFocused,
    onFocus: forceTrueFocused,
    className
  }, children);
}
function Connected({
  children,
  left,
  right
}) {
  const leftConnectionMarkup = left ? /* @__PURE__ */ React.createElement(Item$4, {
    position: "left"
  }, left) : null;
  const rightConnectionMarkup = right ? /* @__PURE__ */ React.createElement(Item$4, {
    position: "right"
  }, right) : null;
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$z.Connected
  }, leftConnectionMarkup, /* @__PURE__ */ React.createElement(Item$4, {
    position: "primary"
  }, children), rightConnectionMarkup);
}
const Spinner = /* @__PURE__ */ React.forwardRef(function Spinner2({
  onChange,
  onClick,
  onMouseDown,
  onMouseUp,
  onBlur
}, ref) {
  function handleStep(step) {
    return () => onChange(step);
  }
  function handleMouseDown(onChange2) {
    return (event) => {
      if (event.button !== 0) return;
      onMouseDown == null ? void 0 : onMouseDown(onChange2);
    };
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$D.Spinner,
    onClick,
    "aria-hidden": true,
    ref
  }, /* @__PURE__ */ React.createElement("div", {
    role: "button",
    className: styles$D.Segment,
    tabIndex: -1,
    onClick: handleStep(1),
    onMouseDown: handleMouseDown(handleStep(1)),
    onMouseUp,
    onBlur
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$D.SpinnerIcon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: ChevronUpIcon
  }))), /* @__PURE__ */ React.createElement("div", {
    role: "button",
    className: styles$D.Segment,
    tabIndex: -1,
    onClick: handleStep(-1),
    onMouseDown: handleMouseDown(handleStep(-1)),
    onMouseUp,
    onBlur
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$D.SpinnerIcon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: ChevronDownIcon
  }))));
});
function Resizer({
  contents,
  currentHeight: currentHeightProp = null,
  minimumLines,
  onHeightChange
}) {
  const contentNode = useRef(null);
  const minimumLinesNode = useRef(null);
  const animationFrame = useRef();
  const currentHeight = useRef(currentHeightProp);
  if (currentHeightProp !== currentHeight.current) {
    currentHeight.current = currentHeightProp;
  }
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);
  const minimumLinesMarkup = minimumLines ? /* @__PURE__ */ React.createElement("div", {
    ref: minimumLinesNode,
    className: styles$D.DummyInput,
    dangerouslySetInnerHTML: {
      __html: getContentsForMinimumLines(minimumLines)
    }
  }) : null;
  const handleHeightCheck = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    animationFrame.current = requestAnimationFrame(() => {
      if (!contentNode.current || !minimumLinesNode.current) {
        return;
      }
      const newHeight = Math.max(contentNode.current.offsetHeight, minimumLinesNode.current.offsetHeight);
      if (newHeight !== currentHeight.current) {
        onHeightChange(newHeight);
      }
    });
  }, [onHeightChange]);
  useIsomorphicLayoutEffect(() => {
    handleHeightCheck();
  });
  return /* @__PURE__ */ React.createElement("div", {
    "aria-hidden": true,
    className: styles$D.Resizer
  }, /* @__PURE__ */ React.createElement(EventListener, {
    event: "resize",
    handler: handleHeightCheck
  }), /* @__PURE__ */ React.createElement("div", {
    ref: contentNode,
    className: styles$D.DummyInput,
    dangerouslySetInnerHTML: {
      __html: getFinalContents(contents)
    }
  }), minimumLinesMarkup);
}
const ENTITIES_TO_REPLACE = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\n": "<br>",
  "\r": ""
};
const REPLACE_REGEX = new RegExp(`[${Object.keys(ENTITIES_TO_REPLACE).join()}]`, "g");
function replaceEntity(entity) {
  return ENTITIES_TO_REPLACE[entity];
}
function getContentsForMinimumLines(minimumLines) {
  let content = "";
  for (let line = 0; line < minimumLines; line++) {
    content += "<br>";
  }
  return content;
}
function getFinalContents(contents) {
  return contents ? `${contents.replace(REPLACE_REGEX, replaceEntity)}<br>` : "<br>";
}
function TextField({
  prefix,
  suffix,
  verticalContent,
  placeholder,
  value = "",
  helpText,
  label,
  labelAction,
  labelHidden,
  disabled,
  clearButton,
  readOnly,
  autoFocus,
  focused,
  multiline,
  error,
  connectedRight,
  connectedLeft,
  type = "text",
  name,
  id: idProp,
  role,
  step,
  largeStep,
  autoComplete,
  max,
  maxLength,
  maxHeight,
  min,
  minLength,
  pattern,
  inputMode,
  spellCheck,
  ariaOwns,
  ariaControls,
  ariaExpanded,
  ariaActiveDescendant,
  ariaAutocomplete,
  showCharacterCount,
  align,
  requiredIndicator,
  monospaced,
  selectTextOnFocus,
  suggestion,
  variant = "inherit",
  size = "medium",
  onClearButtonClick,
  onChange,
  onSpinnerChange,
  onFocus,
  onBlur,
  tone,
  autoSize,
  loading
}) {
  const i18n = useI18n();
  const [height, setHeight] = useState(null);
  const [focus, setFocus] = useState(Boolean(focused));
  const isAfterInitial = useIsAfterInitialMount();
  const uniqId = useId();
  const id = idProp ?? uniqId;
  const textFieldRef = useRef(null);
  const inputRef = useRef(null);
  const textAreaRef = useRef(null);
  const prefixRef = useRef(null);
  const suffixRef = useRef(null);
  const loadingRef = useRef(null);
  const verticalContentRef = useRef(null);
  const buttonPressTimer = useRef();
  const spinnerRef = useRef(null);
  const getInputRef = useCallback(() => {
    return multiline ? textAreaRef.current : inputRef.current;
  }, [multiline]);
  useEffect(() => {
    const input2 = getInputRef();
    if (!input2 || focused === void 0) return;
    focused ? input2.focus() : input2.blur();
  }, [focused, verticalContent, getInputRef]);
  useEffect(() => {
    const input2 = inputRef.current;
    const isSupportedInputType = type === "text" || type === "tel" || type === "search" || type === "url" || type === "password";
    if (!input2 || !isSupportedInputType || !suggestion) {
      return;
    }
    input2.setSelectionRange(value.length, suggestion.length);
  }, [focus, value, type, suggestion]);
  const normalizedValue = suggestion ? suggestion : value;
  const normalizedStep = step != null ? step : 1;
  const normalizedMax = max != null ? max : Infinity;
  const normalizedMin = min != null ? min : -Infinity;
  const className = classNames(styles$D.TextField, Boolean(normalizedValue) && styles$D.hasValue, disabled && styles$D.disabled, readOnly && styles$D.readOnly, error && styles$D.error, tone && styles$D[variationName("tone", tone)], multiline && styles$D.multiline, focus && !disabled && styles$D.focus, variant !== "inherit" && styles$D[variant], size === "slim" && styles$D.slim);
  const inputType = type === "currency" ? "text" : type;
  const isNumericType = type === "number" || type === "integer";
  const iconPrefix = /* @__PURE__ */ React.isValidElement(prefix) && prefix.type === Icon;
  const prefixMarkup = prefix ? /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$D.Prefix, iconPrefix && styles$D.PrefixIcon),
    id: `${id}-Prefix`,
    ref: prefixRef
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, prefix)) : null;
  const suffixMarkup = suffix ? /* @__PURE__ */ React.createElement("div", {
    className: styles$D.Suffix,
    id: `${id}-Suffix`,
    ref: suffixRef
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, suffix)) : null;
  const loadingMarkup = loading ? /* @__PURE__ */ React.createElement("div", {
    className: styles$D.Loading,
    id: `${id}-Loading`,
    ref: loadingRef
  }, /* @__PURE__ */ React.createElement(Spinner$1, {
    size: "small"
  })) : null;
  let characterCountMarkup = null;
  if (showCharacterCount) {
    const characterCount = normalizedValue.length;
    const characterCountLabel = maxLength ? i18n.translate("Polaris.TextField.characterCountWithMaxLength", {
      count: characterCount,
      limit: maxLength
    }) : i18n.translate("Polaris.TextField.characterCount", {
      count: characterCount
    });
    const characterCountClassName = classNames(styles$D.CharacterCount, multiline && styles$D.AlignFieldBottom);
    const characterCountText = !maxLength ? characterCount : `${characterCount}/${maxLength}`;
    characterCountMarkup = /* @__PURE__ */ React.createElement("div", {
      id: `${id}-CharacterCounter`,
      className: characterCountClassName,
      "aria-label": characterCountLabel,
      "aria-live": focus ? "polite" : "off",
      "aria-atomic": "true",
      onClick: handleClickChild
    }, /* @__PURE__ */ React.createElement(Text, {
      as: "span",
      variant: "bodyMd"
    }, characterCountText));
  }
  const clearButtonVisible = normalizedValue !== "";
  const clearButtonMarkup = clearButton && clearButtonVisible ? /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: styles$D.ClearButton,
    onClick: handleClearButtonPress,
    disabled
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    visuallyHidden: true
  }, i18n.translate("Polaris.Common.clear")), /* @__PURE__ */ React.createElement(Icon, {
    source: XCircleIcon,
    tone: "base"
  })) : null;
  const handleNumberChange = useCallback((steps, stepAmount = normalizedStep) => {
    if (onChange == null && onSpinnerChange == null) {
      return;
    }
    const dpl = (num) => (num.toString().split(".")[1] || []).length;
    const numericValue = value ? parseFloat(value) : 0;
    if (isNaN(numericValue)) {
      return;
    }
    const decimalPlaces = type === "integer" ? 0 : Math.max(dpl(numericValue), dpl(stepAmount));
    const newValue = Math.min(Number(normalizedMax), Math.max(numericValue + steps * stepAmount, Number(normalizedMin)));
    if (onSpinnerChange != null) {
      onSpinnerChange(String(newValue.toFixed(decimalPlaces)), id);
    } else if (onChange != null) {
      onChange(String(newValue.toFixed(decimalPlaces)), id);
    }
  }, [id, normalizedMax, normalizedMin, onChange, onSpinnerChange, normalizedStep, type, value]);
  const handleSpinnerButtonRelease = useCallback(() => {
    clearTimeout(buttonPressTimer.current);
  }, []);
  const handleSpinnerButtonPress = useCallback((onChange2) => {
    const minInterval = 50;
    const decrementBy = 10;
    let interval = 200;
    const onChangeInterval = () => {
      if (interval > minInterval) interval -= decrementBy;
      onChange2(0);
      buttonPressTimer.current = window.setTimeout(onChangeInterval, interval);
    };
    buttonPressTimer.current = window.setTimeout(onChangeInterval, interval);
    document.addEventListener("mouseup", handleSpinnerButtonRelease, {
      once: true
    });
  }, [handleSpinnerButtonRelease]);
  const spinnerMarkup = isNumericType && step !== 0 && !disabled && !readOnly ? /* @__PURE__ */ React.createElement(Spinner, {
    onClick: handleClickChild,
    onChange: handleNumberChange,
    onMouseDown: handleSpinnerButtonPress,
    onMouseUp: handleSpinnerButtonRelease,
    ref: spinnerRef,
    onBlur: handleOnBlur
  }) : null;
  const style = multiline && height ? {
    height,
    maxHeight
  } : null;
  const handleExpandingResize = useCallback((height2) => {
    setHeight(height2);
  }, []);
  const resizer = multiline && isAfterInitial ? /* @__PURE__ */ React.createElement(Resizer, {
    contents: normalizedValue || placeholder,
    currentHeight: height,
    minimumLines: typeof multiline === "number" ? multiline : 1,
    onHeightChange: handleExpandingResize
  }) : null;
  const describedBy = [];
  if (error) {
    describedBy.push(`${id}Error`);
  }
  if (helpText) {
    describedBy.push(helpTextID$1(id));
  }
  if (showCharacterCount) {
    describedBy.push(`${id}-CharacterCounter`);
  }
  const labelledBy = [];
  if (prefix) {
    labelledBy.push(`${id}-Prefix`);
  }
  if (suffix) {
    labelledBy.push(`${id}-Suffix`);
  }
  if (verticalContent) {
    labelledBy.push(`${id}-VerticalContent`);
  }
  labelledBy.unshift(labelID(id));
  const inputClassName = classNames(styles$D.Input, align && styles$D[variationName("Input-align", align)], suffix && styles$D["Input-suffixed"], clearButton && styles$D["Input-hasClearButton"], monospaced && styles$D.monospaced, suggestion && styles$D.suggestion, autoSize && styles$D["Input-autoSize"]);
  const handleOnFocus = (event) => {
    setFocus(true);
    if (selectTextOnFocus && !suggestion) {
      const input2 = getInputRef();
      input2 == null ? void 0 : input2.select();
    }
    if (onFocus) {
      onFocus(event);
    }
  };
  useEventListener("wheel", handleOnWheel, inputRef);
  function handleOnWheel(event) {
    if (document.activeElement === event.target && isNumericType) {
      event.stopPropagation();
    }
  }
  const input = /* @__PURE__ */ createElement(multiline ? "textarea" : "input", {
    name,
    id,
    disabled,
    readOnly,
    role,
    autoFocus,
    value: normalizedValue,
    placeholder,
    style,
    autoComplete,
    className: inputClassName,
    ref: multiline ? textAreaRef : inputRef,
    min,
    max,
    step,
    minLength,
    maxLength,
    spellCheck,
    pattern,
    inputMode,
    type: inputType,
    rows: getRows(multiline),
    size: autoSize ? 1 : void 0,
    "aria-describedby": describedBy.length ? describedBy.join(" ") : void 0,
    "aria-labelledby": labelledBy.join(" "),
    "aria-invalid": Boolean(error),
    "aria-owns": ariaOwns,
    "aria-activedescendant": ariaActiveDescendant,
    "aria-autocomplete": ariaAutocomplete,
    "aria-controls": ariaControls,
    "aria-expanded": ariaExpanded,
    "aria-required": requiredIndicator,
    ...normalizeAriaMultiline(multiline),
    onFocus: handleOnFocus,
    onBlur: handleOnBlur,
    onClick: handleClickChild,
    onKeyPress: handleKeyPress,
    onKeyDown: handleKeyDown,
    onChange: !suggestion ? handleChange : void 0,
    onInput: suggestion ? handleChange : void 0,
    // 1Password disable data attribute
    "data-1p-ignore": autoComplete === "off" || void 0,
    // LastPass disable data attribute
    "data-lpignore": autoComplete === "off" || void 0,
    // Dashlane disable data attribute
    "data-form-type": autoComplete === "off" ? "other" : void 0
  });
  const inputWithVerticalContentMarkup = verticalContent ? /* @__PURE__ */ React.createElement("div", {
    className: styles$D.VerticalContent,
    id: `${id}-VerticalContent`,
    ref: verticalContentRef,
    onClick: handleClickChild
  }, verticalContent, input) : null;
  const inputMarkup = verticalContent ? inputWithVerticalContentMarkup : input;
  const backdropMarkup = /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$D.Backdrop, connectedLeft && styles$D["Backdrop-connectedLeft"], connectedRight && styles$D["Backdrop-connectedRight"])
  });
  const inputAndSuffixMarkup = autoSize ? /* @__PURE__ */ React.createElement("div", {
    className: styles$D.InputAndSuffixWrapper
  }, /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$D.AutoSizeWrapper, suffix && styles$D.AutoSizeWrapperWithSuffix),
    "data-auto-size-value": value || placeholder
  }, inputMarkup), suffixMarkup) : /* @__PURE__ */ React.createElement(React.Fragment, null, inputMarkup, suffixMarkup);
  return /* @__PURE__ */ React.createElement(Labelled, {
    label,
    id,
    error,
    action: labelAction,
    labelHidden,
    helpText,
    requiredIndicator,
    disabled,
    readOnly
  }, /* @__PURE__ */ React.createElement(Connected, {
    left: connectedLeft,
    right: connectedRight
  }, /* @__PURE__ */ React.createElement("div", {
    className,
    onClick: handleClick,
    ref: textFieldRef
  }, prefixMarkup, inputAndSuffixMarkup, characterCountMarkup, loadingMarkup, clearButtonMarkup, spinnerMarkup, backdropMarkup, resizer)));
  function handleChange(event) {
    onChange && onChange(event.currentTarget.value, id);
  }
  function handleClick(event) {
    var _a, _b, _c;
    const {
      target
    } = event;
    const inputRefRole = (_a = inputRef == null ? void 0 : inputRef.current) == null ? void 0 : _a.getAttribute("role");
    if (target === inputRef.current && inputRefRole === "combobox") {
      (_b = inputRef.current) == null ? void 0 : _b.focus();
      handleOnFocus(event);
      return;
    }
    if (isPrefixOrSuffix(target) || isVerticalContent(target) || isInput(target) || isSpinner(target) || isLoadingSpinner(target) || focus) {
      return;
    }
    (_c = getInputRef()) == null ? void 0 : _c.focus();
  }
  function handleClickChild(event) {
    var _a;
    if (!isSpinner(event.target) && !isInput(event.target)) {
      event.stopPropagation();
    }
    if (isPrefixOrSuffix(event.target) || isVerticalContent(event.target) || isInput(event.target) || isLoadingSpinner(event.target) || focus) {
      return;
    }
    setFocus(true);
    (_a = getInputRef()) == null ? void 0 : _a.focus();
  }
  function handleClearButtonPress() {
    onClearButtonClick && onClearButtonClick(id);
  }
  function handleKeyPress(event) {
    const {
      key,
      which
    } = event;
    const numbersSpec = /[\d.,eE+-]$/;
    const integerSpec = /[\deE+-]$/;
    if (!isNumericType || which === Key.Enter || type === "number" && numbersSpec.test(key) || type === "integer" && integerSpec.test(key)) {
      return;
    }
    event.preventDefault();
  }
  function handleKeyDown(event) {
    if (!isNumericType) {
      return;
    }
    const {
      key,
      which
    } = event;
    if (type === "integer" && (key === "ArrowUp" || which === Key.UpArrow)) {
      handleNumberChange(1);
      event.preventDefault();
    }
    if (type === "integer" && (key === "ArrowDown" || which === Key.DownArrow)) {
      handleNumberChange(-1);
      event.preventDefault();
    }
    if ((which === Key.Home || key === "Home") && min !== void 0) {
      if (onSpinnerChange != null) {
        onSpinnerChange(String(min), id);
      } else if (onChange != null) {
        onChange(String(min), id);
      }
    }
    if ((which === Key.End || key === "End") && max !== void 0) {
      if (onSpinnerChange != null) {
        onSpinnerChange(String(max), id);
      } else if (onChange != null) {
        onChange(String(max), id);
      }
    }
    if ((which === Key.PageUp || key === "PageUp") && largeStep !== void 0) {
      handleNumberChange(1, largeStep);
    }
    if ((which === Key.PageDown || key === "PageDown") && largeStep !== void 0) {
      handleNumberChange(-1, largeStep);
    }
  }
  function handleOnBlur(event) {
    var _a;
    setFocus(false);
    if ((_a = textFieldRef.current) == null ? void 0 : _a.contains(event == null ? void 0 : event.relatedTarget)) {
      return;
    }
    if (onBlur) {
      onBlur(event);
    }
  }
  function isInput(target) {
    const input2 = getInputRef();
    return target instanceof HTMLElement && input2 && (input2.contains(target) || input2.contains(document.activeElement));
  }
  function isPrefixOrSuffix(target) {
    return target instanceof Element && (prefixRef.current && prefixRef.current.contains(target) || suffixRef.current && suffixRef.current.contains(target));
  }
  function isSpinner(target) {
    return target instanceof Element && spinnerRef.current && spinnerRef.current.contains(target);
  }
  function isLoadingSpinner(target) {
    return target instanceof Element && loadingRef.current && loadingRef.current.contains(target);
  }
  function isVerticalContent(target) {
    return target instanceof Element && verticalContentRef.current && (verticalContentRef.current.contains(target) || verticalContentRef.current.contains(document.activeElement));
  }
}
function getRows(multiline) {
  if (!multiline) return void 0;
  return typeof multiline === "number" ? multiline : 1;
}
function normalizeAriaMultiline(multiline) {
  if (!multiline) return void 0;
  return Boolean(multiline) || typeof multiline === "number" && multiline > 0 ? {
    "aria-multiline": true
  } : void 0;
}
const FILTER_ACTIONS_THRESHOLD = 8;
function ActionList({
  items,
  sections = [],
  actionRole,
  allowFiltering,
  onActionAnyItem,
  filterLabel
}) {
  const i18n = useI18n();
  const filterActions = useContext(FilterActionsContext);
  let finalSections = [];
  const actionListRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  if (items) {
    finalSections = [{
      items
    }, ...sections];
  } else if (sections) {
    finalSections = sections;
  }
  const isFilterable = finalSections == null ? void 0 : finalSections.some((section) => section.items.some((item) => typeof item.content === "string"));
  const hasMultipleSections = finalSections.length > 1;
  const elementRole = hasMultipleSections && actionRole === "menuitem" ? "menu" : void 0;
  const elementTabIndex = hasMultipleSections && actionRole === "menuitem" ? -1 : void 0;
  const filteredSections = finalSections == null ? void 0 : finalSections.map((section) => ({
    ...section,
    items: section.items.filter(({
      content
    }) => typeof content === "string" ? content == null ? void 0 : content.toLowerCase().includes(searchText.toLowerCase()) : content)
  }));
  const sectionMarkup = filteredSections.map((section, index) => {
    return section.items.length > 0 ? /* @__PURE__ */ React.createElement(Section$3, {
      key: typeof section.title === "string" ? section.title : index,
      section,
      hasMultipleSections,
      actionRole,
      onActionAnyItem,
      isFirst: index === 0
    }) : null;
  });
  const handleFocusPreviousItem = (evt) => {
    evt.preventDefault();
    if (actionListRef.current && evt.target) {
      if (actionListRef.current.contains(evt.target)) {
        wrapFocusPreviousFocusableMenuItem(actionListRef.current, evt.target);
      }
    }
  };
  const handleFocusNextItem = (evt) => {
    evt.preventDefault();
    if (actionListRef.current && evt.target) {
      if (actionListRef.current.contains(evt.target)) {
        wrapFocusNextFocusableMenuItem(actionListRef.current, evt.target);
      }
    }
  };
  const listeners = actionRole === "menuitem" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(KeypressListener, {
    keyEvent: "keydown",
    keyCode: Key.DownArrow,
    handler: handleFocusNextItem
  }), /* @__PURE__ */ React.createElement(KeypressListener, {
    keyEvent: "keydown",
    keyCode: Key.UpArrow,
    handler: handleFocusPreviousItem
  })) : null;
  const totalFilteredActions = useMemo(() => {
    const totalSectionItems = (filteredSections == null ? void 0 : filteredSections.reduce((acc, section) => acc + section.items.length, 0)) || 0;
    return totalSectionItems;
  }, [filteredSections]);
  const totalActions = (finalSections == null ? void 0 : finalSections.reduce((acc, section) => acc + section.items.length, 0)) || 0;
  const hasManyActions = totalActions >= FILTER_ACTIONS_THRESHOLD;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, (allowFiltering || filterActions) && hasManyActions && isFilterable && /* @__PURE__ */ React.createElement(Box, {
    padding: "200",
    paddingBlockEnd: totalFilteredActions > 0 ? "0" : "200"
  }, /* @__PURE__ */ React.createElement(TextField, {
    clearButton: true,
    labelHidden: true,
    label: filterLabel ? filterLabel : i18n.translate("Polaris.ActionList.SearchField.placeholder"),
    placeholder: filterLabel ? filterLabel : i18n.translate("Polaris.ActionList.SearchField.placeholder"),
    autoComplete: "off",
    value: searchText,
    onChange: (value) => setSearchText(value),
    prefix: /* @__PURE__ */ React.createElement(Icon, {
      source: SearchIcon
    }),
    onClearButtonClick: () => setSearchText("")
  })), /* @__PURE__ */ React.createElement(Box, {
    as: hasMultipleSections ? "ul" : "div",
    ref: actionListRef,
    role: elementRole,
    tabIndex: elementTabIndex
  }, listeners, sectionMarkup));
}
ActionList.Item = Item$5;
var styles$y = {
  "ActionMenu": "Polaris-ActionMenu"
};
var styles$x = {
  "RollupActivator": "Polaris-ActionMenu-RollupActions__RollupActivator"
};
function setActivatorAttributes(activator, {
  id,
  active = false,
  ariaHaspopup,
  activatorDisabled = false
}) {
  if (!activatorDisabled) {
    activator.tabIndex = activator.tabIndex || 0;
  }
  activator.setAttribute("aria-controls", id);
  activator.setAttribute("aria-owns", id);
  activator.setAttribute("aria-expanded", String(active));
  activator.setAttribute("data-state", active ? "open" : "closed");
  if (ariaHaspopup != null) {
    activator.setAttribute("aria-haspopup", String(ariaHaspopup));
  }
}
function wrapWithComponent(element, Component2, props) {
  if (element == null) {
    return null;
  }
  return isElementOfType(element, Component2) ? element : /* @__PURE__ */ React.createElement(Component2, props, element);
}
const isComponent = process.env.NODE_ENV === "development" ? hotReloadComponentCheck : (AComponent, AnotherComponent) => AComponent === AnotherComponent;
function isElementOfType(element, Component2) {
  var _a;
  if (element == null || !/* @__PURE__ */ isValidElement(element) || typeof element.type === "string") {
    return false;
  }
  const {
    type: defaultType
  } = element;
  const overrideType = (_a = element.props) == null ? void 0 : _a.__type__;
  const type = overrideType || defaultType;
  const Components = Array.isArray(Component2) ? Component2 : [Component2];
  return Components.some((AComponent) => typeof type !== "string" && isComponent(AComponent, type));
}
function elementChildren(children, predicate = () => true) {
  return Children.toArray(children).filter((child) => /* @__PURE__ */ isValidElement(child) && predicate(child));
}
function ConditionalWrapper({
  condition,
  wrapper,
  children
}) {
  return condition ? wrapper(children) : children;
}
function ConditionalRender({
  condition,
  children
}) {
  return condition ? children : null;
}
function hotReloadComponentCheck(AComponent, AnotherComponent) {
  const componentName = AComponent.name;
  const anotherComponentName = AnotherComponent.displayName;
  return AComponent === AnotherComponent || Boolean(componentName) && componentName === anotherComponentName;
}
var styles$w = {
  "Popover": "Polaris-Popover",
  "PopoverOverlay": "Polaris-Popover__PopoverOverlay",
  "PopoverOverlay-noAnimation": "Polaris-Popover__PopoverOverlay--noAnimation",
  "PopoverOverlay-entering": "Polaris-Popover__PopoverOverlay--entering",
  "PopoverOverlay-open": "Polaris-Popover__PopoverOverlay--open",
  "measuring": "Polaris-Popover--measuring",
  "PopoverOverlay-exiting": "Polaris-Popover__PopoverOverlay--exiting",
  "fullWidth": "Polaris-Popover--fullWidth",
  "Content": "Polaris-Popover__Content",
  "positionedAbove": "Polaris-Popover--positionedAbove",
  "positionedCover": "Polaris-Popover--positionedCover",
  "ContentContainer": "Polaris-Popover__ContentContainer",
  "Content-fullHeight": "Polaris-Popover__Content--fullHeight",
  "Content-fluidContent": "Polaris-Popover__Content--fluidContent",
  "Pane": "Polaris-Popover__Pane",
  "Pane-fixed": "Polaris-Popover__Pane--fixed",
  "Pane-subdued": "Polaris-Popover__Pane--subdued",
  "Pane-captureOverscroll": "Polaris-Popover__Pane--captureOverscroll",
  "Section": "Polaris-Popover__Section",
  "FocusTracker": "Polaris-Popover__FocusTracker",
  "PopoverOverlay-hideOnPrint": "Polaris-Popover__PopoverOverlay--hideOnPrint"
};
function Section$2({
  children
}) {
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$w.Section
  }, /* @__PURE__ */ React.createElement(Box, {
    paddingInlineStart: "300",
    paddingInlineEnd: "300",
    paddingBlockStart: "200",
    paddingBlockEnd: "150"
  }, children));
}
function Pane({
  captureOverscroll = false,
  fixed,
  sectioned,
  children,
  height,
  maxHeight,
  minHeight,
  subdued,
  onScrolledToBottom
}) {
  const className = classNames(styles$w.Pane, fixed && styles$w["Pane-fixed"], subdued && styles$w["Pane-subdued"], captureOverscroll && styles$w["Pane-captureOverscroll"]);
  const content = sectioned ? wrapWithComponent(children, Section$2, {}) : children;
  const style = {
    height,
    maxHeight,
    minHeight
  };
  return fixed ? /* @__PURE__ */ React.createElement("div", {
    style,
    className
  }, content) : /* @__PURE__ */ React.createElement(Scrollable, {
    shadow: true,
    className,
    style,
    onScrolledToBottom,
    scrollbarWidth: "thin"
  }, content);
}
let PopoverCloseSource = /* @__PURE__ */ (function(PopoverCloseSource2) {
  PopoverCloseSource2[PopoverCloseSource2["Click"] = 0] = "Click";
  PopoverCloseSource2[PopoverCloseSource2["EscapeKeypress"] = 1] = "EscapeKeypress";
  PopoverCloseSource2[PopoverCloseSource2["FocusOut"] = 2] = "FocusOut";
  PopoverCloseSource2[PopoverCloseSource2["ScrollOut"] = 3] = "ScrollOut";
  return PopoverCloseSource2;
})({});
var TransitionStatus = /* @__PURE__ */ (function(TransitionStatus2) {
  TransitionStatus2["Entering"] = "entering";
  TransitionStatus2["Entered"] = "entered";
  TransitionStatus2["Exiting"] = "exiting";
  TransitionStatus2["Exited"] = "exited";
  return TransitionStatus2;
})(TransitionStatus || {});
class PopoverOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      transitionStatus: this.props.active ? TransitionStatus.Entering : TransitionStatus.Exited
    };
    this.contentNode = /* @__PURE__ */ createRef();
    this.renderPopover = (overlayDetails) => {
      const {
        measuring,
        desiredHeight,
        positioning
      } = overlayDetails;
      const {
        id,
        children,
        sectioned,
        fullWidth,
        fullHeight,
        fluidContent,
        hideOnPrint,
        autofocusTarget,
        captureOverscroll
      } = this.props;
      const isCovering = positioning === "cover";
      const className = classNames(styles$w.Popover, measuring && styles$w.measuring, (fullWidth || isCovering) && styles$w.fullWidth, hideOnPrint && styles$w["PopoverOverlay-hideOnPrint"], positioning && styles$w[variationName("positioned", positioning)]);
      const contentStyles = measuring ? void 0 : {
        height: desiredHeight
      };
      const contentClassNames = classNames(styles$w.Content, fullHeight && styles$w["Content-fullHeight"], fluidContent && styles$w["Content-fluidContent"]);
      const {
        window: window2
      } = this.state;
      return /* @__PURE__ */ React.createElement("div", Object.assign({
        className
      }, overlay.props), /* @__PURE__ */ React.createElement(EventListener, {
        event: "click",
        handler: this.handleClick,
        window: window2
      }), /* @__PURE__ */ React.createElement(EventListener, {
        event: "touchstart",
        handler: this.handleClick,
        window: window2
      }), /* @__PURE__ */ React.createElement(KeypressListener, {
        keyCode: Key.Escape,
        handler: this.handleEscape,
        document: window2 == null ? void 0 : window2.document
      }), /* @__PURE__ */ React.createElement("div", {
        className: styles$w.FocusTracker,
        tabIndex: 0,
        onFocus: this.handleFocusFirstItem
      }), /* @__PURE__ */ React.createElement("div", {
        className: styles$w.ContentContainer
      }, /* @__PURE__ */ React.createElement("div", {
        id,
        tabIndex: autofocusTarget === "none" ? void 0 : -1,
        className: contentClassNames,
        style: contentStyles,
        ref: this.contentNode
      }, renderPopoverContent(children, {
        captureOverscroll,
        sectioned
      }))), /* @__PURE__ */ React.createElement("div", {
        className: styles$w.FocusTracker,
        tabIndex: 0,
        onFocus: this.handleFocusLastItem
      }));
    };
    this.handleClick = (event) => {
      const target = event.target;
      const {
        contentNode,
        props: {
          activator,
          onClose,
          preventCloseOnChildOverlayClick
        }
      } = this;
      const composedPath = event.composedPath();
      const wasDescendant = preventCloseOnChildOverlayClick ? wasPolarisPortalDescendant(composedPath, this.context.container) : wasContentNodeDescendant(composedPath, contentNode);
      const isActivatorDescendant = nodeContainsDescendant(activator, target);
      if (wasDescendant || isActivatorDescendant || this.state.transitionStatus !== TransitionStatus.Entered) {
        return;
      }
      onClose(PopoverCloseSource.Click);
    };
    this.handleScrollOut = () => {
      this.props.onClose(PopoverCloseSource.ScrollOut);
    };
    this.handleEscape = (event) => {
      const target = event.target;
      const {
        contentNode,
        props: {
          activator
        }
      } = this;
      const composedPath = event.composedPath();
      const wasDescendant = wasContentNodeDescendant(composedPath, contentNode);
      const isActivatorDescendant = nodeContainsDescendant(activator, target);
      if (wasDescendant || isActivatorDescendant) {
        this.props.onClose(PopoverCloseSource.EscapeKeypress);
      }
    };
    this.handleFocusFirstItem = () => {
      this.props.onClose(PopoverCloseSource.FocusOut);
    };
    this.handleFocusLastItem = () => {
      this.props.onClose(PopoverCloseSource.FocusOut);
    };
    this.overlayRef = /* @__PURE__ */ createRef();
  }
  forceUpdatePosition() {
    var _a;
    (_a = this.overlayRef.current) == null ? void 0 : _a.forceUpdatePosition();
  }
  changeTransitionStatus(transitionStatus, cb) {
    this.setState({
      transitionStatus
    }, cb);
    this.contentNode.current && this.contentNode.current.getBoundingClientRect();
  }
  componentDidMount() {
    if (this.props.active) {
      this.focusContent();
      this.changeTransitionStatus(TransitionStatus.Entered);
    }
    this.observer = new ResizeObserver(() => {
      this.setState({
        /**
         * This is a workaround to enable event listeners to be
         * re-attached when moving from one document to another
         * when using a React portal across iframes.
         * Using a resize observer works because when the clientWidth
         * will go from 0 to the real width after the activator
         * gets rendered in its new place.
         */
        window: this.props.activator.ownerDocument.defaultView
      });
    });
    this.observer.observe(this.props.activator);
  }
  componentDidUpdate(oldProps) {
    var _a, _b;
    if (this.props.active && !oldProps.active) {
      this.focusContent();
      this.changeTransitionStatus(TransitionStatus.Entering, () => {
        this.clearTransitionTimeout();
        this.enteringTimer = window.setTimeout(() => {
          this.setState({
            transitionStatus: TransitionStatus.Entered
          });
        }, parseInt(themeDefault.motion["motion-duration-100"], 10));
      });
    }
    if (!this.props.active && oldProps.active) {
      this.clearTransitionTimeout();
      this.setState({
        transitionStatus: TransitionStatus.Exited
      });
    }
    if (this.props.activator !== oldProps.activator) {
      (_a = this.observer) == null ? void 0 : _a.unobserve(oldProps.activator);
      (_b = this.observer) == null ? void 0 : _b.observe(this.props.activator);
    }
  }
  componentWillUnmount() {
    var _a;
    this.clearTransitionTimeout();
    (_a = this.observer) == null ? void 0 : _a.disconnect();
  }
  render() {
    const {
      active,
      activator,
      fullWidth,
      preferredPosition = "below",
      preferredAlignment = "center",
      preferInputActivator = true,
      fixed,
      zIndexOverride
    } = this.props;
    const {
      transitionStatus
    } = this.state;
    if (transitionStatus === TransitionStatus.Exited && !active) return null;
    const className = classNames(styles$w.PopoverOverlay, transitionStatus === TransitionStatus.Entering && styles$w["PopoverOverlay-entering"], transitionStatus === TransitionStatus.Entered && styles$w["PopoverOverlay-open"], transitionStatus === TransitionStatus.Exiting && styles$w["PopoverOverlay-exiting"], preferredPosition === "cover" && styles$w["PopoverOverlay-noAnimation"]);
    return /* @__PURE__ */ React.createElement(PositionedOverlay, {
      ref: this.overlayRef,
      fullWidth,
      active,
      activator,
      preferInputActivator,
      preferredPosition,
      preferredAlignment,
      render: this.renderPopover.bind(this),
      fixed,
      onScrollOut: this.handleScrollOut,
      classNames: className,
      zIndexOverride
    });
  }
  clearTransitionTimeout() {
    if (this.enteringTimer) {
      window.clearTimeout(this.enteringTimer);
    }
  }
  focusContent() {
    const {
      autofocusTarget = "container"
    } = this.props;
    if (autofocusTarget === "none" || this.contentNode == null) {
      return;
    }
    requestAnimationFrame(() => {
      if (this.contentNode.current == null) {
        return;
      }
      const focusableChild = findFirstKeyboardFocusableNode(this.contentNode.current);
      if (focusableChild && autofocusTarget === "first-node") {
        focusableChild.focus({
          preventScroll: process.env.NODE_ENV === "development"
        });
      } else {
        this.contentNode.current.focus({
          preventScroll: process.env.NODE_ENV === "development"
        });
      }
    });
  }
}
PopoverOverlay.contextType = PortalsManagerContext;
function renderPopoverContent(children, props) {
  const childrenArray = Children.toArray(children);
  if (isElementOfType(childrenArray[0], Pane)) {
    return childrenArray;
  }
  return wrapWithComponent(childrenArray, Pane, props);
}
function nodeContainsDescendant(rootNode, descendant) {
  if (rootNode === descendant) {
    return true;
  }
  let parent = descendant.parentNode;
  while (parent != null) {
    if (parent === rootNode) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}
function wasContentNodeDescendant(composedPath, contentNode) {
  return contentNode.current != null && composedPath.includes(contentNode.current);
}
function wasPolarisPortalDescendant(composedPath, portalsContainerElement) {
  return composedPath.some((eventTarget) => eventTarget instanceof Node && (portalsContainerElement == null ? void 0 : portalsContainerElement.contains(eventTarget)));
}
const PopoverComponent = /* @__PURE__ */ forwardRef(function Popover({
  activatorWrapper = "div",
  children,
  onClose,
  activator,
  preventFocusOnClose,
  active,
  fixed,
  ariaHaspopup,
  preferInputActivator = true,
  zIndexOverride,
  ...rest
}, ref) {
  const [isDisplayed, setIsDisplay] = useState(false);
  const [activatorNode, setActivatorNode] = useState();
  const overlayRef = useRef(null);
  const activatorContainer = useRef(null);
  const WrapperComponent = activatorWrapper;
  const id = useId();
  function forceUpdatePosition() {
    var _a;
    (_a = overlayRef.current) == null ? void 0 : _a.forceUpdatePosition();
  }
  const handleClose = (source) => {
    onClose(source);
    if (activatorContainer.current == null || preventFocusOnClose) {
      return;
    }
    if (source === PopoverCloseSource.FocusOut && activatorNode) {
      const focusableActivator = findFirstFocusableNodeIncludingDisabled(activatorNode) || findFirstFocusableNodeIncludingDisabled(activatorContainer.current) || activatorContainer.current;
      if (!focusNextFocusableNode(focusableActivator, isInPortal)) {
        focusableActivator.focus();
      }
    } else if (source === PopoverCloseSource.EscapeKeypress && activatorNode) {
      const focusableActivator = findFirstFocusableNodeIncludingDisabled(activatorNode) || findFirstFocusableNodeIncludingDisabled(activatorContainer.current) || activatorContainer.current;
      if (focusableActivator) {
        focusableActivator.focus();
      } else {
        focusNextFocusableNode(focusableActivator, isInPortal);
      }
    }
  };
  useImperativeHandle(ref, () => {
    return {
      forceUpdatePosition,
      close: (target = "activator") => {
        const source = target === "activator" ? PopoverCloseSource.EscapeKeypress : PopoverCloseSource.FocusOut;
        handleClose(source);
      }
    };
  });
  const setAccessibilityAttributes = useCallback(() => {
    if (activatorContainer.current == null) {
      return;
    }
    const firstFocusable = findFirstFocusableNodeIncludingDisabled(activatorContainer.current);
    const focusableActivator = firstFocusable || activatorContainer.current;
    const activatorDisabled = "disabled" in focusableActivator && Boolean(focusableActivator.disabled);
    setActivatorAttributes(focusableActivator, {
      id,
      active,
      ariaHaspopup,
      activatorDisabled
    });
  }, [id, active, ariaHaspopup]);
  useEffect(() => {
    function setDisplayState() {
      setIsDisplay(Boolean(activatorContainer.current && (activatorContainer.current.offsetParent !== null || activatorContainer.current === activatorContainer.current.ownerDocument.body && activatorContainer.current.clientWidth > 0)));
    }
    if (!activatorContainer.current) {
      return;
    }
    const observer = new ResizeObserver(setDisplayState);
    observer.observe(activatorContainer.current);
    setDisplayState();
    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!activatorNode && activatorContainer.current) {
      setActivatorNode(activatorContainer.current.firstElementChild);
    } else if (activatorNode && activatorContainer.current && !activatorContainer.current.contains(activatorNode)) {
      setActivatorNode(activatorContainer.current.firstElementChild);
    }
    setAccessibilityAttributes();
  }, [activatorNode, setAccessibilityAttributes]);
  useEffect(() => {
    if (activatorNode && activatorContainer.current) {
      setActivatorNode(activatorContainer.current.firstElementChild);
    }
    setAccessibilityAttributes();
  }, [activatorNode, setAccessibilityAttributes]);
  const portal2 = activatorNode && isDisplayed ? /* @__PURE__ */ React.createElement(Portal, {
    idPrefix: "popover"
  }, /* @__PURE__ */ React.createElement(PopoverOverlay, Object.assign({
    ref: overlayRef,
    id,
    activator: activatorNode,
    preferInputActivator,
    onClose: handleClose,
    active,
    fixed,
    zIndexOverride
  }, rest), children)) : null;
  return /* @__PURE__ */ React.createElement(WrapperComponent, {
    ref: activatorContainer
  }, Children.only(activator), portal2);
});
function isInPortal(element) {
  let parentElement = element.parentElement;
  while (parentElement) {
    if (parentElement.matches(portal.selector)) return false;
    parentElement = parentElement.parentElement;
  }
  return true;
}
const Popover2 = Object.assign(PopoverComponent, {
  Pane,
  Section: Section$2
});
function RollupActions({
  accessibilityLabel,
  items = [],
  sections = []
}) {
  const i18n = useI18n();
  const {
    value: rollupOpen,
    toggle: toggleRollupOpen
  } = useToggle(false);
  if (items.length === 0 && sections.length === 0) {
    return null;
  }
  const activatorMarkup = /* @__PURE__ */ React.createElement("div", {
    className: styles$x.RollupActivator
  }, /* @__PURE__ */ React.createElement(Button, {
    icon: MenuHorizontalIcon,
    accessibilityLabel: accessibilityLabel || i18n.translate("Polaris.ActionMenu.RollupActions.rollupButton"),
    onClick: toggleRollupOpen
  }));
  return /* @__PURE__ */ React.createElement(Popover2, {
    active: rollupOpen,
    activator: activatorMarkup,
    preferredAlignment: "right",
    onClose: toggleRollupOpen,
    hideOnPrint: true
  }, /* @__PURE__ */ React.createElement(ActionList, {
    items,
    sections,
    onActionAnyItem: toggleRollupOpen
  }));
}
var styles$v = {
  "ActionsLayoutOuter": "Polaris-ActionMenu-Actions__ActionsLayoutOuter",
  "ActionsLayout": "Polaris-ActionMenu-Actions__ActionsLayout",
  "ActionsLayout--measuring": "Polaris-ActionMenu-Actions--actionsLayoutMeasuring",
  "ActionsLayoutMeasurer": "Polaris-ActionMenu-Actions__ActionsLayoutMeasurer"
};
function getVisibleAndHiddenActionsIndices$1(actions = [], groups = [], disclosureWidth, actionsWidths, containerWidth) {
  const sumTabWidths = actionsWidths.reduce((sum, width) => sum + width, 0);
  const arrayOfActionsIndices = actions.map((_, index) => {
    return index;
  });
  const arrayOfGroupsIndices = groups.map((_, index) => {
    return index;
  });
  const visibleActions = [];
  const hiddenActions = [];
  const visibleGroups = [];
  const hiddenGroups = [];
  if (containerWidth > sumTabWidths) {
    visibleActions.push(...arrayOfActionsIndices);
    visibleGroups.push(...arrayOfGroupsIndices);
  } else {
    let accumulatedWidth = 0;
    arrayOfActionsIndices.forEach((currentActionsIndex) => {
      const currentActionsWidth = actionsWidths[currentActionsIndex];
      if (accumulatedWidth + currentActionsWidth >= containerWidth - disclosureWidth) {
        hiddenActions.push(currentActionsIndex);
        return;
      }
      visibleActions.push(currentActionsIndex);
      accumulatedWidth += currentActionsWidth;
    });
    arrayOfGroupsIndices.forEach((currentGroupsIndex) => {
      const currentActionsWidth = actionsWidths[currentGroupsIndex + actions.length];
      if (accumulatedWidth + currentActionsWidth >= containerWidth - disclosureWidth) {
        hiddenGroups.push(currentGroupsIndex);
        return;
      }
      visibleGroups.push(currentGroupsIndex);
      accumulatedWidth += currentActionsWidth;
    });
  }
  return {
    visibleActions,
    hiddenActions,
    visibleGroups,
    hiddenGroups
  };
}
var styles$u = {
  "Details": "Polaris-ActionMenu-MenuGroup__Details"
};
var styles$t = {
  "SecondaryAction": "Polaris-ActionMenu-SecondaryAction",
  "critical": "Polaris-ActionMenu-SecondaryAction--critical"
};
function SecondaryAction({
  children,
  tone,
  helpText,
  onAction,
  destructive,
  ...rest
}) {
  const buttonMarkup = /* @__PURE__ */ React.createElement(Button, Object.assign({
    onClick: onAction,
    tone: destructive ? "critical" : void 0
  }, rest), children);
  const actionMarkup = helpText ? /* @__PURE__ */ React.createElement(Tooltip, {
    preferredPosition: "below",
    content: helpText
  }, buttonMarkup) : buttonMarkup;
  return /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$t.SecondaryAction, tone === "critical" && styles$t.critical)
  }, actionMarkup);
}
function MenuGroup({
  accessibilityLabel,
  active,
  actions,
  details,
  title,
  icon,
  disabled,
  onClick,
  onClose,
  onOpen,
  sections
}) {
  const handleClose = useCallback(() => {
    onClose(title);
  }, [onClose, title]);
  const handleOpen = useCallback(() => {
    onOpen(title);
  }, [onOpen, title]);
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(handleOpen);
    } else {
      handleOpen();
    }
  }, [onClick, handleOpen]);
  const popoverActivator = /* @__PURE__ */ React.createElement(SecondaryAction, {
    disclosure: true,
    disabled,
    icon,
    accessibilityLabel,
    onClick: handleClick
  }, title);
  return /* @__PURE__ */ React.createElement(Popover2, {
    active: Boolean(active),
    activator: popoverActivator,
    preferredAlignment: "left",
    onClose: handleClose,
    hideOnPrint: true
  }, /* @__PURE__ */ React.createElement(ActionList, {
    items: actions,
    sections,
    onActionAnyItem: handleClose
  }), details && /* @__PURE__ */ React.createElement("div", {
    className: styles$u.Details
  }, details));
}
const ACTION_SPACING$1 = 8;
function ActionsMeasurer({
  actions = [],
  groups = [],
  handleMeasurement: handleMeasurementProp
}) {
  const i18n = useI18n();
  const containerNode = useRef(null);
  const defaultRollupGroup = {
    title: i18n.translate("Polaris.ActionMenu.Actions.moreActions")
  };
  const activator = /* @__PURE__ */ React.createElement(SecondaryAction, {
    disclosure: true
  }, defaultRollupGroup.title);
  const handleMeasurement = useCallback(() => {
    if (!containerNode.current) {
      return;
    }
    const containerWidth = containerNode.current.offsetWidth;
    const hiddenActionNodes = containerNode.current.children;
    const hiddenActionNodesArray = Array.from(hiddenActionNodes);
    const hiddenActionsWidths = hiddenActionNodesArray.map((node) => {
      const buttonWidth = Math.ceil(node.getBoundingClientRect().width);
      return buttonWidth + ACTION_SPACING$1;
    });
    const disclosureWidth = hiddenActionsWidths.pop() || 0;
    handleMeasurementProp({
      containerWidth,
      disclosureWidth,
      hiddenActionsWidths
    });
  }, [handleMeasurementProp]);
  useEffect(() => {
    handleMeasurement();
  }, [handleMeasurement, actions, groups]);
  const actionsMarkup = actions.map((action2) => {
    const {
      content,
      onAction,
      ...rest
    } = action2;
    return /* @__PURE__ */ React.createElement(SecondaryAction, Object.assign({
      key: content,
      onClick: onAction
    }, rest), content);
  });
  const groupsMarkup = groups.map((group) => {
    const {
      title,
      icon
    } = group;
    return /* @__PURE__ */ React.createElement(SecondaryAction, {
      key: title,
      disclosure: true,
      icon
    }, title);
  });
  useEventListener("resize", handleMeasurement);
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$v.ActionsLayoutMeasurer,
    ref: containerNode
  }, actionsMarkup, groupsMarkup, activator);
}
function Actions({
  actions,
  groups,
  onActionRollup
}) {
  const i18n = useI18n();
  const rollupActiveRef = useRef(null);
  const [activeMenuGroup, setActiveMenuGroup] = useState(void 0);
  const [state, setState] = useReducer((data, partialData) => {
    return {
      ...data,
      ...partialData
    };
  }, {
    disclosureWidth: 0,
    containerWidth: Infinity,
    actionsWidths: [],
    visibleActions: [],
    hiddenActions: [],
    visibleGroups: [],
    hiddenGroups: [],
    hasMeasured: false
  });
  const {
    visibleActions,
    hiddenActions,
    visibleGroups,
    hiddenGroups,
    containerWidth,
    disclosureWidth,
    actionsWidths,
    hasMeasured
  } = state;
  const defaultRollupGroup = {
    title: i18n.translate("Polaris.ActionMenu.Actions.moreActions"),
    actions: []
  };
  const handleMenuGroupToggle = useCallback((group) => setActiveMenuGroup(activeMenuGroup ? void 0 : group), [activeMenuGroup]);
  const handleMenuGroupClose = useCallback(() => setActiveMenuGroup(void 0), []);
  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }
    const {
      visibleActions: visibleActions2,
      visibleGroups: visibleGroups2,
      hiddenActions: hiddenActions2,
      hiddenGroups: hiddenGroups2
    } = getVisibleAndHiddenActionsIndices$1(actions, groups, disclosureWidth, actionsWidths, containerWidth);
    setState({
      visibleActions: visibleActions2,
      visibleGroups: visibleGroups2,
      hiddenActions: hiddenActions2,
      hiddenGroups: hiddenGroups2,
      hasMeasured: containerWidth !== Infinity
    });
  }, [containerWidth, disclosureWidth, actions, groups, actionsWidths, setState]);
  const actionsOrDefault = useMemo(() => actions ?? [], [actions]);
  const groupsOrDefault = useMemo(() => groups ?? [], [groups]);
  const actionsMarkup = actionsOrDefault.filter((_, index) => {
    if (!visibleActions.includes(index)) {
      return false;
    }
    return true;
  }).map((action2) => {
    const {
      content,
      onAction,
      ...rest
    } = action2;
    return /* @__PURE__ */ React.createElement(SecondaryAction, Object.assign({
      key: content,
      onClick: onAction
    }, rest), content);
  });
  const groupsToFilter = hiddenGroups.length > 0 || hiddenActions.length > 0 ? [...groupsOrDefault, defaultRollupGroup] : [...groupsOrDefault];
  const filteredGroups = groupsToFilter.filter((group, index) => {
    const hasNoGroupsProp = groupsOrDefault.length === 0;
    const isVisibleGroup = visibleGroups.includes(index);
    const isDefaultGroup = group === defaultRollupGroup;
    if (hasNoGroupsProp) {
      return hiddenActions.length > 0;
    }
    if (isDefaultGroup) {
      return true;
    }
    return isVisibleGroup;
  });
  const hiddenActionObjects = hiddenActions.map((index) => actionsOrDefault[index]).filter((action2) => action2 != null);
  const hiddenGroupObjects = hiddenGroups.map((index) => groupsOrDefault[index]).filter((group) => group != null);
  const groupsMarkup = filteredGroups.map((group) => {
    const {
      title,
      actions: groupActions,
      ...rest
    } = group;
    const isDefaultGroup = group === defaultRollupGroup;
    const allHiddenItems = [...hiddenActionObjects, ...hiddenGroupObjects];
    const [finalRolledUpActions, finalRolledUpSectionGroups] = allHiddenItems.reduce(([actions2, sections], action2) => {
      if (isMenuGroup(action2)) {
        sections.push({
          title: action2.title,
          items: action2.actions.map((sectionAction) => ({
            ...sectionAction,
            disabled: action2.disabled || sectionAction.disabled
          }))
        });
      } else {
        actions2.push(action2);
      }
      return [actions2, sections];
    }, [[], []]);
    if (!isDefaultGroup) {
      return /* @__PURE__ */ React.createElement(MenuGroup, Object.assign({
        key: title,
        title,
        active: title === activeMenuGroup,
        actions: groupActions
      }, rest, {
        onOpen: handleMenuGroupToggle,
        onClose: handleMenuGroupClose
      }));
    }
    return /* @__PURE__ */ React.createElement(MenuGroup, Object.assign({
      key: title,
      title,
      active: title === activeMenuGroup,
      actions: [...finalRolledUpActions, ...groupActions],
      sections: finalRolledUpSectionGroups
    }, rest, {
      onOpen: handleMenuGroupToggle,
      onClose: handleMenuGroupClose
    }));
  });
  const handleMeasurement = useCallback((measurements) => {
    const {
      hiddenActionsWidths: actionsWidths2,
      containerWidth: containerWidth2,
      disclosureWidth: disclosureWidth2
    } = measurements;
    const {
      visibleActions: visibleActions2,
      hiddenActions: hiddenActions2,
      visibleGroups: visibleGroups2,
      hiddenGroups: hiddenGroups2
    } = getVisibleAndHiddenActionsIndices$1(actionsOrDefault, groupsOrDefault, disclosureWidth2, actionsWidths2, containerWidth2);
    if (onActionRollup) {
      const isRollupActive = hiddenActions2.length > 0 || hiddenGroups2.length > 0;
      if (rollupActiveRef.current !== isRollupActive) {
        onActionRollup(isRollupActive);
        rollupActiveRef.current = isRollupActive;
      }
    }
    setState({
      visibleActions: visibleActions2,
      hiddenActions: hiddenActions2,
      visibleGroups: visibleGroups2,
      hiddenGroups: hiddenGroups2,
      actionsWidths: actionsWidths2,
      containerWidth: containerWidth2,
      disclosureWidth: disclosureWidth2,
      hasMeasured: true
    });
  }, [actionsOrDefault, groupsOrDefault, onActionRollup]);
  const actionsMeasurer = /* @__PURE__ */ React.createElement(ActionsMeasurer, {
    actions,
    groups,
    handleMeasurement
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$v.ActionsLayoutOuter
  }, actionsMeasurer, /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$v.ActionsLayout, !hasMeasured && styles$v["ActionsLayout--measuring"])
  }, actionsMarkup, groupsMarkup));
}
function isMenuGroup(actionOrMenuGroup) {
  return "title" in actionOrMenuGroup;
}
function ActionMenu({
  actions = [],
  groups = [],
  rollup,
  rollupActionsLabel,
  onActionRollup
}) {
  if (actions.length === 0 && groups.length === 0) {
    return null;
  }
  const actionMenuClassNames = classNames(styles$y.ActionMenu, rollup && styles$y.rollup);
  const rollupSections = groups.map((group) => convertGroupToSection(group));
  return /* @__PURE__ */ React.createElement("div", {
    className: actionMenuClassNames
  }, rollup ? /* @__PURE__ */ React.createElement(RollupActions, {
    accessibilityLabel: rollupActionsLabel,
    items: actions,
    sections: rollupSections
  }) : /* @__PURE__ */ React.createElement(Actions, {
    actions,
    groups,
    onActionRollup
  }));
}
function hasGroupsWithActions(groups = []) {
  return groups.length === 0 ? false : groups.some((group) => group.actions.length > 0);
}
function convertGroupToSection({
  title,
  actions,
  disabled
}) {
  return {
    title,
    items: actions.map((action2) => ({
      ...action2,
      disabled: disabled || action2.disabled
    }))
  };
}
const WithinListboxContext = /* @__PURE__ */ createContext(false);
var styles$s = {
  "Checkbox": "Polaris-Checkbox",
  "ChoiceLabel": "Polaris-Checkbox__ChoiceLabel",
  "Backdrop": "Polaris-Checkbox__Backdrop",
  "Input": "Polaris-Checkbox__Input",
  "Input-indeterminate": "Polaris-Checkbox__Input--indeterminate",
  "Icon": "Polaris-Checkbox__Icon",
  "animated": "Polaris-Checkbox--animated",
  "toneMagic": "Polaris-Checkbox--toneMagic",
  "hover": "Polaris-Checkbox--hover",
  "error": "Polaris-Checkbox--error",
  "checked": "Polaris-Checkbox--checked",
  "pathAnimation": "Polaris-Checkbox--pathAnimation"
};
var styles$r = {
  "Choice": "Polaris-Choice",
  "labelHidden": "Polaris-Choice--labelHidden",
  "Label": "Polaris-Choice__Label",
  "Control": "Polaris-Choice__Control",
  "disabled": "Polaris-Choice--disabled",
  "toneMagic": "Polaris-Choice--toneMagic",
  "Descriptions": "Polaris-Choice__Descriptions",
  "HelpText": "Polaris-Choice__HelpText"
};
function Choice({
  id,
  label,
  disabled,
  error,
  children,
  labelHidden,
  helpText,
  onClick,
  labelClassName,
  fill,
  bleed,
  bleedBlockStart,
  bleedBlockEnd,
  bleedInlineStart,
  bleedInlineEnd,
  tone
}) {
  const className = classNames(styles$r.Choice, labelHidden && styles$r.labelHidden, disabled && styles$r.disabled, tone && styles$r[variationName("tone", tone)], labelClassName);
  const labelStyle = {
    // Pass through overrides for bleed values if they're set by the prop
    ...getResponsiveProps("choice", "bleed-block-end", "space", bleedBlockEnd || bleed),
    ...getResponsiveProps("choice", "bleed-block-start", "space", bleedBlockStart || bleed),
    ...getResponsiveProps("choice", "bleed-inline-start", "space", bleedInlineStart || bleed),
    ...getResponsiveProps("choice", "bleed-inline-end", "space", bleedInlineEnd || bleed),
    ...Object.fromEntries(Object.entries(getResponsiveValue("choice", "fill", fill)).map(
      // Map "true" => "100%" and "false" => "auto" for use in
      // inline/block-size calc()
      ([key, value]) => [key, value ? "100%" : "auto"]
    ))
  };
  const labelMarkup = (
    // NOTE: Can't use a Box here for a few reasons:
    // - as="label" fails `Element` typecheck (even though the JS works)
    // - Can't pass hard coded values to padding (forced to tokens)
    // - Can't pass negative values to padding
    // - Can't pass margins at all
    /* @__PURE__ */ React.createElement("label", {
      className,
      htmlFor: id,
      onClick,
      style: sanitizeCustomProperties(labelStyle)
    }, /* @__PURE__ */ React.createElement("span", {
      className: styles$r.Control
    }, children), /* @__PURE__ */ React.createElement("span", {
      className: styles$r.Label
    }, /* @__PURE__ */ React.createElement(Text, {
      as: "span",
      variant: "bodyMd"
    }, label)))
  );
  const helpTextMarkup = helpText ? /* @__PURE__ */ React.createElement("div", {
    className: styles$r.HelpText,
    id: helpTextID(id)
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    tone: disabled ? void 0 : "subdued"
  }, helpText)) : null;
  const errorMarkup = error && typeof error !== "boolean" && /* @__PURE__ */ React.createElement("div", {
    className: styles$r.Error
  }, /* @__PURE__ */ React.createElement(InlineError, {
    message: error,
    fieldID: id
  }));
  const descriptionMarkup = helpTextMarkup || errorMarkup ? /* @__PURE__ */ React.createElement("div", {
    className: styles$r.Descriptions
  }, errorMarkup, helpTextMarkup) : null;
  return descriptionMarkup ? /* @__PURE__ */ React.createElement("div", null, labelMarkup, descriptionMarkup) : labelMarkup;
}
function helpTextID(id) {
  return `${id}HelpText`;
}
const Checkbox$1 = /* @__PURE__ */ forwardRef(function Checkbox({
  ariaControls,
  ariaDescribedBy: ariaDescribedByProp,
  label,
  labelHidden,
  checked = false,
  helpText,
  disabled,
  id: idProp,
  name,
  value,
  error,
  onChange,
  onFocus,
  onBlur,
  labelClassName,
  fill,
  bleed,
  bleedBlockStart,
  bleedBlockEnd,
  bleedInlineStart,
  bleedInlineEnd,
  tone
}, ref) {
  const inputNode = useRef(null);
  const uniqId = useId();
  const id = idProp ?? uniqId;
  const isWithinListbox = useContext(WithinListboxContext);
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (inputNode.current) {
        inputNode.current.focus();
      }
    }
  }));
  const handleBlur = () => {
    onBlur && onBlur();
  };
  const handleOnClick = () => {
    if (onChange == null || inputNode.current == null || disabled) {
      return;
    }
    onChange(inputNode.current.checked, id);
    inputNode.current.focus();
  };
  const describedBy = [];
  if (error && typeof error !== "boolean") {
    describedBy.push(errorTextID(id));
  }
  if (helpText) {
    describedBy.push(helpTextID(id));
  }
  if (ariaDescribedByProp) {
    describedBy.push(ariaDescribedByProp);
  }
  const ariaDescribedBy = describedBy.length ? describedBy.join(" ") : void 0;
  const wrapperClassName = classNames(styles$s.Checkbox, error && styles$s.error);
  const isIndeterminate = checked === "indeterminate";
  const isChecked = !isIndeterminate && Boolean(checked);
  const indeterminateAttributes = isIndeterminate ? {
    indeterminate: "true",
    "aria-checked": "mixed"
  } : {
    "aria-checked": isChecked
  };
  const iconSource = /* @__PURE__ */ React.createElement("svg", {
    viewBox: "0 0 16 16",
    shapeRendering: "geometricPrecision",
    textRendering: "geometricPrecision"
  }, /* @__PURE__ */ React.createElement("path", {
    className: classNames(checked && styles$s.checked),
    d: "M1.5,5.5L3.44655,8.22517C3.72862,8.62007,4.30578,8.64717,4.62362,8.28044L10.5,1.5",
    transform: "translate(2 2.980376)",
    opacity: "0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    pathLength: "1"
  }));
  const inputClassName = classNames(styles$s.Input, isIndeterminate && styles$s["Input-indeterminate"], tone && styles$s[variationName("tone", tone)]);
  const extraChoiceProps = {
    helpText,
    error,
    bleed,
    bleedBlockStart,
    bleedBlockEnd,
    bleedInlineStart,
    bleedInlineEnd
  };
  return /* @__PURE__ */ React.createElement(Choice, Object.assign({
    id,
    label,
    labelHidden,
    disabled,
    labelClassName: classNames(styles$s.ChoiceLabel, labelClassName),
    fill,
    tone
  }, extraChoiceProps), /* @__PURE__ */ React.createElement("span", {
    className: wrapperClassName
  }, /* @__PURE__ */ React.createElement("input", Object.assign({
    ref: inputNode,
    id,
    name,
    value,
    type: "checkbox",
    checked: isChecked,
    disabled,
    className: inputClassName,
    onBlur: handleBlur,
    onChange: noop$2,
    onClick: handleOnClick,
    onFocus,
    "aria-invalid": error != null,
    "aria-controls": ariaControls,
    "aria-describedby": ariaDescribedBy,
    role: isWithinListbox ? "presentation" : "checkbox"
  }, indeterminateAttributes)), /* @__PURE__ */ React.createElement("span", {
    className: styles$s.Backdrop,
    onClick: stopPropagation,
    onKeyUp: stopPropagation
  }), /* @__PURE__ */ React.createElement("span", {
    className: classNames(styles$s.Icon, !isIndeterminate && styles$s.animated)
  }, isIndeterminate ? /* @__PURE__ */ React.createElement(Icon, {
    source: MinusIcon
  }) : iconSource)));
});
function noop$2() {
}
function stopPropagation(event) {
  event.stopPropagation();
}
var styles$q = {
  "Backdrop": "Polaris-Backdrop",
  "transparent": "Polaris-Backdrop--transparent",
  "belowNavigation": "Polaris-Backdrop--belowNavigation"
};
function useScrollLockManager() {
  const scrollLockManager = useContext(ScrollLockManagerContext);
  if (!scrollLockManager) {
    throw new MissingAppProviderError("No ScrollLockManager was provided.");
  }
  return scrollLockManager;
}
function ScrollLock(_) {
  const scrollLockManager = useScrollLockManager();
  useEffect(() => {
    scrollLockManager.registerScrollLock();
    return () => {
      scrollLockManager.unregisterScrollLock();
    };
  }, [scrollLockManager]);
  return null;
}
function Backdrop(props) {
  const {
    onClick,
    onTouchStart,
    belowNavigation,
    transparent,
    setClosing
  } = props;
  const className = classNames(styles$q.Backdrop, belowNavigation && styles$q.belowNavigation, transparent && styles$q.transparent);
  const handleMouseDown = () => {
    if (setClosing) {
      setClosing(true);
    }
  };
  const handleClick = () => {
    if (setClosing) {
      setClosing(false);
    }
    if (onClick) {
      onClick();
    }
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ScrollLock, null), /* @__PURE__ */ React.createElement("div", {
    className,
    onClick: handleClick,
    onTouchStart,
    onMouseDown: handleMouseDown
  }));
}
const BannerContext = /* @__PURE__ */ createContext(false);
var styles$p = {
  "Banner": "Polaris-Banner",
  "keyFocused": "Polaris-Banner--keyFocused",
  "withinContentContainer": "Polaris-Banner--withinContentContainer",
  "withinPage": "Polaris-Banner--withinPage",
  "DismissIcon": "Polaris-Banner__DismissIcon",
  "text-success-on-bg-fill": "Polaris-Banner--textSuccessOnBgFill",
  "text-success": "Polaris-Banner__text--success",
  "text-warning-on-bg-fill": "Polaris-Banner--textWarningOnBgFill",
  "text-warning": "Polaris-Banner__text--warning",
  "text-critical-on-bg-fill": "Polaris-Banner--textCriticalOnBgFill",
  "text-critical": "Polaris-Banner__text--critical",
  "text-info-on-bg-fill": "Polaris-Banner--textInfoOnBgFill",
  "text-info": "Polaris-Banner__text--info",
  "icon-secondary": "Polaris-Banner__icon--secondary"
};
const bannerAttributes = {
  success: {
    withinPage: {
      background: "bg-fill-success",
      text: "text-success-on-bg-fill",
      icon: "text-success-on-bg-fill"
    },
    withinContentContainer: {
      background: "bg-surface-success",
      text: "text-success",
      icon: "text-success"
    },
    icon: CheckIcon
  },
  warning: {
    withinPage: {
      background: "bg-fill-warning",
      text: "text-warning-on-bg-fill",
      icon: "text-warning-on-bg-fill"
    },
    withinContentContainer: {
      background: "bg-surface-warning",
      text: "text-warning",
      icon: "text-warning"
    },
    icon: AlertTriangleIcon
  },
  critical: {
    withinPage: {
      background: "bg-fill-critical",
      text: "text-critical-on-bg-fill",
      icon: "text-critical-on-bg-fill"
    },
    withinContentContainer: {
      background: "bg-surface-critical",
      text: "text-critical",
      icon: "text-critical"
    },
    icon: AlertDiamondIcon
  },
  info: {
    withinPage: {
      background: "bg-fill-info",
      text: "text-info-on-bg-fill",
      icon: "text-info-on-bg-fill"
    },
    withinContentContainer: {
      background: "bg-surface-info",
      text: "text-info",
      icon: "text-info"
    },
    icon: InfoIcon
  }
};
function useBannerFocus(bannerRef) {
  const wrapperRef = useRef(null);
  const [shouldShowFocus, setShouldShowFocus] = useState(false);
  useImperativeHandle(bannerRef, () => ({
    focus: () => {
      var _a;
      (_a = wrapperRef.current) == null ? void 0 : _a.focus();
      setShouldShowFocus(true);
    }
  }), []);
  const handleKeyUp = (event) => {
    if (event.target === wrapperRef.current) {
      setShouldShowFocus(true);
    }
  };
  const handleBlur = () => setShouldShowFocus(false);
  const handleMouseUp = (event) => {
    event.currentTarget.blur();
    setShouldShowFocus(false);
  };
  return {
    wrapperRef,
    handleKeyUp,
    handleBlur,
    handleMouseUp,
    shouldShowFocus
  };
}
var styles$o = {
  "ButtonGroup": "Polaris-ButtonGroup",
  "Item": "Polaris-ButtonGroup__Item",
  "Item-plain": "Polaris-ButtonGroup__Item--plain",
  "variantSegmented": "Polaris-ButtonGroup--variantSegmented",
  "Item-focused": "Polaris-ButtonGroup__Item--focused",
  "fullWidth": "Polaris-ButtonGroup--fullWidth",
  "extraTight": "Polaris-ButtonGroup--extraTight",
  "tight": "Polaris-ButtonGroup--tight",
  "loose": "Polaris-ButtonGroup--loose",
  "noWrap": "Polaris-ButtonGroup--noWrap"
};
function Item$3({
  button
}) {
  const {
    value: focused,
    setTrue: forceTrueFocused,
    setFalse: forceFalseFocused
  } = useToggle(false);
  const className = classNames(styles$o.Item, focused && styles$o["Item-focused"], button.props.variant === "plain" && styles$o["Item-plain"]);
  return /* @__PURE__ */ React.createElement("div", {
    className,
    onFocus: forceTrueFocused,
    onBlur: forceFalseFocused
  }, button);
}
function ButtonGroup({
  children,
  gap,
  variant,
  fullWidth,
  connectedTop,
  noWrap
}) {
  const className = classNames(styles$o.ButtonGroup, gap && styles$o[gap], variant && styles$o[variationName("variant", variant)], fullWidth && styles$o.fullWidth, noWrap && styles$o.noWrap);
  const contents = elementChildren(children).map((child, index) => /* @__PURE__ */ React.createElement(Item$3, {
    button: child,
    key: index
  }));
  return /* @__PURE__ */ React.createElement("div", {
    className,
    "data-buttongroup-variant": variant,
    "data-buttongroup-connected-top": connectedTop,
    "data-buttongroup-full-width": fullWidth,
    "data-buttongroup-no-wrap": noWrap
  }, contents);
}
const Banner = /* @__PURE__ */ forwardRef(function Banner2(props, bannerRef) {
  const {
    tone,
    stopAnnouncements
  } = props;
  const withinContentContainer = useContext(WithinContentContext);
  const {
    wrapperRef,
    handleKeyUp,
    handleBlur,
    handleMouseUp,
    shouldShowFocus
  } = useBannerFocus(bannerRef);
  const className = classNames(styles$p.Banner, shouldShowFocus && styles$p.keyFocused, withinContentContainer ? styles$p.withinContentContainer : styles$p.withinPage);
  return /* @__PURE__ */ React.createElement(BannerContext.Provider, {
    value: true
  }, /* @__PURE__ */ React.createElement("div", {
    className,
    tabIndex: 0,
    ref: wrapperRef,
    role: tone === "warning" || tone === "critical" ? "alert" : "status",
    "aria-live": stopAnnouncements ? "off" : "polite",
    onMouseUp: handleMouseUp,
    onKeyUp: handleKeyUp,
    onBlur: handleBlur
  }, /* @__PURE__ */ React.createElement(BannerLayout, props)));
});
function BannerLayout({
  tone = "info",
  icon,
  hideIcon,
  onDismiss,
  action: action2,
  secondaryAction,
  title,
  children
}) {
  const i18n = useI18n();
  const withinContentContainer = useContext(WithinContentContext);
  const isInlineIconBanner = !title && !withinContentContainer;
  const bannerTone = Object.keys(bannerAttributes).includes(tone) ? tone : "info";
  const bannerColors = bannerAttributes[bannerTone][withinContentContainer ? "withinContentContainer" : "withinPage"];
  const sharedBannerProps = {
    backgroundColor: bannerColors.background,
    textColor: bannerColors.text,
    bannerTitle: title ? /* @__PURE__ */ React.createElement(Text, {
      as: "h2",
      variant: "headingSm",
      breakWord: true
    }, title) : null,
    bannerIcon: hideIcon ? null : /* @__PURE__ */ React.createElement("span", {
      className: styles$p[bannerColors.icon]
    }, /* @__PURE__ */ React.createElement(Icon, {
      source: icon ?? bannerAttributes[bannerTone].icon
    })),
    actionButtons: action2 || secondaryAction ? /* @__PURE__ */ React.createElement(ButtonGroup, null, action2 && /* @__PURE__ */ React.createElement(Button, Object.assign({
      onClick: action2.onAction
    }, action2), action2.content), secondaryAction && /* @__PURE__ */ React.createElement(Button, Object.assign({
      onClick: secondaryAction.onAction
    }, secondaryAction), secondaryAction.content)) : null,
    dismissButton: onDismiss ? /* @__PURE__ */ React.createElement(Button, {
      variant: "tertiary",
      icon: /* @__PURE__ */ React.createElement("span", {
        className: styles$p[isInlineIconBanner ? "icon-secondary" : bannerColors.icon]
      }, /* @__PURE__ */ React.createElement(Icon, {
        source: XIcon
      })),
      onClick: onDismiss,
      accessibilityLabel: i18n.translate("Polaris.Banner.dismissButton")
    }) : null
  };
  const childrenMarkup = children ? /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd"
  }, children) : null;
  if (withinContentContainer) {
    return /* @__PURE__ */ React.createElement(WithinContentContainerBanner, sharedBannerProps, childrenMarkup);
  }
  if (isInlineIconBanner) {
    return /* @__PURE__ */ React.createElement(InlineIconBanner, sharedBannerProps, childrenMarkup);
  }
  return /* @__PURE__ */ React.createElement(DefaultBanner, sharedBannerProps, childrenMarkup);
}
function DefaultBanner({
  backgroundColor,
  textColor,
  bannerTitle,
  bannerIcon,
  actionButtons,
  dismissButton,
  children
}) {
  const {
    smUp
  } = useBreakpoints();
  const hasContent = children || actionButtons;
  return /* @__PURE__ */ React.createElement(Box, {
    width: "100%"
  }, /* @__PURE__ */ React.createElement(BlockStack, {
    align: "space-between"
  }, /* @__PURE__ */ React.createElement(Box, {
    background: backgroundColor,
    color: textColor,
    borderStartStartRadius: smUp ? "300" : void 0,
    borderStartEndRadius: smUp ? "300" : void 0,
    borderEndStartRadius: !hasContent && smUp ? "300" : void 0,
    borderEndEndRadius: !hasContent && smUp ? "300" : void 0,
    padding: "300"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    align: "space-between",
    blockAlign: "center",
    gap: "200",
    wrap: false
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "100",
    wrap: false
  }, bannerIcon, bannerTitle), dismissButton)), hasContent && /* @__PURE__ */ React.createElement(Box, {
    padding: {
      xs: "300",
      md: "400"
    },
    paddingBlockStart: "300"
  }, /* @__PURE__ */ React.createElement(BlockStack, {
    gap: "200"
  }, /* @__PURE__ */ React.createElement("div", null, children), actionButtons))));
}
function InlineIconBanner({
  backgroundColor,
  bannerIcon,
  actionButtons,
  dismissButton,
  children
}) {
  const [blockAlign, setBlockAlign] = useState("center");
  const contentNode = useRef(null);
  const iconNode = useRef(null);
  const dismissIconNode = useRef(null);
  const handleResize = useCallback(() => {
    var _a, _b, _c;
    const contentHeight = (_a = contentNode.current) == null ? void 0 : _a.offsetHeight;
    const iconBoxHeight = ((_b = iconNode.current) == null ? void 0 : _b.offsetHeight) || ((_c = dismissIconNode.current) == null ? void 0 : _c.offsetHeight);
    if (!contentHeight || !iconBoxHeight) return;
    contentHeight > iconBoxHeight ? setBlockAlign("start") : setBlockAlign("center");
  }, []);
  useEffect(() => handleResize(), [handleResize]);
  useEventListener("resize", handleResize);
  return /* @__PURE__ */ React.createElement(Box, {
    width: "100%",
    padding: "300",
    borderRadius: "300"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    align: "space-between",
    blockAlign,
    wrap: false
  }, /* @__PURE__ */ React.createElement(Box, {
    width: "100%"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "200",
    wrap: false,
    blockAlign
  }, bannerIcon ? /* @__PURE__ */ React.createElement("div", {
    ref: iconNode
  }, /* @__PURE__ */ React.createElement(Box, {
    background: backgroundColor,
    borderRadius: "200",
    padding: "100"
  }, bannerIcon)) : null, /* @__PURE__ */ React.createElement(Box, {
    ref: contentNode,
    width: "100%"
  }, /* @__PURE__ */ React.createElement(BlockStack, {
    gap: "200"
  }, /* @__PURE__ */ React.createElement("div", null, children), actionButtons)))), /* @__PURE__ */ React.createElement("div", {
    ref: dismissIconNode,
    className: styles$p.DismissIcon
  }, dismissButton)));
}
function WithinContentContainerBanner({
  backgroundColor,
  textColor,
  bannerTitle,
  bannerIcon,
  actionButtons,
  dismissButton,
  children
}) {
  return /* @__PURE__ */ React.createElement(Box, {
    width: "100%",
    background: backgroundColor,
    padding: "200",
    borderRadius: "200",
    color: textColor
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    align: "space-between",
    blockAlign: "start",
    wrap: false,
    gap: "200"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "150",
    wrap: false
  }, bannerIcon, /* @__PURE__ */ React.createElement(Box, {
    width: "100%"
  }, /* @__PURE__ */ React.createElement(BlockStack, {
    gap: "200"
  }, /* @__PURE__ */ React.createElement(BlockStack, {
    gap: "050"
  }, bannerTitle, /* @__PURE__ */ React.createElement("div", null, children)), actionButtons))), dismissButton));
}
var styles$n = {
  "Bleed": "Polaris-Bleed"
};
const Bleed = ({
  marginInline,
  marginBlock,
  marginBlockStart,
  marginBlockEnd,
  marginInlineStart,
  marginInlineEnd,
  children
}) => {
  const getNegativeMargins = (direction) => {
    const xAxis = ["marginInlineStart", "marginInlineEnd"];
    const yAxis = ["marginBlockStart", "marginBlockEnd"];
    const directionValues = {
      marginBlockStart,
      marginBlockEnd,
      marginInlineStart,
      marginInlineEnd,
      marginInline,
      marginBlock
    };
    if (directionValues[direction]) {
      return directionValues[direction];
    } else if (xAxis.includes(direction) && marginInline) {
      return directionValues.marginInline;
    } else if (yAxis.includes(direction) && marginBlock) {
      return directionValues.marginBlock;
    }
  };
  const negativeMarginBlockStart = getNegativeMargins("marginBlockStart");
  const negativeMarginBlockEnd = getNegativeMargins("marginBlockEnd");
  const negativeMarginInlineStart = getNegativeMargins("marginInlineStart");
  const negativeMarginInlineEnd = getNegativeMargins("marginInlineEnd");
  const style = {
    ...getResponsiveProps("bleed", "margin-block-start", "space", negativeMarginBlockStart),
    ...getResponsiveProps("bleed", "margin-block-end", "space", negativeMarginBlockEnd),
    ...getResponsiveProps("bleed", "margin-inline-start", "space", negativeMarginInlineStart),
    ...getResponsiveProps("bleed", "margin-inline-end", "space", negativeMarginInlineEnd)
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$n.Bleed,
    style: sanitizeCustomProperties(style)
  }, children);
};
function Breadcrumbs({
  backAction
}) {
  const {
    content
  } = backAction;
  return /* @__PURE__ */ React.createElement(Button, {
    key: content,
    url: "url" in backAction ? backAction.url : void 0,
    onClick: "onAction" in backAction ? backAction.onAction : void 0,
    onPointerDown: handleMouseUpByBlurring,
    icon: ArrowLeftIcon,
    accessibilityLabel: backAction.accessibilityLabel ?? content
  });
}
function getVisibleAndHiddenActionsIndices(promotedActions = [], disclosureWidth, actionsWidths, containerWidth) {
  const sumTabWidths = actionsWidths.reduce((sum, width) => sum + width, 0);
  const arrayOfPromotedActionsIndices = promotedActions.map((_, index) => {
    return index;
  });
  const visiblePromotedActions = [];
  const hiddenPromotedActions = [];
  if (containerWidth > sumTabWidths) {
    visiblePromotedActions.push(...arrayOfPromotedActionsIndices);
  } else {
    let accumulatedWidth = 0;
    let hasReturned = false;
    arrayOfPromotedActionsIndices.forEach((currentPromotedActionsIndex) => {
      const currentActionsWidth = actionsWidths[currentPromotedActionsIndex];
      const notEnoughSpace = accumulatedWidth + currentActionsWidth >= containerWidth - disclosureWidth;
      if (notEnoughSpace || hasReturned) {
        hiddenPromotedActions.push(currentPromotedActionsIndex);
        hasReturned = true;
        return;
      }
      visiblePromotedActions.push(currentPromotedActionsIndex);
      accumulatedWidth += currentActionsWidth;
    });
  }
  return {
    visiblePromotedActions,
    hiddenPromotedActions
  };
}
function instanceOfBulkActionListSectionArray(actions) {
  const validList = actions.filter((action2) => {
    return action2.items;
  });
  return actions.length === validList.length;
}
function instanceOfBulkActionArray(actions) {
  const validList = actions.filter((action2) => {
    return !action2.items;
  });
  return actions.length === validList.length;
}
function instanceOfMenuGroupDescriptor(action2) {
  return "title" in action2 && "actions" in action2;
}
function instanceOfBulkActionListSection(action2) {
  return "items" in action2;
}
function getActionSections(actions) {
  if (!actions || actions.length === 0) {
    return;
  }
  if (instanceOfBulkActionListSectionArray(actions)) {
    return actions;
  }
  if (instanceOfBulkActionArray(actions)) {
    return [{
      items: actions
    }];
  }
}
function isNewBadgeInBadgeActions(actionSections) {
  var _a;
  if (!actionSections) return false;
  for (const action2 of actionSections) {
    for (const item of action2.items) {
      if (((_a = item.badge) == null ? void 0 : _a.tone) === "new") return true;
    }
  }
  return false;
}
var styles$m = {
  "BulkActionsOuterLayout": "Polaris-BulkActions__BulkActionsOuterLayout",
  "BulkActionsSelectAllWrapper": "Polaris-BulkActions__BulkActionsSelectAllWrapper",
  "BulkActionsPromotedActionsWrapper": "Polaris-BulkActions__BulkActionsPromotedActionsWrapper",
  "BulkActionsLayout": "Polaris-BulkActions__BulkActionsLayout",
  "BulkActionsLayout--measuring": "Polaris-BulkActions--bulkActionsLayoutMeasuring",
  "BulkActionsMeasurerLayout": "Polaris-BulkActions__BulkActionsMeasurerLayout",
  "BulkActionButton": "Polaris-BulkActions__BulkActionButton",
  "AllAction": "Polaris-BulkActions__AllAction"
};
var styles$l = {
  "Indicator": "Polaris-Indicator",
  "pulseIndicator": "Polaris-Indicator--pulseIndicator"
};
function Indicator({
  pulse = true
}) {
  const className = classNames(styles$l.Indicator, pulse && styles$l.pulseIndicator);
  return /* @__PURE__ */ React.createElement("span", {
    className
  });
}
function BulkActionButton({
  handleMeasurement,
  url,
  external,
  onAction,
  content,
  disclosure,
  accessibilityLabel,
  disabled,
  destructive,
  indicator,
  showContentInButton,
  size
}) {
  const bulkActionButton = useRef(null);
  useComponentDidMount(() => {
    if (handleMeasurement && bulkActionButton.current) {
      const width = bulkActionButton.current.getBoundingClientRect().width;
      handleMeasurement(width);
    }
  });
  const isActivatorForMoreActionsPopover = disclosure && !showContentInButton;
  const buttonContent = isActivatorForMoreActionsPopover ? void 0 : content;
  const buttonMarkup = /* @__PURE__ */ React.createElement(Button, {
    external,
    url,
    accessibilityLabel: isActivatorForMoreActionsPopover ? content : accessibilityLabel,
    tone: destructive ? "critical" : void 0,
    disclosure: disclosure && showContentInButton,
    onClick: onAction,
    disabled,
    size,
    icon: isActivatorForMoreActionsPopover ? /* @__PURE__ */ React.createElement(Icon, {
      source: MenuHorizontalIcon,
      tone: "base"
    }) : void 0
  }, buttonContent);
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActionButton,
    ref: bulkActionButton
  }, isActivatorForMoreActionsPopover ? /* @__PURE__ */ React.createElement(Tooltip, {
    content,
    preferredPosition: "below"
  }, buttonMarkup) : buttonMarkup, indicator && /* @__PURE__ */ React.createElement(Indicator, null));
}
function BulkActionMenu({
  title,
  actions,
  isNewBadgeInBadgeActions: isNewBadgeInBadgeActions2,
  size
}) {
  const {
    value: isVisible,
    toggle: toggleMenuVisibility
  } = useToggle(false);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Popover2, {
    active: isVisible,
    activator: /* @__PURE__ */ React.createElement(BulkActionButton, {
      disclosure: true,
      showContentInButton: true,
      onAction: toggleMenuVisibility,
      content: title,
      indicator: isNewBadgeInBadgeActions2,
      size
    }),
    onClose: toggleMenuVisibility,
    preferInputActivator: true
  }, /* @__PURE__ */ React.createElement(ActionList, {
    items: actions,
    onActionAnyItem: toggleMenuVisibility
  })));
}
var styles$k = {
  "CheckableButton": "Polaris-CheckableButton",
  "Checkbox": "Polaris-CheckableButton__Checkbox",
  "Label": "Polaris-CheckableButton__Label"
};
const CheckableButton = /* @__PURE__ */ forwardRef(function CheckableButton2({
  accessibilityLabel,
  label = "",
  onToggleAll,
  selected,
  disabled,
  ariaLive
}, ref) {
  const checkBoxRef = useRef(null);
  function focus() {
    var _a;
    (_a = checkBoxRef == null ? void 0 : checkBoxRef.current) == null ? void 0 : _a.focus();
  }
  useImperativeHandle(ref, () => {
    return {
      focus
    };
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$k.CheckableButton,
    onClick: onToggleAll
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$k.Checkbox
  }, /* @__PURE__ */ React.createElement(Checkbox$1, {
    label: accessibilityLabel,
    labelHidden: true,
    checked: selected,
    disabled,
    onChange: onToggleAll,
    ref: checkBoxRef
  })), label ? /* @__PURE__ */ React.createElement("span", {
    className: styles$k.Label,
    "aria-live": ariaLive
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodySm",
    fontWeight: "medium"
  }, label)) : null);
});
const ACTION_SPACING = 4;
function BulkActionsMeasurer({
  promotedActions = [],
  disabled,
  buttonSize,
  handleMeasurement: handleMeasurementProp
}) {
  const i18n = useI18n();
  const containerNode = useRef(null);
  const activatorLabel = i18n.translate("Polaris.ResourceList.BulkActions.moreActionsActivatorLabel");
  const activator = /* @__PURE__ */ React.createElement(BulkActionButton, {
    disclosure: true,
    content: activatorLabel
  });
  const handleMeasurement = useCallback(() => {
    if (!containerNode.current) {
      return;
    }
    const containerWidth = containerNode.current.offsetWidth;
    const hiddenActionNodes = containerNode.current.children;
    const hiddenActionNodesArray = Array.from(hiddenActionNodes);
    const hiddenActionsWidths = hiddenActionNodesArray.map((node) => {
      const buttonWidth = Math.ceil(node.getBoundingClientRect().width);
      return buttonWidth + ACTION_SPACING;
    });
    const disclosureWidth = hiddenActionsWidths.pop() || 0;
    handleMeasurementProp({
      containerWidth,
      disclosureWidth,
      hiddenActionsWidths
    });
  }, [handleMeasurementProp]);
  useEffect(() => {
    handleMeasurement();
  }, [handleMeasurement, promotedActions]);
  const promotedActionsMarkup = promotedActions.map((action2, index) => {
    if (instanceOfMenuGroupDescriptor(action2)) {
      return /* @__PURE__ */ React.createElement(BulkActionButton, {
        key: index,
        disclosure: true,
        showContentInButton: true,
        content: action2.title,
        size: buttonSize
      });
    }
    return /* @__PURE__ */ React.createElement(BulkActionButton, Object.assign({
      key: index,
      disabled
    }, action2, {
      size: buttonSize
    }));
  });
  useEventListener("resize", handleMeasurement);
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActionsMeasurerLayout,
    ref: containerNode
  }, promotedActionsMarkup, activator);
}
const BulkActions = /* @__PURE__ */ forwardRef(function BulkActions2({
  promotedActions,
  actions,
  disabled,
  buttonSize,
  paginatedSelectAllAction,
  paginatedSelectAllText,
  label,
  accessibilityLabel,
  selected,
  onToggleAll,
  onMoreActionPopoverToggle,
  width,
  selectMode
}, ref) {
  const i18n = useI18n();
  const [popoverActive, setPopoverActive] = useState(false);
  const [state, setState] = useReducer((data, partialData) => {
    return {
      ...data,
      ...partialData
    };
  }, {
    disclosureWidth: 0,
    containerWidth: Infinity,
    actionsWidths: [],
    visiblePromotedActions: [],
    hiddenPromotedActions: [],
    hasMeasured: false
  });
  const {
    visiblePromotedActions,
    hiddenPromotedActions,
    containerWidth,
    disclosureWidth,
    actionsWidths,
    hasMeasured
  } = state;
  useEffect(() => {
    if (containerWidth === 0 || !promotedActions || promotedActions.length === 0) {
      return;
    }
    const {
      visiblePromotedActions: visiblePromotedActions2,
      hiddenPromotedActions: hiddenPromotedActions2
    } = getVisibleAndHiddenActionsIndices(promotedActions, disclosureWidth, actionsWidths, containerWidth);
    setState({
      visiblePromotedActions: visiblePromotedActions2,
      hiddenPromotedActions: hiddenPromotedActions2,
      hasMeasured: containerWidth !== Infinity
    });
  }, [containerWidth, disclosureWidth, promotedActions, actionsWidths]);
  const activatorLabel = !promotedActions || promotedActions && visiblePromotedActions.length === 0 ? i18n.translate("Polaris.ResourceList.BulkActions.actionsActivatorLabel") : i18n.translate("Polaris.ResourceList.BulkActions.moreActionsActivatorLabel");
  const paginatedSelectAllMarkup = paginatedSelectAllAction ? /* @__PURE__ */ React.createElement(UnstyledButton, {
    className: styles$m.AllAction,
    onClick: paginatedSelectAllAction.onAction,
    size: "slim",
    disabled
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodySm",
    fontWeight: "medium"
  }, paginatedSelectAllAction.content)) : null;
  const hasTextAndAction = paginatedSelectAllText && paginatedSelectAllAction;
  const ariaLive = hasTextAndAction ? "polite" : void 0;
  const checkableButtonProps = {
    accessibilityLabel,
    label: hasTextAndAction ? paginatedSelectAllText : label,
    selected,
    onToggleAll,
    disabled,
    ariaLive,
    ref
  };
  const togglePopover = useCallback(() => {
    onMoreActionPopoverToggle == null ? void 0 : onMoreActionPopoverToggle(popoverActive);
    setPopoverActive((popoverActive2) => !popoverActive2);
  }, [onMoreActionPopoverToggle, popoverActive]);
  const handleMeasurement = useCallback((measurements) => {
    const {
      hiddenActionsWidths: actionsWidths2,
      containerWidth: containerWidth2,
      disclosureWidth: disclosureWidth2
    } = measurements;
    if (!promotedActions || promotedActions.length === 0) {
      return;
    }
    const {
      visiblePromotedActions: visiblePromotedActions2,
      hiddenPromotedActions: hiddenPromotedActions2
    } = getVisibleAndHiddenActionsIndices(promotedActions, disclosureWidth2, actionsWidths2, containerWidth2);
    setState({
      visiblePromotedActions: visiblePromotedActions2,
      hiddenPromotedActions: hiddenPromotedActions2,
      actionsWidths: actionsWidths2,
      containerWidth: containerWidth2,
      disclosureWidth: disclosureWidth2,
      hasMeasured: true
    });
  }, [promotedActions]);
  const actionSections = getActionSections(actions);
  const promotedActionsMarkup = promotedActions ? promotedActions.filter((_, index) => {
    if (!visiblePromotedActions.includes(index)) {
      return false;
    }
    return true;
  }).map((action2, index) => {
    if (instanceOfMenuGroupDescriptor(action2)) {
      return /* @__PURE__ */ React.createElement(BulkActionMenu, Object.assign({
        key: index
      }, action2, {
        isNewBadgeInBadgeActions: isNewBadgeInBadgeActions(actionSections),
        size: buttonSize
      }));
    }
    return /* @__PURE__ */ React.createElement(BulkActionButton, Object.assign({
      key: index,
      disabled
    }, action2, {
      size: buttonSize
    }));
  }) : null;
  const hiddenPromotedActionObjects = hiddenPromotedActions.map((index) => promotedActions == null ? void 0 : promotedActions[index]);
  const mergedHiddenPromotedActions = hiddenPromotedActionObjects.reduce((memo2, action2) => {
    if (!action2) return memo2;
    if (instanceOfMenuGroupDescriptor(action2)) {
      return memo2.concat(action2.actions);
    }
    return memo2.concat(action2);
  }, []);
  const hiddenPromotedSection = {
    items: mergedHiddenPromotedActions
  };
  const allHiddenActions = useMemo(() => {
    if (actionSections) {
      return actionSections;
    }
    if (!actions) {
      return [];
    }
    let isAFlatArray = true;
    return actions.filter((action2) => action2).reduce((memo2, action2) => {
      if (instanceOfBulkActionListSection(action2)) {
        isAFlatArray = false;
        return memo2.concat(action2);
      }
      if (isAFlatArray) {
        if (memo2.length === 0) {
          return [{
            items: [action2]
          }];
        }
        const lastItem = memo2[memo2.length - 1];
        memo2.splice(memo2.length - 1, 1, {
          items: [...lastItem.items, action2]
        });
        return memo2;
      }
      isAFlatArray = true;
      return memo2.concat({
        items: [action2]
      });
    }, []);
  }, [actions, actionSections]);
  const activator = /* @__PURE__ */ React.createElement(BulkActionButton, {
    disclosure: true,
    showContentInButton: !promotedActionsMarkup,
    onAction: togglePopover,
    content: activatorLabel,
    disabled,
    indicator: isNewBadgeInBadgeActions(actionSections),
    size: buttonSize
  });
  const actionsMarkup = allHiddenActions.length > 0 ? /* @__PURE__ */ React.createElement(Popover2, {
    active: popoverActive,
    activator,
    preferredAlignment: "right",
    onClose: togglePopover
  }, /* @__PURE__ */ React.createElement(ActionList, {
    sections: hiddenPromotedSection.items.length > 0 ? [hiddenPromotedSection, ...allHiddenActions] : allHiddenActions,
    onActionAnyItem: togglePopover
  })) : null;
  const measurerMarkup = /* @__PURE__ */ React.createElement(BulkActionsMeasurer, {
    promotedActions,
    disabled,
    buttonSize,
    handleMeasurement
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActions,
    style: width ? {
      width
    } : void 0
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400",
    blockAlign: "center"
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActionsSelectAllWrapper
  }, /* @__PURE__ */ React.createElement(CheckableButton, checkableButtonProps), paginatedSelectAllMarkup), selectMode ? /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActionsPromotedActionsWrapper
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "100",
    blockAlign: "center"
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$m.BulkActionsOuterLayout
  }, measurerMarkup, /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$m.BulkActionsLayout, !hasMeasured && styles$m["BulkActionsLayout--measuring"])
  }, promotedActionsMarkup)), actionsMarkup)) : null));
});
var styles$j = {
  "LegacyStack": "Polaris-LegacyStack",
  "Item": "Polaris-LegacyStack__Item",
  "noWrap": "Polaris-LegacyStack--noWrap",
  "spacingNone": "Polaris-LegacyStack--spacingNone",
  "spacingExtraTight": "Polaris-LegacyStack--spacingExtraTight",
  "spacingTight": "Polaris-LegacyStack--spacingTight",
  "spacingBaseTight": "Polaris-LegacyStack--spacingBaseTight",
  "spacingLoose": "Polaris-LegacyStack--spacingLoose",
  "spacingExtraLoose": "Polaris-LegacyStack--spacingExtraLoose",
  "distributionLeading": "Polaris-LegacyStack--distributionLeading",
  "distributionTrailing": "Polaris-LegacyStack--distributionTrailing",
  "distributionCenter": "Polaris-LegacyStack--distributionCenter",
  "distributionEqualSpacing": "Polaris-LegacyStack--distributionEqualSpacing",
  "distributionFill": "Polaris-LegacyStack--distributionFill",
  "distributionFillEvenly": "Polaris-LegacyStack--distributionFillEvenly",
  "alignmentLeading": "Polaris-LegacyStack--alignmentLeading",
  "alignmentTrailing": "Polaris-LegacyStack--alignmentTrailing",
  "alignmentCenter": "Polaris-LegacyStack--alignmentCenter",
  "alignmentFill": "Polaris-LegacyStack--alignmentFill",
  "alignmentBaseline": "Polaris-LegacyStack--alignmentBaseline",
  "vertical": "Polaris-LegacyStack--vertical",
  "Item-fill": "Polaris-LegacyStack__Item--fill"
};
function Item$2({
  children,
  fill
}) {
  const className = classNames(styles$j.Item, fill && styles$j["Item-fill"]);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, children);
}
const LegacyStack = /* @__PURE__ */ memo(function Stack({
  children,
  vertical,
  spacing,
  distribution,
  alignment,
  wrap
}) {
  const className = classNames(styles$j.LegacyStack, vertical && styles$j.vertical, spacing && styles$j[variationName("spacing", spacing)], distribution && styles$j[variationName("distribution", distribution)], alignment && styles$j[variationName("alignment", alignment)], wrap === false && styles$j.noWrap);
  const itemMarkup = elementChildren(children).map((child, index) => {
    const props = {
      key: index
    };
    return wrapWithComponent(child, Item$2, props);
  });
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, itemMarkup);
});
LegacyStack.Item = Item$2;
var styles$i = {
  "InlineGrid": "Polaris-InlineGrid"
};
function InlineGrid({
  children,
  columns,
  gap,
  alignItems
}) {
  const style = {
    ...getResponsiveValue("inline-grid", "grid-template-columns", formatInlineGrid(columns)),
    ...getResponsiveProps("inline-grid", "gap", "space", gap),
    "--pc-inline-grid-align-items": alignItems
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$i.InlineGrid,
    style: sanitizeCustomProperties(style)
  }, children);
}
function formatInlineGrid(columns) {
  if (typeof columns === "object" && columns !== null && !Array.isArray(columns)) {
    return Object.fromEntries(Object.entries(columns).map(([breakpointAlias, breakpointInlineGrid]) => [breakpointAlias, getColumnValue(breakpointInlineGrid)]));
  }
  return getColumnValue(columns);
}
function getColumnValue(columns) {
  if (!columns) return void 0;
  if (typeof columns === "number" || !isNaN(Number(columns))) {
    return `repeat(${Number(columns)}, minmax(0, 1fr))`;
  }
  if (typeof columns === "string") return columns;
  return columns.map((column) => {
    switch (column) {
      case "oneThird":
        return "minmax(0, 1fr)";
      case "oneHalf":
        return "minmax(0, 1fr)";
      case "twoThirds":
        return "minmax(0, 2fr)";
    }
  }).join(" ");
}
const FrameContext = /* @__PURE__ */ createContext(void 0);
function measureColumn(tableData) {
  return function(column, index) {
    const {
      firstVisibleColumnIndex,
      tableLeftVisibleEdge: tableStart,
      tableRightVisibleEdge: tableEnd
    } = tableData;
    const leftEdge = column.offsetLeft;
    const rightEdge = leftEdge + column.offsetWidth;
    const isVisibleLeft = isEdgeVisible(leftEdge, tableStart, tableEnd, "left");
    const isVisibleRight = isEdgeVisible(rightEdge, tableStart, tableEnd, "right");
    const isVisible = isVisibleLeft || isVisibleRight;
    const width = column.offsetWidth;
    if (isVisible) {
      tableData.firstVisibleColumnIndex = Math.min(firstVisibleColumnIndex, index);
    }
    return {
      leftEdge,
      rightEdge,
      isVisible,
      width,
      index
    };
  };
}
function isEdgeVisible(position, start, end, edgeType) {
  const minVisiblePixels = 30;
  return position >= start + (edgeType === "left" ? 0 : minVisiblePixels) && position <= end - minVisiblePixels;
}
function getPrevAndCurrentColumns(tableData, columnData) {
  const {
    firstVisibleColumnIndex
  } = tableData;
  const previousColumnIndex = Math.max(firstVisibleColumnIndex - 1, 0);
  const previousColumn = columnData[previousColumnIndex];
  const currentColumn = columnData[firstVisibleColumnIndex];
  return {
    previousColumn,
    currentColumn
  };
}
var styles$h = {
  "DataTable": "Polaris-DataTable",
  "condensed": "Polaris-DataTable--condensed",
  "Navigation": "Polaris-DataTable__Navigation",
  "Pip": "Polaris-DataTable__Pip",
  "Pip-visible": "Polaris-DataTable__Pip--visible",
  "ScrollContainer": "Polaris-DataTable__ScrollContainer",
  "Table": "Polaris-DataTable__Table",
  "TableRow": "Polaris-DataTable__TableRow",
  "Cell": "Polaris-DataTable__Cell",
  "IncreasedTableDensity": "Polaris-DataTable__IncreasedTableDensity",
  "ZebraStripingOnData": "Polaris-DataTable__ZebraStripingOnData",
  "RowCountIsEven": "Polaris-DataTable__RowCountIsEven",
  "ShowTotalsInFooter": "Polaris-DataTable__ShowTotalsInFooter",
  "Cell-separate": "Polaris-DataTable__Cell--separate",
  "Cell-firstColumn": "Polaris-DataTable__Cell--firstColumn",
  "Cell-numeric": "Polaris-DataTable__Cell--numeric",
  "Cell-truncated": "Polaris-DataTable__Cell--truncated",
  "Cell-header": "Polaris-DataTable__Cell--header",
  "Cell-sortable": "Polaris-DataTable__Cell--sortable",
  "Heading-left": "Polaris-DataTable__Heading--left",
  "Cell-verticalAlignTop": "Polaris-DataTable__Cell--verticalAlignTop",
  "Cell-verticalAlignBottom": "Polaris-DataTable__Cell--verticalAlignBottom",
  "Cell-verticalAlignMiddle": "Polaris-DataTable__Cell--verticalAlignMiddle",
  "Cell-verticalAlignBaseline": "Polaris-DataTable__Cell--verticalAlignBaseline",
  "hoverable": "Polaris-DataTable--hoverable",
  "Cell-hovered": "Polaris-DataTable__Cell--hovered",
  "Icon": "Polaris-DataTable__Icon",
  "Heading": "Polaris-DataTable__Heading",
  "StickyHeaderEnabled": "Polaris-DataTable__StickyHeaderEnabled",
  "StickyHeaderWrapper": "Polaris-DataTable__StickyHeaderWrapper",
  "Cell-sorted": "Polaris-DataTable__Cell--sorted",
  "Cell-total": "Polaris-DataTable__Cell--total",
  "ShowTotals": "Polaris-DataTable__ShowTotals",
  "Cell-total-footer": "Polaris-DataTable--cellTotalFooter",
  "Footer": "Polaris-DataTable__Footer",
  "StickyHeaderInner": "Polaris-DataTable__StickyHeaderInner",
  "StickyHeaderInner-isSticky": "Polaris-DataTable__StickyHeaderInner--isSticky",
  "StickyHeaderTable": "Polaris-DataTable__StickyHeaderTable",
  "FixedFirstColumn": "Polaris-DataTable__FixedFirstColumn",
  "StickyTableHeadingsRow": "Polaris-DataTable__StickyTableHeadingsRow",
  "TooltipContent": "Polaris-DataTable__TooltipContent"
};
function Cell$1({
  content,
  contentType,
  nthColumn,
  firstColumn,
  truncate,
  header,
  total,
  totalInFooter,
  sorted,
  sortable,
  sortDirection,
  inFixedNthColumn,
  verticalAlign = "top",
  defaultSortDirection = "ascending",
  onSort,
  colSpan,
  setRef = () => {
  },
  stickyHeadingCell = false,
  stickyCellWidth,
  hovered = false,
  handleFocus = () => {
  },
  hasFixedNthColumn = false,
  fixedCellVisible = false,
  firstColumnMinWidth,
  style,
  lastFixedFirstColumn
}) {
  const i18n = useI18n();
  const numeric = contentType === "numeric";
  const className = classNames(styles$h.Cell, styles$h[`Cell-${variationName("verticalAlign", verticalAlign)}`], firstColumn && styles$h["Cell-firstColumn"], truncate && styles$h["Cell-truncated"], header && styles$h["Cell-header"], total && styles$h["Cell-total"], totalInFooter && styles$h["Cell-total-footer"], numeric && styles$h["Cell-numeric"], sortable && styles$h["Cell-sortable"], sorted && styles$h["Cell-sorted"], stickyHeadingCell && styles$h.StickyHeaderCell, hovered && styles$h["Cell-hovered"], lastFixedFirstColumn && inFixedNthColumn && fixedCellVisible && styles$h["Cell-separate"], nthColumn && inFixedNthColumn && stickyHeadingCell && styles$h.FixedFirstColumn);
  const headerClassName = classNames(header && styles$h.Heading, header && contentType === "text" && styles$h["Heading-left"]);
  const iconClassName = classNames(sortable && styles$h.Icon);
  const direction = sorted && sortDirection ? sortDirection : defaultSortDirection;
  const source = direction === "descending" ? SortDescendingIcon : SortAscendingIcon;
  const oppositeDirection = sortDirection === "ascending" ? "descending" : "ascending";
  const sortAccessibilityLabel = i18n.translate("Polaris.DataTable.sortAccessibilityLabel", {
    direction: sorted ? oppositeDirection : direction
  });
  const iconMarkup = /* @__PURE__ */ React.createElement("span", {
    className: iconClassName
  }, /* @__PURE__ */ React.createElement(Icon, {
    source,
    accessibilityLabel: sortAccessibilityLabel
  }));
  const focusable = !(stickyHeadingCell && hasFixedNthColumn && nthColumn && !inFixedNthColumn);
  const sortableHeadingContent = /* @__PURE__ */ React.createElement("button", {
    className: headerClassName,
    onClick: onSort,
    onFocus: handleFocus,
    tabIndex: focusable ? 0 : -1
  }, iconMarkup, content);
  const columnHeadingContent = sortable ? sortableHeadingContent : content;
  const colSpanProp = colSpan && colSpan > 1 ? {
    colSpan
  } : {};
  const minWidthStyles = nthColumn && firstColumnMinWidth ? {
    minWidth: firstColumnMinWidth
  } : {
    minWidth: stickyCellWidth
  };
  const stickyHeading = /* @__PURE__ */ React.createElement("th", Object.assign({
    ref: setRef
  }, headerCell.props, colSpanProp, {
    className,
    "aria-sort": sortDirection,
    style: {
      ...style,
      ...minWidthStyles
    },
    "data-index-table-sticky-heading": true
  }), columnHeadingContent);
  const headingMarkup = header ? /* @__PURE__ */ React.createElement("th", Object.assign({}, headerCell.props, {
    "aria-sort": sortDirection
  }, colSpanProp, {
    ref: setRef,
    className,
    scope: "col",
    style: {
      ...minWidthStyles
    }
  }), columnHeadingContent) : /* @__PURE__ */ React.createElement("th", Object.assign({}, colSpanProp, {
    ref: setRef,
    className,
    scope: "row",
    style: {
      ...minWidthStyles
    }
  }), truncate ? /* @__PURE__ */ React.createElement(TruncatedText, {
    className: styles$h.TooltipContent
  }, content) : content);
  const cellMarkup = header || firstColumn || nthColumn ? headingMarkup : /* @__PURE__ */ React.createElement("td", Object.assign({
    className
  }, colSpanProp), content);
  return stickyHeadingCell ? stickyHeading : cellMarkup;
}
const TruncatedText = ({
  children,
  className = ""
}) => {
  const textRef = useRef(null);
  const {
    current
  } = textRef;
  const text = /* @__PURE__ */ React.createElement("span", {
    ref: textRef,
    className
  }, children);
  return (current == null ? void 0 : current.scrollWidth) > (current == null ? void 0 : current.offsetWidth) ? /* @__PURE__ */ React.createElement(Tooltip, {
    content: textRef.current.innerText
  }, text) : text;
};
var EditableTarget = /* @__PURE__ */ (function(EditableTarget2) {
  EditableTarget2["Input"] = "INPUT";
  EditableTarget2["Textarea"] = "TEXTAREA";
  EditableTarget2["Select"] = "SELECT";
  EditableTarget2["ContentEditable"] = "contenteditable";
  return EditableTarget2;
})(EditableTarget || {});
function isInputFocused() {
  if (document == null || document.activeElement == null) {
    return false;
  }
  const {
    tagName
  } = document.activeElement;
  return tagName === EditableTarget.Input || tagName === EditableTarget.Textarea || tagName === EditableTarget.Select || document.activeElement.hasAttribute(EditableTarget.ContentEditable);
}
var styles$g = {
  "Pagination": "Polaris-Pagination",
  "table": "Polaris-Pagination--table",
  "TablePaginationActions": "Polaris-Pagination__TablePaginationActions"
};
function Pagination({
  hasNext,
  hasPrevious,
  nextURL,
  previousURL,
  onNext,
  onPrevious,
  nextTooltip,
  previousTooltip,
  nextKeys,
  previousKeys,
  accessibilityLabel,
  accessibilityLabels,
  label,
  type = "page"
}) {
  const i18n = useI18n();
  const node = /* @__PURE__ */ createRef();
  const navLabel = accessibilityLabel || i18n.translate("Polaris.Pagination.pagination");
  const previousLabel = (accessibilityLabels == null ? void 0 : accessibilityLabels.previous) || i18n.translate("Polaris.Pagination.previous");
  const nextLabel = (accessibilityLabels == null ? void 0 : accessibilityLabels.next) || i18n.translate("Polaris.Pagination.next");
  const prev = /* @__PURE__ */ React.createElement(Button, {
    icon: ChevronLeftIcon,
    accessibilityLabel: previousLabel,
    url: previousURL,
    onClick: onPrevious,
    disabled: !hasPrevious,
    id: "previousURL"
  });
  const constructedPrevious = previousTooltip && hasPrevious ? /* @__PURE__ */ React.createElement(Tooltip, {
    activatorWrapper: "span",
    content: previousTooltip,
    preferredPosition: "below"
  }, prev) : prev;
  const next = /* @__PURE__ */ React.createElement(Button, {
    icon: ChevronRightIcon,
    accessibilityLabel: nextLabel,
    url: nextURL,
    onClick: onNext,
    disabled: !hasNext,
    id: "nextURL"
  });
  const constructedNext = nextTooltip && hasNext ? /* @__PURE__ */ React.createElement(Tooltip, {
    activatorWrapper: "span",
    content: nextTooltip,
    preferredPosition: "below"
  }, next) : next;
  const previousHandler = onPrevious || noop$1;
  const previousButtonEvents = previousKeys && (previousURL || onPrevious) && hasPrevious && previousKeys.map((key) => /* @__PURE__ */ React.createElement(KeypressListener, {
    key,
    keyCode: key,
    handler: previousURL ? handleCallback(clickPaginationLink("previousURL", node)) : handleCallback(previousHandler)
  }));
  const nextHandler = onNext || noop$1;
  const nextButtonEvents = nextKeys && (nextURL || onNext) && hasNext && nextKeys.map((key) => /* @__PURE__ */ React.createElement(KeypressListener, {
    key,
    keyCode: key,
    handler: nextURL ? handleCallback(clickPaginationLink("nextURL", node)) : handleCallback(nextHandler)
  }));
  if (type === "table") {
    const labelMarkup2 = label ? /* @__PURE__ */ React.createElement(Box, {
      padding: "300",
      paddingBlockStart: "0",
      paddingBlockEnd: "0"
    }, /* @__PURE__ */ React.createElement(Text, {
      as: "span",
      variant: "bodySm",
      fontWeight: "medium"
    }, label)) : null;
    return /* @__PURE__ */ React.createElement("nav", {
      "aria-label": navLabel,
      ref: node,
      className: classNames(styles$g.Pagination, styles$g.table)
    }, previousButtonEvents, nextButtonEvents, /* @__PURE__ */ React.createElement(Box, {
      background: "bg-surface-secondary",
      paddingBlockStart: "150",
      paddingBlockEnd: "150",
      paddingInlineStart: "300",
      paddingInlineEnd: "200"
    }, /* @__PURE__ */ React.createElement(InlineStack, {
      align: "center",
      blockAlign: "center"
    }, /* @__PURE__ */ React.createElement("div", {
      className: styles$g.TablePaginationActions,
      "data-buttongroup-variant": "segmented"
    }, /* @__PURE__ */ React.createElement("div", null, constructedPrevious), labelMarkup2, /* @__PURE__ */ React.createElement("div", null, constructedNext)))));
  }
  const labelTextMarkup = hasNext && hasPrevious ? /* @__PURE__ */ React.createElement("span", null, label) : /* @__PURE__ */ React.createElement(Text, {
    tone: "subdued",
    as: "span"
  }, label);
  const labelMarkup = label ? /* @__PURE__ */ React.createElement(Box, {
    padding: "300",
    paddingBlockStart: "0",
    paddingBlockEnd: "0"
  }, /* @__PURE__ */ React.createElement("div", {
    "aria-live": "polite"
  }, labelTextMarkup)) : null;
  return /* @__PURE__ */ React.createElement("nav", {
    "aria-label": navLabel,
    ref: node,
    className: styles$g.Pagination
  }, previousButtonEvents, nextButtonEvents, /* @__PURE__ */ React.createElement(ButtonGroup, {
    variant: "segmented"
  }, constructedPrevious, labelMarkup, constructedNext));
}
function clickPaginationLink(id, node) {
  return () => {
    if (node.current == null) {
      return;
    }
    const link = node.current.querySelector(`#${id}`);
    if (link) {
      link.click();
    }
  };
}
function handleCallback(fn) {
  return () => {
    if (isInputFocused()) {
      return;
    }
    fn();
  };
}
function noop$1() {
}
function AfterInitialMount({
  children,
  onMount,
  fallback = null
}) {
  const isMounted = useIsAfterInitialMount();
  const content = isMounted ? children : fallback;
  useEffect(() => {
    if (isMounted && onMount) {
      onMount();
    }
  }, [isMounted, onMount]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, content);
}
function useStickyManager() {
  const stickyManager = useContext(StickyManagerContext);
  if (!stickyManager) {
    throw new MissingAppProviderError("No StickyManager was provided.");
  }
  return stickyManager;
}
class StickyInner extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      isSticky: false,
      style: {}
    };
    this.placeHolderNode = null;
    this.stickyNode = null;
    this.setPlaceHolderNode = (node) => {
      this.placeHolderNode = node;
    };
    this.setStickyNode = (node) => {
      this.stickyNode = node;
    };
    this.handlePositioning = (stick, top = 0, left = 0, width = 0) => {
      const {
        isSticky
      } = this.state;
      if (stick && !isSticky || !stick && isSticky) {
        this.adjustPlaceHolderNode(stick);
        this.setState({
          isSticky: !isSticky
        }, () => {
          if (this.props.onStickyChange == null) {
            return null;
          }
          this.props.onStickyChange(!isSticky);
          if (this.props.boundingElement == null) {
            return null;
          }
          this.props.boundingElement.toggleAttribute("data-sticky-active");
        });
      }
      const style = stick ? {
        position: "fixed",
        top,
        left,
        width
      } : {};
      this.setState({
        style
      });
    };
    this.adjustPlaceHolderNode = (add) => {
      if (this.placeHolderNode && this.stickyNode) {
        this.placeHolderNode.style.paddingBottom = add ? `${getRectForNode(this.stickyNode).height}px` : "0px";
      }
    };
  }
  componentDidMount() {
    const {
      boundingElement,
      offset = false,
      disableWhenStacked = false,
      stickyManager
    } = this.props;
    if (!this.stickyNode || !this.placeHolderNode) return;
    stickyManager.registerStickyItem({
      stickyNode: this.stickyNode,
      placeHolderNode: this.placeHolderNode,
      handlePositioning: this.handlePositioning,
      offset,
      boundingElement,
      disableWhenStacked
    });
  }
  componentDidUpdate() {
    const {
      boundingElement,
      offset = false,
      disableWhenStacked = false,
      stickyManager
    } = this.props;
    if (!this.stickyNode || !this.placeHolderNode) return;
    const stickyManagerItem = stickyManager.getStickyItem(this.stickyNode);
    const didPropsChange = !stickyManagerItem || boundingElement !== stickyManagerItem.boundingElement || offset !== stickyManagerItem.offset || disableWhenStacked !== stickyManagerItem.disableWhenStacked;
    if (!didPropsChange) return;
    stickyManager.unregisterStickyItem(this.stickyNode);
    stickyManager.registerStickyItem({
      stickyNode: this.stickyNode,
      placeHolderNode: this.placeHolderNode,
      handlePositioning: this.handlePositioning,
      offset,
      boundingElement,
      disableWhenStacked
    });
  }
  componentWillUnmount() {
    const {
      stickyManager
    } = this.props;
    if (!this.stickyNode) return;
    stickyManager.unregisterStickyItem(this.stickyNode);
  }
  render() {
    const {
      style,
      isSticky
    } = this.state;
    const {
      children
    } = this.props;
    const childrenContent = isFunction(children) ? children(isSticky) : children;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
      ref: this.setPlaceHolderNode
    }), /* @__PURE__ */ React.createElement("div", {
      ref: this.setStickyNode,
      style
    }, childrenContent));
  }
}
function isFunction(arg) {
  return typeof arg === "function";
}
function Sticky(props) {
  const stickyManager = useStickyManager();
  return /* @__PURE__ */ React.createElement(StickyInner, Object.assign({}, props, {
    stickyManager
  }));
}
function Navigation({
  columnVisibilityData,
  isScrolledFarthestLeft,
  isScrolledFarthestRight,
  navigateTableLeft,
  navigateTableRight,
  fixedFirstColumns,
  setRef = () => {
  }
}) {
  const i18n = useI18n();
  const pipMarkup = columnVisibilityData.map((column, index) => {
    if (index < fixedFirstColumns) return;
    const className = classNames(styles$h.Pip, column.isVisible && styles$h["Pip-visible"]);
    return /* @__PURE__ */ React.createElement("div", {
      className,
      key: `pip-${index}`
    });
  });
  const leftA11yLabel = i18n.translate("Polaris.DataTable.navAccessibilityLabel", {
    direction: "left"
  });
  const rightA11yLabel = i18n.translate("Polaris.DataTable.navAccessibilityLabel", {
    direction: "right"
  });
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$h.Navigation,
    ref: setRef
  }, /* @__PURE__ */ React.createElement(Button, {
    variant: "tertiary",
    icon: ChevronLeftIcon,
    disabled: isScrolledFarthestLeft,
    accessibilityLabel: leftA11yLabel,
    onClick: navigateTableLeft
  }), pipMarkup, /* @__PURE__ */ React.createElement(Button, {
    variant: "tertiary",
    icon: ChevronRightIcon,
    disabled: isScrolledFarthestRight,
    accessibilityLabel: rightA11yLabel,
    onClick: navigateTableRight
  }));
}
const getRowClientHeights = (rows) => {
  const heights = [];
  if (!rows) {
    return heights;
  }
  rows.forEach((row) => {
    heights.push(row.clientHeight);
  });
  return heights;
};
class DataTableInner extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      condensed: false,
      columnVisibilityData: [],
      isScrolledFarthestLeft: true,
      isScrolledFarthestRight: false,
      rowHovered: void 0
    };
    this.dataTable = /* @__PURE__ */ createRef();
    this.scrollContainer = /* @__PURE__ */ createRef();
    this.table = /* @__PURE__ */ createRef();
    this.stickyTable = /* @__PURE__ */ createRef();
    this.stickyNav = null;
    this.headerNav = null;
    this.tableHeadings = [];
    this.stickyHeadings = [];
    this.tableHeadingWidths = [];
    this.stickyHeaderActive = false;
    this.scrollStopTimer = null;
    this.handleResize = debounce(() => {
      const {
        table: {
          current: table
        },
        scrollContainer: {
          current: scrollContainer
        }
      } = this;
      let condensed = false;
      if (table && scrollContainer) {
        condensed = table.scrollWidth > scrollContainer.clientWidth + 1;
      }
      this.setState({
        condensed,
        ...this.calculateColumnVisibilityData(condensed)
      });
    });
    this.setCellRef = ({
      ref,
      index,
      inStickyHeader
    }) => {
      if (ref == null) {
        return;
      }
      if (inStickyHeader) {
        this.stickyHeadings[index] = ref;
        const button = ref.querySelector("button");
        if (button == null) {
          return;
        }
        button.addEventListener("focus", this.handleHeaderButtonFocus);
      } else {
        this.tableHeadings[index] = ref;
        this.tableHeadingWidths[index] = ref.clientWidth;
      }
    };
    this.changeHeadingFocus = () => {
      const {
        tableHeadings,
        stickyHeadings,
        stickyNav,
        headerNav
      } = this;
      const stickyFocusedItemIndex = stickyHeadings.findIndex((item) => {
        var _a;
        return item === ((_a = document.activeElement) == null ? void 0 : _a.parentElement);
      });
      const tableFocusedItemIndex = tableHeadings.findIndex((item) => {
        var _a;
        return item === ((_a = document.activeElement) == null ? void 0 : _a.parentElement);
      });
      const arrowsInStickyNav = stickyNav == null ? void 0 : stickyNav.querySelectorAll("button");
      const arrowsInHeaderNav = headerNav == null ? void 0 : headerNav.querySelectorAll("button");
      let stickyFocusedNavIndex = -1;
      arrowsInStickyNav == null ? void 0 : arrowsInStickyNav.forEach((item, index) => {
        if (item === document.activeElement) {
          stickyFocusedNavIndex = index;
        }
      });
      let headerFocusedNavIndex = -1;
      arrowsInHeaderNav == null ? void 0 : arrowsInHeaderNav.forEach((item, index) => {
        if (item === document.activeElement) {
          headerFocusedNavIndex = index;
        }
      });
      if (stickyFocusedItemIndex < 0 && tableFocusedItemIndex < 0 && stickyFocusedNavIndex < 0 && headerFocusedNavIndex < 0) {
        return null;
      }
      let button;
      if (stickyFocusedItemIndex >= 0) {
        button = tableHeadings[stickyFocusedItemIndex].querySelector("button");
      } else if (tableFocusedItemIndex >= 0) {
        button = stickyHeadings[tableFocusedItemIndex].querySelector("button");
      }
      if (stickyFocusedNavIndex >= 0) {
        button = arrowsInHeaderNav == null ? void 0 : arrowsInHeaderNav[stickyFocusedNavIndex];
      } else if (headerFocusedNavIndex >= 0) {
        button = arrowsInStickyNav == null ? void 0 : arrowsInStickyNav[headerFocusedNavIndex];
      }
      if (button == null) {
        return null;
      }
      button.style.visibility = "visible";
      button.focus();
      button.style.removeProperty("visibility");
    };
    this.calculateColumnVisibilityData = (condensed) => {
      const fixedFirstColumns = this.fixedFirstColumns();
      const {
        table: {
          current: table
        },
        scrollContainer: {
          current: scrollContainer
        },
        dataTable: {
          current: dataTable
        }
      } = this;
      const {
        stickyHeader
      } = this.props;
      if ((stickyHeader || condensed) && table && scrollContainer && dataTable) {
        const headerCells = table.querySelectorAll(headerCell.selector);
        const rightMostHeader = headerCells[fixedFirstColumns - 1];
        const nthColumnWidth = fixedFirstColumns ? rightMostHeader.offsetLeft + rightMostHeader.offsetWidth : 0;
        if (headerCells.length > 0) {
          const firstVisibleColumnIndex = headerCells.length - 1;
          const tableLeftVisibleEdge = scrollContainer.scrollLeft + nthColumnWidth;
          const tableRightVisibleEdge = scrollContainer.scrollLeft + dataTable.offsetWidth;
          const tableData = {
            firstVisibleColumnIndex,
            tableLeftVisibleEdge,
            tableRightVisibleEdge
          };
          const columnVisibilityData = [...headerCells].map(measureColumn(tableData));
          const lastColumn = columnVisibilityData[columnVisibilityData.length - 1];
          const isScrolledFarthestLeft = fixedFirstColumns ? tableLeftVisibleEdge === nthColumnWidth : tableLeftVisibleEdge === 0;
          return {
            columnVisibilityData,
            ...getPrevAndCurrentColumns(tableData, columnVisibilityData),
            isScrolledFarthestLeft,
            isScrolledFarthestRight: lastColumn.rightEdge <= tableRightVisibleEdge
          };
        }
      }
      return {
        columnVisibilityData: [],
        previousColumn: void 0,
        currentColumn: void 0
      };
    };
    this.handleHeaderButtonFocus = (event) => {
      var _a;
      const fixedFirstColumns = this.fixedFirstColumns();
      if (this.scrollContainer.current == null || event.target == null || this.state.columnVisibilityData.length === 0) {
        return;
      }
      const target = event.target;
      const currentCell = target.parentNode;
      const tableScrollLeft = this.scrollContainer.current.scrollLeft;
      const tableViewableWidth = this.scrollContainer.current.offsetWidth;
      const tableRightEdge = tableScrollLeft + tableViewableWidth;
      const nthColumnWidth = this.state.columnVisibilityData.length > 0 ? (_a = this.state.columnVisibilityData[fixedFirstColumns]) == null ? void 0 : _a.rightEdge : 0;
      const currentColumnLeftEdge = currentCell.offsetLeft;
      const currentColumnRightEdge = currentCell.offsetLeft + currentCell.offsetWidth;
      if (tableScrollLeft > currentColumnLeftEdge - nthColumnWidth) {
        this.scrollContainer.current.scrollLeft = currentColumnLeftEdge - nthColumnWidth;
      }
      if (currentColumnRightEdge > tableRightEdge) {
        this.scrollContainer.current.scrollLeft = currentColumnRightEdge - tableViewableWidth;
      }
    };
    this.stickyHeaderScrolling = () => {
      const {
        current: stickyTable
      } = this.stickyTable;
      const {
        current: scrollContainer
      } = this.scrollContainer;
      if (stickyTable == null || scrollContainer == null) {
        return;
      }
      stickyTable.scrollLeft = scrollContainer.scrollLeft;
    };
    this.scrollListener = () => {
      var _a;
      if (this.scrollStopTimer) {
        clearTimeout(this.scrollStopTimer);
      }
      this.scrollStopTimer = setTimeout(() => {
        this.setState((prevState) => ({
          ...this.calculateColumnVisibilityData(prevState.condensed)
        }));
      }, 100);
      this.setState({
        isScrolledFarthestLeft: ((_a = this.scrollContainer.current) == null ? void 0 : _a.scrollLeft) === 0
      });
      if (this.props.stickyHeader && this.stickyHeaderActive) {
        this.stickyHeaderScrolling();
      }
    };
    this.handleHover = (row) => () => {
      this.setState({
        rowHovered: row
      });
    };
    this.handleFocus = (event) => {
      var _a;
      const fixedFirstColumns = this.fixedFirstColumns();
      if (this.scrollContainer.current == null || event.target == null) {
        return;
      }
      const currentCell = event.target.parentNode;
      const fixedNthColumn = this.props;
      const nthColumnWidth = fixedNthColumn ? (_a = this.state.columnVisibilityData[fixedFirstColumns]) == null ? void 0 : _a.rightEdge : 0;
      const currentColumnLeftEdge = currentCell.offsetLeft;
      const desiredScrollLeft = currentColumnLeftEdge - nthColumnWidth;
      if (this.scrollContainer.current.scrollLeft > desiredScrollLeft) {
        this.scrollContainer.current.scrollLeft = desiredScrollLeft;
      }
    };
    this.navigateTable = (direction) => {
      var _a;
      const fixedFirstColumns = this.fixedFirstColumns();
      const {
        currentColumn,
        previousColumn
      } = this.state;
      const nthColumnWidth = (_a = this.state.columnVisibilityData[fixedFirstColumns - 1]) == null ? void 0 : _a.rightEdge;
      if (!currentColumn || !previousColumn) {
        return;
      }
      let prevWidths = 0;
      for (let index = 0; index < currentColumn.index; index++) {
        prevWidths += this.state.columnVisibilityData[index].width;
      }
      const {
        current: scrollContainer
      } = this.scrollContainer;
      const handleScroll = () => {
        let newScrollLeft = 0;
        if (fixedFirstColumns) {
          newScrollLeft = direction === "right" ? prevWidths - nthColumnWidth + currentColumn.width : prevWidths - previousColumn.width - nthColumnWidth;
        } else {
          newScrollLeft = direction === "right" ? currentColumn.rightEdge : previousColumn.leftEdge;
        }
        if (scrollContainer) {
          scrollContainer.scrollLeft = newScrollLeft;
          requestAnimationFrame(() => {
            this.setState((prevState) => ({
              ...this.calculateColumnVisibilityData(prevState.condensed)
            }));
          });
        }
      };
      return handleScroll;
    };
    this.renderHeading = ({
      heading,
      headingIndex,
      inFixedNthColumn,
      inStickyHeader
    }) => {
      var _a;
      const {
        sortable,
        truncate = false,
        columnContentTypes,
        defaultSortDirection,
        initialSortColumnIndex = 0,
        verticalAlign,
        firstColumnMinWidth
      } = this.props;
      const fixedFirstColumns = this.fixedFirstColumns();
      const {
        sortDirection = defaultSortDirection,
        sortedColumnIndex = initialSortColumnIndex,
        isScrolledFarthestLeft
      } = this.state;
      let sortableHeadingProps;
      const headingCellId = `heading-cell-${headingIndex}`;
      const stickyHeaderId = `stickyheader-${headingIndex}`;
      const id = inStickyHeader ? stickyHeaderId : headingCellId;
      if (sortable) {
        const isSortable = sortable[headingIndex];
        const isSorted = isSortable && sortedColumnIndex === headingIndex;
        const direction = isSorted ? sortDirection : "none";
        sortableHeadingProps = {
          defaultSortDirection,
          sorted: isSorted,
          sortable: isSortable,
          sortDirection: direction,
          onSort: this.defaultOnSort(headingIndex),
          fixedNthColumn: fixedFirstColumns,
          inFixedNthColumn: fixedFirstColumns
        };
      }
      const stickyCellWidth = inStickyHeader ? this.tableHeadingWidths[headingIndex] : void 0;
      const fixedCellVisible = !isScrolledFarthestLeft;
      const cellProps = {
        header: true,
        stickyHeadingCell: inStickyHeader,
        content: heading,
        contentType: columnContentTypes[headingIndex],
        nthColumn: headingIndex < fixedFirstColumns,
        fixedFirstColumns,
        truncate,
        headingIndex,
        ...sortableHeadingProps,
        verticalAlign,
        handleFocus: this.handleFocus,
        stickyCellWidth,
        fixedCellVisible,
        firstColumnMinWidth
      };
      if (inFixedNthColumn && inStickyHeader) {
        return [/* @__PURE__ */ React.createElement(Cell$1, Object.assign({
          key: id
        }, cellProps, {
          setRef: (ref) => {
            this.setCellRef({
              ref,
              index: headingIndex,
              inStickyHeader
            });
          },
          inFixedNthColumn: false
        })), /* @__PURE__ */ React.createElement(Cell$1, Object.assign({
          key: `${id}-sticky`
        }, cellProps, {
          setRef: (ref) => {
            this.setCellRef({
              ref,
              index: headingIndex,
              inStickyHeader
            });
          },
          inFixedNthColumn: Boolean(fixedFirstColumns),
          lastFixedFirstColumn: headingIndex === fixedFirstColumns - 1,
          style: {
            left: (_a = this.state.columnVisibilityData[headingIndex]) == null ? void 0 : _a.leftEdge
          }
        }))];
      }
      return /* @__PURE__ */ React.createElement(Cell$1, Object.assign({
        key: id
      }, cellProps, {
        setRef: (ref) => {
          this.setCellRef({
            ref,
            index: headingIndex,
            inStickyHeader
          });
        },
        lastFixedFirstColumn: headingIndex === fixedFirstColumns - 1,
        inFixedNthColumn
      }));
    };
    this.totalsRowHeading = () => {
      const {
        i18n,
        totals,
        totalsName
      } = this.props;
      const totalsLabel = totalsName ? totalsName : {
        singular: i18n.translate("Polaris.DataTable.totalRowHeading"),
        plural: i18n.translate("Polaris.DataTable.totalsRowHeading")
      };
      return totals && totals.filter((total) => total !== "").length > 1 ? totalsLabel.plural : totalsLabel.singular;
    };
    this.renderTotals = ({
      total,
      index
    }) => {
      const fixedFirstColumns = this.fixedFirstColumns();
      const id = `totals-cell-${index}`;
      const {
        truncate = false,
        verticalAlign,
        columnContentTypes
      } = this.props;
      let content;
      let contentType;
      if (index === 0) {
        content = this.totalsRowHeading();
      }
      if (total !== "" && index > 0) {
        contentType = columnContentTypes[index];
        content = total;
      }
      const totalInFooter = this.props.showTotalsInFooter;
      return /* @__PURE__ */ React.createElement(Cell$1, {
        total: true,
        totalInFooter,
        nthColumn: index <= fixedFirstColumns - 1,
        firstColumn: index === 0,
        key: id,
        content,
        contentType,
        truncate,
        verticalAlign
      });
    };
    this.getColSpan = (rowLength, headingsLength, contentTypesLength, cellIndex) => {
      const fixedFirstColumns = this.fixedFirstColumns();
      if (fixedFirstColumns) {
        return 1;
      }
      const rowLen = rowLength ? rowLength : 1;
      const colLen = headingsLength ? headingsLength : contentTypesLength;
      const colSpan = Math.floor(colLen / rowLen);
      const remainder = colLen % rowLen;
      return cellIndex === 0 ? colSpan + remainder : colSpan;
    };
    this.defaultRenderRow = ({
      row,
      index,
      inFixedNthColumn,
      rowHeights
    }) => {
      const {
        columnContentTypes,
        truncate = false,
        verticalAlign,
        hoverable = true,
        headings
      } = this.props;
      const {
        condensed
      } = this.state;
      const fixedFirstColumns = this.fixedFirstColumns();
      const className = classNames(styles$h.TableRow, hoverable && styles$h.hoverable);
      return /* @__PURE__ */ React.createElement("tr", {
        key: `row-${index}`,
        className,
        onMouseEnter: this.handleHover(index),
        onMouseLeave: this.handleHover()
      }, row.map((content, cellIndex) => {
        const hovered = index === this.state.rowHovered;
        const id = `cell-${cellIndex}-row-${index}`;
        const colSpan = this.getColSpan(row.length, headings.length, columnContentTypes.length, cellIndex);
        return /* @__PURE__ */ React.createElement(Cell$1, {
          key: id,
          content,
          contentType: columnContentTypes[cellIndex],
          nthColumn: cellIndex <= fixedFirstColumns - 1,
          firstColumn: cellIndex === 0,
          truncate,
          verticalAlign,
          colSpan,
          hovered,
          style: rowHeights ? {
            height: `${rowHeights[index]}px`
          } : {},
          inFixedNthColumn: condensed && inFixedNthColumn
        });
      }));
    };
    this.defaultOnSort = (headingIndex) => {
      const {
        onSort,
        defaultSortDirection = "ascending",
        initialSortColumnIndex
      } = this.props;
      const {
        sortDirection = defaultSortDirection,
        sortedColumnIndex = initialSortColumnIndex
      } = this.state;
      let newSortDirection = defaultSortDirection;
      if (sortedColumnIndex === headingIndex) {
        newSortDirection = sortDirection === "ascending" ? "descending" : "ascending";
      }
      const handleSort = () => {
        this.setState({
          sortDirection: newSortDirection,
          sortedColumnIndex: headingIndex
        }, () => {
          if (onSort) {
            onSort(headingIndex, newSortDirection);
          }
        });
      };
      return handleSort;
    };
  }
  componentDidMount() {
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        this.handleResize();
      }, 10);
    } else {
      this.handleResize();
    }
  }
  componentDidUpdate(prevProps) {
    if (isEqual(prevProps, this.props)) {
      return;
    }
    this.handleResize();
  }
  componentWillUnmount() {
    this.handleResize.cancel();
  }
  render() {
    var _a, _b, _c;
    const {
      headings,
      totals,
      showTotalsInFooter,
      rows,
      footerContent,
      hideScrollIndicator = false,
      increasedTableDensity = false,
      hasZebraStripingOnData = false,
      stickyHeader = false,
      hasFixedFirstColumn: fixedFirstColumn = false,
      pagination
    } = this.props;
    const {
      condensed,
      columnVisibilityData,
      isScrolledFarthestLeft,
      isScrolledFarthestRight
    } = this.state;
    if (fixedFirstColumn && process.env.NODE_ENV === "development") {
      console.warn("Deprecation: The `hasFixedFirstColumn` prop on the `DataTable` has been deprecated. Use fixedFirstColumns={n} instead.");
    }
    const fixedFirstColumns = this.fixedFirstColumns();
    const rowCountIsEven = rows.length % 2 === 0;
    const className = classNames(styles$h.DataTable, condensed && styles$h.condensed, totals && styles$h.ShowTotals, showTotalsInFooter && styles$h.ShowTotalsInFooter, hasZebraStripingOnData && styles$h.ZebraStripingOnData, hasZebraStripingOnData && rowCountIsEven && styles$h.RowCountIsEven);
    const wrapperClassName = classNames(styles$h.TableWrapper, condensed && styles$h.condensed, increasedTableDensity && styles$h.IncreasedTableDensity, stickyHeader && styles$h.StickyHeaderEnabled);
    const headingMarkup = /* @__PURE__ */ React.createElement("tr", null, headings.map((heading, index) => this.renderHeading({
      heading,
      headingIndex: index,
      inFixedNthColumn: false,
      inStickyHeader: false
    })));
    const totalsMarkup = totals ? /* @__PURE__ */ React.createElement("tr", null, totals.map((total, index) => this.renderTotals({
      total,
      index
    }))) : null;
    const nthColumns = rows.map((row) => row.slice(0, fixedFirstColumns));
    const nthHeadings = headings.slice(0, fixedFirstColumns);
    const nthTotals = totals == null ? void 0 : totals.slice(0, fixedFirstColumns);
    const tableHeaderRows = (_a = this.table.current) == null ? void 0 : _a.children[0].childNodes;
    const tableBodyRows = (_b = this.table.current) == null ? void 0 : _b.children[1].childNodes;
    const headerRowHeights = getRowClientHeights(tableHeaderRows);
    const bodyRowHeights = getRowClientHeights(tableBodyRows);
    const fixedNthColumnMarkup = condensed && fixedFirstColumns !== 0 && /* @__PURE__ */ React.createElement("table", {
      className: classNames(styles$h.FixedFirstColumn, !isScrolledFarthestLeft && styles$h.separate),
      style: {
        width: `${(_c = columnVisibilityData[fixedFirstColumns - 1]) == null ? void 0 : _c.rightEdge}px`
      }
    }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", {
      style: {
        height: `${headerRowHeights[0]}px`
      }
    }, nthHeadings.map((heading, index) => this.renderHeading({
      heading,
      headingIndex: index,
      inFixedNthColumn: true,
      inStickyHeader: false
    }))), totals && !showTotalsInFooter && /* @__PURE__ */ React.createElement("tr", {
      style: {
        height: `${headerRowHeights[1]}px`
      }
    }, nthTotals == null ? void 0 : nthTotals.map((total, index) => this.renderTotals({
      total,
      index
    })))), /* @__PURE__ */ React.createElement("tbody", null, nthColumns.map((row, index) => this.defaultRenderRow({
      row,
      index,
      inFixedNthColumn: true,
      rowHeights: bodyRowHeights
    }))), totals && showTotalsInFooter && /* @__PURE__ */ React.createElement("tfoot", null, /* @__PURE__ */ React.createElement("tr", null, nthTotals == null ? void 0 : nthTotals.map((total, index) => this.renderTotals({
      total,
      index
    })))));
    const bodyMarkup = rows.map((row, index) => this.defaultRenderRow({
      row,
      index,
      inFixedNthColumn: false
    }));
    const footerMarkup = footerContent ? /* @__PURE__ */ React.createElement("div", {
      className: styles$h.Footer
    }, footerContent) : null;
    const paginationMarkup = pagination ? /* @__PURE__ */ React.createElement(Pagination, Object.assign({
      type: "table"
    }, pagination)) : null;
    const headerTotalsMarkup = !showTotalsInFooter ? totalsMarkup : null;
    const footerTotalsMarkup = showTotalsInFooter ? /* @__PURE__ */ React.createElement("tfoot", null, totalsMarkup) : null;
    const navigationMarkup = (location) => hideScrollIndicator ? null : /* @__PURE__ */ React.createElement(Navigation, {
      columnVisibilityData,
      isScrolledFarthestLeft,
      isScrolledFarthestRight,
      navigateTableLeft: this.navigateTable("left"),
      navigateTableRight: this.navigateTable("right"),
      fixedFirstColumns,
      setRef: (ref) => {
        if (location === "header") {
          this.headerNav = ref;
        } else if (location === "sticky") {
          this.stickyNav = ref;
        }
      }
    });
    const stickyHeaderMarkup = stickyHeader ? /* @__PURE__ */ React.createElement(AfterInitialMount, null, /* @__PURE__ */ React.createElement("div", {
      className: styles$h.StickyHeaderWrapper,
      role: "presentation"
    }, /* @__PURE__ */ React.createElement(Sticky, {
      boundingElement: this.dataTable.current,
      onStickyChange: (isSticky) => {
        this.changeHeadingFocus();
        this.stickyHeaderActive = isSticky;
      }
    }, (isSticky) => {
      const stickyHeaderInnerClassNames = classNames(styles$h.StickyHeaderInner, isSticky && styles$h["StickyHeaderInner-isSticky"]);
      const stickyHeaderTableClassNames = classNames(styles$h.StickyHeaderTable, !isScrolledFarthestLeft && styles$h.separate);
      return /* @__PURE__ */ React.createElement("div", {
        className: stickyHeaderInnerClassNames
      }, /* @__PURE__ */ React.createElement("div", null, navigationMarkup("sticky")), /* @__PURE__ */ React.createElement("table", {
        className: stickyHeaderTableClassNames,
        ref: this.stickyTable
      }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", {
        className: styles$h.StickyTableHeadingsRow
      }, headings.map((heading, index) => {
        return this.renderHeading({
          heading,
          headingIndex: index,
          inFixedNthColumn: Boolean(index <= fixedFirstColumns - 1 && fixedFirstColumns),
          inStickyHeader: true
        });
      })))));
    }))) : null;
    return /* @__PURE__ */ React.createElement("div", {
      className: wrapperClassName,
      ref: this.dataTable
    }, stickyHeaderMarkup, navigationMarkup("header"), /* @__PURE__ */ React.createElement("div", {
      className
    }, /* @__PURE__ */ React.createElement("div", {
      className: styles$h.ScrollContainer,
      ref: this.scrollContainer
    }, /* @__PURE__ */ React.createElement(EventListener, {
      event: "resize",
      handler: this.handleResize
    }), /* @__PURE__ */ React.createElement(EventListener, {
      capture: true,
      passive: true,
      event: "scroll",
      handler: this.scrollListener
    }), fixedNthColumnMarkup, /* @__PURE__ */ React.createElement("table", {
      className: styles$h.Table,
      ref: this.table
    }, /* @__PURE__ */ React.createElement("thead", null, headingMarkup, headerTotalsMarkup), /* @__PURE__ */ React.createElement("tbody", null, bodyMarkup), footerTotalsMarkup)), paginationMarkup, footerMarkup));
  }
  fixedFirstColumns() {
    const {
      hasFixedFirstColumn,
      fixedFirstColumns = 0,
      headings
    } = this.props;
    const numberOfFixedFirstColumns = hasFixedFirstColumn && !fixedFirstColumns ? 1 : fixedFirstColumns;
    if (numberOfFixedFirstColumns >= headings.length) {
      return 0;
    }
    return numberOfFixedFirstColumns;
  }
}
function DataTable(props) {
  const i18n = useI18n();
  return /* @__PURE__ */ React.createElement(DataTableInner, Object.assign({}, props, {
    i18n
  }));
}
var styles$f = {
  "Divider": "Polaris-Divider"
};
const Divider = ({
  borderColor = "border-secondary",
  borderWidth = "025"
}) => {
  const borderColorValue = borderColor === "transparent" ? borderColor : `var(--p-color-${borderColor})`;
  return /* @__PURE__ */ React.createElement("hr", {
    className: styles$f.Divider,
    style: {
      borderBlockStart: `var(--p-border-width-${borderWidth}) solid ${borderColorValue}`
    }
  });
};
var img = "data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e";
var emptySearch = img;
function EmptySearchResult({
  title,
  description,
  withIllustration
}) {
  const i18n = useI18n();
  const altText = i18n.translate("Polaris.EmptySearchResult.altText");
  const descriptionMarkup = description ? /* @__PURE__ */ React.createElement("p", null, description) : null;
  const illustrationMarkup = withIllustration ? /* @__PURE__ */ React.createElement(Image, {
    alt: altText,
    source: emptySearch,
    draggable: false
  }) : null;
  return /* @__PURE__ */ React.createElement(LegacyStack, {
    alignment: "center",
    vertical: true
  }, illustrationMarkup, /* @__PURE__ */ React.createElement(Text, {
    variant: "headingLg",
    as: "p"
  }, title), /* @__PURE__ */ React.createElement(Text, {
    tone: "subdued",
    as: "span"
  }, descriptionMarkup));
}
const Focus = /* @__PURE__ */ memo(function Focus2({
  children,
  disabled,
  root
}) {
  useEffect(() => {
    if (disabled || !root) {
      return;
    }
    const node = isRef$1(root) ? root.current : root;
    if (!node || node.querySelector("[autofocus]")) {
      return;
    }
    focusFirstFocusableNode(node, false);
  }, [disabled, root]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, children);
});
function isRef$1(ref) {
  return ref.current !== void 0;
}
var styles$e = {
  "Item": "Polaris-FormLayout__Item",
  "grouped": "Polaris-FormLayout--grouped",
  "condensed": "Polaris-FormLayout--condensed"
};
function Item$1({
  children,
  condensed = false
}) {
  const className = classNames(styles$e.Item, condensed ? styles$e.condensed : styles$e.grouped);
  return children ? /* @__PURE__ */ React.createElement("div", {
    className
  }, children) : null;
}
function Group({
  children,
  condensed,
  title,
  helpText
}) {
  const id = useId();
  let helpTextElement = null;
  let helpTextId;
  let titleElement = null;
  let titleId;
  if (helpText) {
    helpTextId = `${id}HelpText`;
    helpTextElement = /* @__PURE__ */ React.createElement(Box, {
      id: helpTextId,
      color: "text-secondary"
    }, helpText);
  }
  if (title) {
    titleId = `${id}Title`;
    titleElement = /* @__PURE__ */ React.createElement(Text, {
      id: titleId,
      as: "p"
    }, title);
  }
  const itemsMarkup = Children.map(children, (child) => wrapWithComponent(child, Item$1, {
    condensed
  }));
  return /* @__PURE__ */ React.createElement(BlockStack, {
    role: "group",
    gap: "200",
    "aria-labelledby": titleId,
    "aria-describedby": helpTextId
  }, titleElement, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "300"
  }, itemsMarkup), helpTextElement);
}
const FormLayout = /* @__PURE__ */ memo(function FormLayout2({
  children
}) {
  return /* @__PURE__ */ React.createElement(BlockStack, {
    gap: "400"
  }, Children.map(children, wrapChildren));
});
FormLayout.Group = Group;
function wrapChildren(child, index) {
  if (isElementOfType(child, Group)) {
    return child;
  }
  const props = {
    key: index
  };
  return wrapWithComponent(child, Item$1, props);
}
function setRootProperty(name, value, node) {
  if (!document) return;
  const element = document.documentElement;
  element.style.setProperty(name, value);
}
function useMediaQuery() {
  const mediaQuery = useContext(MediaQueryContext);
  if (!mediaQuery) {
    throw new Error("No mediaQuery was provided. Your application must be wrapped in an <AppProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return mediaQuery;
}
var styles$d = {
  "Body": "Polaris-Modal__Body",
  "NoScrollBody": "Polaris-Modal__NoScrollBody",
  "IFrame": "Polaris-Modal__IFrame"
};
var styles$c = {
  "Section": "Polaris-Modal-Section",
  "titleHidden": "Polaris-Modal-Section--titleHidden"
};
function Section$1({
  children,
  flush = false,
  subdued = false,
  titleHidden = false
}) {
  const className = classNames(styles$c.Section, titleHidden && styles$c.titleHidden);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement(Box, Object.assign({
    as: "section",
    padding: flush ? "0" : "400"
  }, titleHidden && {
    paddingInlineEnd: "0"
  }, subdued && {
    background: "bg-surface-tertiary"
  }), children));
}
var styles$b = {
  "Container": "Polaris-Modal-Dialog__Container",
  "Dialog": "Polaris-Modal-Dialog",
  "Modal": "Polaris-Modal-Dialog__Modal",
  "limitHeight": "Polaris-Modal-Dialog--limitHeight",
  "sizeSmall": "Polaris-Modal-Dialog--sizeSmall",
  "sizeLarge": "Polaris-Modal-Dialog--sizeLarge",
  "sizeFullScreen": "Polaris-Modal-Dialog--sizeFullScreen",
  "animateFadeUp": "Polaris-Modal-Dialog--animateFadeUp",
  "entering": "Polaris-Modal-Dialog--entering",
  "exiting": "Polaris-Modal-Dialog--exiting",
  "exited": "Polaris-Modal-Dialog--exited",
  "entered": "Polaris-Modal-Dialog--entered"
};
function useFocusManager({
  trapping
}) {
  const focusManager = useContext(FocusManagerContext);
  const id = useId();
  if (!focusManager) {
    throw new MissingAppProviderError("No FocusManager was provided.");
  }
  const {
    trapFocusList,
    add: addFocusItem,
    remove: removeFocusItem
  } = focusManager;
  const canSafelyFocus = trapFocusList[0] === id;
  const value = useMemo(() => ({
    canSafelyFocus
  }), [canSafelyFocus]);
  useEffect(() => {
    if (!trapping) return;
    addFocusItem(id);
    return () => {
      removeFocusItem(id);
    };
  }, [addFocusItem, id, removeFocusItem, trapping]);
  return value;
}
function TrapFocus({
  trapping = true,
  children
}) {
  const {
    canSafelyFocus
  } = useFocusManager({
    trapping
  });
  const focusTrapWrapper = useRef(null);
  const [disableFocus, setDisableFocus] = useState(true);
  useEffect(() => {
    const disable = canSafelyFocus && !(focusTrapWrapper.current && focusTrapWrapper.current.contains(document.activeElement)) ? !trapping : true;
    setDisableFocus(disable);
  }, [canSafelyFocus, trapping]);
  const handleFocusIn = (event) => {
    const containerContentsHaveFocus = focusTrapWrapper.current && focusTrapWrapper.current.contains(document.activeElement);
    if (trapping === false || !focusTrapWrapper.current || containerContentsHaveFocus || event.target instanceof Element && event.target.matches(`${portal.selector} *`)) {
      return;
    }
    if (canSafelyFocus && event.target instanceof HTMLElement && focusTrapWrapper.current !== event.target && !focusTrapWrapper.current.contains(event.target)) {
      focusFirstFocusableNode(focusTrapWrapper.current);
    }
  };
  const handleTab = (event) => {
    if (trapping === false || !focusTrapWrapper.current) {
      return;
    }
    const firstFocusableNode = findFirstKeyboardFocusableNode(focusTrapWrapper.current);
    const lastFocusableNode = findLastKeyboardFocusableNode(focusTrapWrapper.current);
    if (event.target === lastFocusableNode && !event.shiftKey) {
      event.preventDefault();
      focusFirstKeyboardFocusableNode(focusTrapWrapper.current);
    }
    if (event.target === firstFocusableNode && event.shiftKey) {
      event.preventDefault();
      focusLastKeyboardFocusableNode(focusTrapWrapper.current);
    }
  };
  return /* @__PURE__ */ React.createElement(Focus, {
    disabled: disableFocus,
    root: focusTrapWrapper.current
  }, /* @__PURE__ */ React.createElement("div", {
    ref: focusTrapWrapper
  }, /* @__PURE__ */ React.createElement(EventListener, {
    event: "focusin",
    handler: handleFocusIn
  }), /* @__PURE__ */ React.createElement(KeypressListener, {
    keyCode: Key.Tab,
    keyEvent: "keydown",
    handler: handleTab
  }), children));
}
function Dialog({
  instant,
  labelledBy,
  children,
  limitHeight,
  size,
  onClose,
  onExited,
  onEntered,
  setClosing,
  hasToasts,
  ...props
}) {
  const theme = useTheme();
  const containerNode = useRef(null);
  const frameContext = useContext(FrameContext);
  let toastMessages;
  if (frameContext) {
    toastMessages = frameContext.toastMessages;
  }
  const classes = classNames(styles$b.Modal, size && styles$b[variationName("size", size)], limitHeight && styles$b.limitHeight);
  const TransitionChild = instant ? Transition : FadeUp;
  useEffect(() => {
    containerNode.current && !containerNode.current.contains(document.activeElement) && focusFirstFocusableNode(containerNode.current);
  }, []);
  const handleKeyDown = () => {
    if (setClosing) {
      setClosing(true);
    }
  };
  const handleKeyUp = () => {
    if (setClosing) {
      setClosing(false);
    }
    onClose();
  };
  const ariaLiveAnnouncements = /* @__PURE__ */ React.createElement("div", {
    "aria-live": "assertive"
  }, toastMessages ? toastMessages.map((toastMessage) => /* @__PURE__ */ React.createElement(Text, {
    visuallyHidden: true,
    as: "p",
    key: toastMessage.id
  }, toastMessage.content)) : null);
  return /* @__PURE__ */ React.createElement(TransitionChild, Object.assign({}, props, {
    nodeRef: containerNode,
    mountOnEnter: true,
    unmountOnExit: true,
    timeout: parseInt(theme.motion["motion-duration-200"], 10),
    onEntered,
    onExited
  }), /* @__PURE__ */ React.createElement("div", {
    className: styles$b.Container,
    "data-polaris-layer": true,
    "data-polaris-overlay": true,
    ref: containerNode
  }, /* @__PURE__ */ React.createElement(TrapFocus, null, /* @__PURE__ */ React.createElement("div", {
    role: "dialog",
    "aria-modal": true,
    "aria-label": labelledBy,
    "aria-labelledby": labelledBy,
    tabIndex: -1,
    className: styles$b.Dialog
  }, /* @__PURE__ */ React.createElement("div", {
    className: classes
  }, /* @__PURE__ */ React.createElement(KeypressListener, {
    keyCode: Key.Escape,
    keyEvent: "keydown",
    handler: handleKeyDown
  }), /* @__PURE__ */ React.createElement(KeypressListener, {
    keyCode: Key.Escape,
    handler: handleKeyUp
  }), children), ariaLiveAnnouncements))));
}
const fadeUpClasses = {
  appear: classNames(styles$b.animateFadeUp, styles$b.entering),
  appearActive: classNames(styles$b.animateFadeUp, styles$b.entered),
  enter: classNames(styles$b.animateFadeUp, styles$b.entering),
  enterActive: classNames(styles$b.animateFadeUp, styles$b.entered),
  exit: classNames(styles$b.animateFadeUp, styles$b.exiting),
  exitActive: classNames(styles$b.animateFadeUp, styles$b.exited)
};
function FadeUp({
  children,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(CSSTransition, Object.assign({}, props, {
    classNames: fadeUpClasses
  }), children);
}
function CloseButton({
  pressed,
  onClick
}) {
  const i18n = useI18n();
  return /* @__PURE__ */ React.createElement(Button, {
    variant: "tertiary",
    pressed,
    icon: XIcon,
    onClick,
    accessibilityLabel: i18n.translate("Polaris.Common.close")
  });
}
function Header$1({
  id,
  children,
  closing,
  titleHidden,
  onClose
}) {
  const headerPaddingInline = "400";
  const headerPaddingBlock = "400";
  if (titleHidden || !children) {
    return /* @__PURE__ */ React.createElement(Box, {
      position: "absolute",
      insetInlineEnd: headerPaddingInline,
      insetBlockStart: headerPaddingBlock,
      zIndex: "1"
    }, /* @__PURE__ */ React.createElement(CloseButton, {
      onClick: onClose
    }));
  }
  return /* @__PURE__ */ React.createElement(Box, {
    paddingBlockStart: "400",
    paddingBlockEnd: "400",
    paddingInlineStart: headerPaddingInline,
    paddingInlineEnd: headerPaddingInline,
    borderBlockEndWidth: "025",
    borderColor: "border",
    background: "bg-surface-tertiary"
  }, /* @__PURE__ */ React.createElement(InlineGrid, {
    columns: {
      xs: "1fr auto"
    },
    gap: "400"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400",
    blockAlign: "center"
  }, /* @__PURE__ */ React.createElement(Text, {
    id,
    as: "h2",
    variant: "headingMd",
    breakWord: true
  }, children)), /* @__PURE__ */ React.createElement(CloseButton, {
    pressed: closing,
    onClick: onClose
  })));
}
function Footer({
  primaryAction,
  secondaryActions,
  children
}) {
  const primaryActionButton = primaryAction && buttonsFrom(primaryAction, {
    variant: "primary"
  }) || null;
  const secondaryActionButtons = secondaryActions && buttonsFrom(secondaryActions) || null;
  const actions = primaryActionButton || secondaryActionButtons ? /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "200"
  }, secondaryActionButtons, primaryActionButton) : null;
  return /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400",
    blockAlign: "center"
  }, /* @__PURE__ */ React.createElement(Box, {
    borderColor: "border",
    borderBlockStartWidth: "025",
    padding: "400",
    width: "100%"
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400",
    blockAlign: "center",
    align: "space-between"
  }, /* @__PURE__ */ React.createElement(Box, null, children), actions)));
}
const IFRAME_LOADING_HEIGHT = 200;
const DEFAULT_IFRAME_CONTENT_HEIGHT = 400;
const Modal = function Modal2({
  children,
  title,
  titleHidden = false,
  src,
  iFrameName,
  open,
  instant,
  sectioned,
  loading,
  size,
  limitHeight,
  footer,
  primaryAction,
  secondaryActions,
  onScrolledToBottom,
  activator,
  activatorWrapper = "div",
  onClose,
  onIFrameLoad,
  onTransitionEnd,
  noScroll
}) {
  const [iframeHeight, setIframeHeight] = useState(IFRAME_LOADING_HEIGHT);
  const [closing, setClosing] = useState(false);
  const headerId = useId();
  const activatorRef = useRef(null);
  const i18n = useI18n();
  const iframeTitle = i18n.translate("Polaris.Modal.iFrameTitle");
  let dialog;
  let backdrop;
  const handleEntered = useCallback(() => {
    if (onTransitionEnd) {
      onTransitionEnd();
    }
  }, [onTransitionEnd]);
  const handleExited = useCallback(() => {
    setIframeHeight(IFRAME_LOADING_HEIGHT);
    const activatorElement = activator && isRef(activator) ? activator && activator.current : activatorRef.current;
    if (activatorElement) {
      requestAnimationFrame(() => focusFirstFocusableNode(activatorElement));
    }
  }, [activator]);
  const handleIFrameLoad = useCallback((evt) => {
    const iframe = evt.target;
    if (iframe && iframe.contentWindow) {
      try {
        setIframeHeight(iframe.contentWindow.document.body.scrollHeight);
      } catch (_error) {
        setIframeHeight(DEFAULT_IFRAME_CONTENT_HEIGHT);
      }
    }
    if (onIFrameLoad != null) {
      onIFrameLoad(evt);
    }
  }, [onIFrameLoad]);
  if (open) {
    const footerMarkup = !footer && !primaryAction && !secondaryActions ? null : /* @__PURE__ */ React.createElement(Footer, {
      primaryAction,
      secondaryActions
    }, footer);
    const content = sectioned ? wrapWithComponent(children, Section$1, {
      titleHidden
    }) : children;
    const body = loading ? /* @__PURE__ */ React.createElement(Box, {
      padding: "400"
    }, /* @__PURE__ */ React.createElement(InlineStack, {
      gap: "400",
      align: "center",
      blockAlign: "center"
    }, /* @__PURE__ */ React.createElement(Spinner$1, null))) : content;
    const scrollContainerMarkup = noScroll ? /* @__PURE__ */ React.createElement("div", {
      className: styles$d.NoScrollBody
    }, /* @__PURE__ */ React.createElement(Box, {
      width: "100%",
      overflowX: "hidden",
      overflowY: "hidden"
    }, body)) : /* @__PURE__ */ React.createElement(Scrollable, {
      shadow: true,
      className: styles$d.Body,
      onScrolledToBottom
    }, body);
    const bodyMarkup = src ? /* @__PURE__ */ React.createElement("iframe", {
      name: iFrameName,
      title: iframeTitle,
      src,
      className: styles$d.IFrame,
      onLoad: handleIFrameLoad,
      style: {
        height: `${iframeHeight}px`
      }
    }) : scrollContainerMarkup;
    dialog = /* @__PURE__ */ React.createElement(Dialog, {
      instant,
      labelledBy: headerId,
      onClose,
      onEntered: handleEntered,
      onExited: handleExited,
      size,
      limitHeight,
      setClosing
    }, /* @__PURE__ */ React.createElement(Header$1, {
      titleHidden,
      id: headerId,
      closing,
      onClose
    }, title), bodyMarkup, footerMarkup);
    backdrop = /* @__PURE__ */ React.createElement(Backdrop, {
      setClosing,
      onClick: onClose
    });
  }
  const animated = !instant;
  const activatorMarkup = activator && !isRef(activator) ? /* @__PURE__ */ React.createElement(Box, {
    ref: activatorRef,
    as: activatorWrapper
  }, activator) : null;
  return /* @__PURE__ */ React.createElement(WithinContentContext.Provider, {
    value: true
  }, activatorMarkup, /* @__PURE__ */ React.createElement(Portal, {
    idPrefix: "modal"
  }, /* @__PURE__ */ React.createElement(TransitionGroup, {
    appear: animated,
    enter: animated,
    exit: animated
  }, dialog), backdrop));
};
function isRef(ref) {
  return Object.prototype.hasOwnProperty.call(ref, "current");
}
Modal.Section = Section$1;
var styles$a = {
  "IndexTable": "Polaris-IndexTable",
  "IndexTableWrapper": "Polaris-IndexTable__IndexTableWrapper",
  "IndexTableWrapper-scrollBarHidden": "Polaris-IndexTable__IndexTableWrapper--scrollBarHidden",
  "IndexTableWrapperWithSelectAllActions": "Polaris-IndexTable__IndexTableWrapperWithSelectAllActions",
  "LoadingPanel": "Polaris-IndexTable__LoadingPanel",
  "LoadingPanelEntered": "Polaris-IndexTable__LoadingPanelEntered",
  "LoadingPanelRow": "Polaris-IndexTable__LoadingPanelRow",
  "LoadingPanelText": "Polaris-IndexTable__LoadingPanelText",
  "Table": "Polaris-IndexTable__Table",
  "Table-scrolling": "Polaris-IndexTable__Table--scrolling",
  "TableCell-first": "Polaris-IndexTable__TableCell--first",
  "StickyTable-scrolling": "Polaris-IndexTable__StickyTable--scrolling",
  "TableCell": "Polaris-IndexTable__TableCell",
  "TableHeading-first": "Polaris-IndexTable__TableHeading--first",
  "TableHeading-second": "Polaris-IndexTable__TableHeading--second",
  "Table-sticky": "Polaris-IndexTable__Table--sticky",
  "StickyTable": "Polaris-IndexTable__StickyTable",
  "Table-unselectable": "Polaris-IndexTable__Table--unselectable",
  "TableRow": "Polaris-IndexTable__TableRow",
  "TableRow-unclickable": "Polaris-IndexTable__TableRow--unclickable",
  "toneSuccess": "Polaris-IndexTable--toneSuccess",
  "TableRow-child": "Polaris-IndexTable__TableRow--child",
  "toneWarning": "Polaris-IndexTable--toneWarning",
  "toneCritical": "Polaris-IndexTable--toneCritical",
  "toneSubdued": "Polaris-IndexTable--toneSubdued",
  "TableRow-subheader": "Polaris-IndexTable__TableRow--subheader",
  "TableRow-selected": "Polaris-IndexTable__TableRow--selected",
  "TableRow-hovered": "Polaris-IndexTable__TableRow--hovered",
  "TableRow-disabled": "Polaris-IndexTable__TableRow--disabled",
  "ZebraStriping": "Polaris-IndexTable__ZebraStriping",
  "TableHeading": "Polaris-IndexTable__TableHeading",
  "TableHeading-flush": "Polaris-IndexTable__TableHeading--flush",
  "TableHeading-align-center": "Polaris-IndexTable--tableHeadingAlignCenter",
  "TableHeading-align-end": "Polaris-IndexTable--tableHeadingAlignEnd",
  "TableHeading-extra-padding-right": "Polaris-IndexTable--tableHeadingExtraPaddingRight",
  "TableHeading-sortable": "Polaris-IndexTable__TableHeading--sortable",
  "TableHeadingSortButton": "Polaris-IndexTable__TableHeadingSortButton",
  "TableHeadingSortIcon": "Polaris-IndexTable__TableHeadingSortIcon",
  "TableHeadingSortButton-heading-align-end": "Polaris-IndexTable--tableHeadingSortButtonHeadingAlignEnd",
  "TableHeadingSortButton-heading-align-end-currently-sorted": "Polaris-IndexTable--tableHeadingSortButtonHeadingAlignEndCurrentlySorted",
  "TableHeadingSortIcon-heading-align-end": "Polaris-IndexTable--tableHeadingSortIconHeadingAlignEnd",
  "TableHeadingSortButton-heading-align-end-previously-sorted": "Polaris-IndexTable--tableHeadingSortButtonHeadingAlignEndPreviouslySorted",
  "right-aligned-sort-button-slide-out": "Polaris-IndexTable--rightAlignedSortButtonSlideOut",
  "reveal-right-aligned-sort-button-icon": "Polaris-IndexTable--revealRightAlignedSortButtonIcon",
  "TableHeadingUnderline": "Polaris-IndexTable__TableHeadingUnderline",
  "TableHeadingTooltipUnderlinePlaceholder": "Polaris-IndexTable__TableHeadingTooltipUnderlinePlaceholder",
  "TableHeadingSortIcon-visible": "Polaris-IndexTable__TableHeadingSortIcon--visible",
  "TableHeadingSortSvg": "Polaris-IndexTable__TableHeadingSortSvg",
  "SortableTableHeadingWithCustomMarkup": "Polaris-IndexTable__SortableTableHeadingWithCustomMarkup",
  "SortableTableHeaderWrapper": "Polaris-IndexTable__SortableTableHeaderWrapper",
  "ColumnHeaderCheckboxWrapper": "Polaris-IndexTable__ColumnHeaderCheckboxWrapper",
  "FirstStickyHeaderElement": "Polaris-IndexTable__FirstStickyHeaderElement",
  "TableHeading-unselectable": "Polaris-IndexTable__TableHeading--unselectable",
  "TableCell-flush": "Polaris-IndexTable__TableCell--flush",
  "Table-sticky-scrolling": "Polaris-IndexTable--tableStickyScrolling",
  "StickyTableHeader-sticky-scrolling": "Polaris-IndexTable--stickyTableHeaderStickyScrolling",
  "TableHeading-last": "Polaris-IndexTable__TableHeading--last",
  "Table-sticky-last": "Polaris-IndexTable--tableStickyLast",
  "StickyTableHeader-sticky-last": "Polaris-IndexTable--stickyTableHeaderStickyLast",
  "Table-sortable": "Polaris-IndexTable__Table--sortable",
  "StickyTableHeader": "Polaris-IndexTable__StickyTableHeader",
  "StickyTableHeader-isSticky": "Polaris-IndexTable__StickyTableHeader--isSticky",
  "StickyTableHeadings": "Polaris-IndexTable__StickyTableHeadings",
  "StickyTableHeading-second": "Polaris-IndexTable__StickyTableHeading--second",
  "unselectable": "Polaris-IndexTable--unselectable",
  "StickyTableHeading-second-scrolling": "Polaris-IndexTable--stickyTableHeadingSecondScrolling",
  "ScrollLeft": "Polaris-IndexTable__ScrollLeft",
  "ScrollRight": "Polaris-IndexTable__ScrollRight",
  "ScrollRight-onboarding": "Polaris-IndexTable__ScrollRight--onboarding",
  "SelectAllActionsWrapper": "Polaris-IndexTable__SelectAllActionsWrapper",
  "SelectAllActionsWrapperWithPagination": "Polaris-IndexTable__SelectAllActionsWrapperWithPagination",
  "SelectAllActionsWrapperSticky": "Polaris-IndexTable__SelectAllActionsWrapperSticky",
  "SelectAllActionsWrapperAtEnd": "Polaris-IndexTable__SelectAllActionsWrapperAtEnd",
  "SelectAllActionsWrapperAtEndAppear": "Polaris-IndexTable__SelectAllActionsWrapperAtEndAppear",
  "BulkActionsWrapper": "Polaris-IndexTable__BulkActionsWrapper",
  "BulkActionsWrapperVisible": "Polaris-IndexTable__BulkActionsWrapperVisible",
  "PaginationWrapper": "Polaris-IndexTable__PaginationWrapper",
  "PaginationWrapperScrolledPastTop": "Polaris-IndexTable__PaginationWrapperScrolledPastTop",
  "ScrollBarContainer": "Polaris-IndexTable__ScrollBarContainer",
  "ScrollBarContainerWithPagination": "Polaris-IndexTable__ScrollBarContainerWithPagination",
  "ScrollBarContainerScrolledPastTop": "Polaris-IndexTable__ScrollBarContainerScrolledPastTop",
  "ScrollBarContainerWithSelectAllActions": "Polaris-IndexTable__ScrollBarContainerWithSelectAllActions",
  "ScrollBarContainerSelectAllActionsSticky": "Polaris-IndexTable__ScrollBarContainerSelectAllActionsSticky",
  "scrollBarContainerCondensed": "Polaris-IndexTable--scrollBarContainerCondensed",
  "scrollBarContainerHidden": "Polaris-IndexTable--scrollBarContainerHidden",
  "ScrollBar": "Polaris-IndexTable__ScrollBar",
  "disableTextSelection": "Polaris-IndexTable--disableTextSelection",
  "EmptySearchResultWrapper": "Polaris-IndexTable__EmptySearchResultWrapper",
  "condensedRow": "Polaris-IndexTable--condensedRow",
  "CondensedList": "Polaris-IndexTable__CondensedList",
  "HeaderWrapper": "Polaris-IndexTable__HeaderWrapper",
  "StickyTable-condensed": "Polaris-IndexTable__StickyTable--condensed",
  "StickyTableHeader-condensed": "Polaris-IndexTable__StickyTableHeader--condensed",
  "ScrollBarContent": "Polaris-IndexTable__ScrollBarContent"
};
const SELECT_ALL_ITEMS = "All";
let SelectionType = /* @__PURE__ */ (function(SelectionType2) {
  SelectionType2["All"] = "all";
  SelectionType2["Page"] = "page";
  SelectionType2["Multi"] = "multi";
  SelectionType2["Single"] = "single";
  SelectionType2["Range"] = "range";
  return SelectionType2;
})({});
const IndexContext = /* @__PURE__ */ createContext(void 0);
const IndexSelectionChangeContext = /* @__PURE__ */ createContext(void 0);
const IndexRowContext = /* @__PURE__ */ createContext(void 0);
function useIndexSelectionChange() {
  const onSelectionChange = useContext(IndexSelectionChangeContext);
  if (!onSelectionChange) {
    throw new Error(`Missing IndexProvider context`);
  }
  return onSelectionChange;
}
function useIndexRow() {
  const indexRow = useContext(IndexRowContext);
  if (!indexRow) {
    throw new Error(`Missing IndexProvider context`);
  }
  return indexRow;
}
function useIndexValue() {
  const index = useContext(IndexContext);
  if (!index) {
    throw new Error(`Missing IndexProvider context`);
  }
  return index;
}
function useBulkSelectionData({
  selectedItemsCount,
  itemCount,
  hasMoreItems,
  resourceName: passedResourceName,
  defaultPaginatedSelectAllText
}) {
  const i18n = useI18n();
  const selectable = Boolean(selectedItemsCount);
  const selectMode = selectedItemsCount === "All" || selectedItemsCount > 0;
  const defaultResourceName = {
    singular: i18n.translate("Polaris.IndexProvider.defaultItemSingular"),
    plural: i18n.translate("Polaris.IndexProvider.defaultItemPlural")
  };
  const resourceName = passedResourceName ? passedResourceName : defaultResourceName;
  const paginatedSelectAllText = getPaginatedSelectAllText();
  const bulkActionsLabel = getBulkActionsLabel();
  const bulkActionsAccessibilityLabel = getBulkActionsAccessibilityLabel();
  let bulkSelectState = "indeterminate";
  if (!selectedItemsCount || selectedItemsCount === 0) {
    bulkSelectState = void 0;
  } else if (selectedItemsCount === SELECT_ALL_ITEMS || selectedItemsCount === itemCount) {
    bulkSelectState = true;
  }
  return {
    paginatedSelectAllText,
    bulkActionsLabel,
    bulkActionsAccessibilityLabel,
    resourceName,
    selectMode,
    bulkSelectState,
    selectable
  };
  function getPaginatedSelectAllText() {
    if (!selectable || !hasMoreItems) {
      return;
    }
    if (selectedItemsCount === SELECT_ALL_ITEMS) {
      if (defaultPaginatedSelectAllText) {
        return defaultPaginatedSelectAllText;
      }
      return i18n.translate("Polaris.IndexProvider.allItemsSelected", {
        itemsLength: itemCount,
        resourceNamePlural: resourceName.plural.toLocaleLowerCase()
      });
    }
  }
  function getBulkActionsLabel() {
    const selectedItemsCountLabel = selectedItemsCount === SELECT_ALL_ITEMS ? `${itemCount}+` : selectedItemsCount;
    return i18n.translate("Polaris.IndexProvider.selected", {
      selectedItemsCount: selectedItemsCountLabel
    });
  }
  function getBulkActionsAccessibilityLabel() {
    const totalItemsCount = itemCount;
    const allSelected = selectedItemsCount === totalItemsCount;
    if (totalItemsCount === 1 && allSelected) {
      return i18n.translate("Polaris.IndexProvider.a11yCheckboxDeselectAllSingle", {
        resourceNameSingular: resourceName.singular
      });
    } else if (totalItemsCount === 1) {
      return i18n.translate("Polaris.IndexProvider.a11yCheckboxSelectAllSingle", {
        resourceNameSingular: resourceName.singular
      });
    } else if (allSelected) {
      return i18n.translate("Polaris.IndexProvider.a11yCheckboxDeselectAllMultiple", {
        itemsLength: itemCount,
        resourceNamePlural: resourceName.plural
      });
    } else {
      return i18n.translate("Polaris.IndexProvider.a11yCheckboxSelectAllMultiple", {
        itemsLength: itemCount,
        resourceNamePlural: resourceName.plural
      });
    }
  }
}
function useHandleBulkSelection({
  onSelectionChange = () => {
  }
}) {
  const lastSelected = useRef(null);
  const handleSelectionChange = useCallback((selectionType, toggleType, selection, sortOrder) => {
    const prevSelected = lastSelected.current;
    if (SelectionType.Multi && typeof sortOrder === "number") {
      lastSelected.current = sortOrder;
    }
    if (selectionType === SelectionType.Single || selectionType === SelectionType.Multi && (typeof prevSelected !== "number" || typeof sortOrder !== "number")) {
      onSelectionChange(SelectionType.Single, toggleType, selection);
    } else if (selectionType === SelectionType.Multi) {
      const min = Math.min(prevSelected, sortOrder);
      const max = Math.max(prevSelected, sortOrder);
      onSelectionChange(selectionType, toggleType, [min, max]);
    } else if (selectionType === SelectionType.Page || selectionType === SelectionType.All) {
      onSelectionChange(selectionType, toggleType);
    } else if (selectionType === SelectionType.Range) {
      onSelectionChange(SelectionType.Range, toggleType, selection);
    }
  }, [onSelectionChange]);
  return handleSelectionChange;
}
function IndexProvider({
  children,
  resourceName: passedResourceName,
  loading,
  onSelectionChange,
  selectedItemsCount = 0,
  itemCount,
  hasMoreItems,
  condensed,
  selectable: isSelectableIndex = true,
  paginatedSelectAllText: defaultPaginatedSelectAllText
}) {
  const {
    paginatedSelectAllText,
    bulkActionsLabel,
    bulkActionsAccessibilityLabel,
    resourceName,
    selectMode,
    bulkSelectState
  } = useBulkSelectionData({
    selectedItemsCount,
    itemCount,
    hasMoreItems,
    resourceName: passedResourceName,
    defaultPaginatedSelectAllText
  });
  const handleSelectionChange = useHandleBulkSelection({
    onSelectionChange
  });
  const contextValue = useMemo(() => ({
    itemCount,
    selectMode: selectMode && isSelectableIndex,
    selectable: isSelectableIndex,
    resourceName,
    loading,
    paginatedSelectAllText,
    hasMoreItems,
    bulkActionsLabel,
    bulkActionsAccessibilityLabel,
    bulkSelectState,
    selectedItemsCount,
    condensed
  }), [itemCount, selectMode, isSelectableIndex, resourceName, loading, paginatedSelectAllText, hasMoreItems, bulkActionsLabel, bulkActionsAccessibilityLabel, bulkSelectState, selectedItemsCount, condensed]);
  const rowContextValue = useMemo(() => ({
    selectable: isSelectableIndex,
    selectMode: selectMode && isSelectableIndex,
    condensed
  }), [condensed, selectMode, isSelectableIndex]);
  return /* @__PURE__ */ React.createElement(IndexContext.Provider, {
    value: contextValue
  }, /* @__PURE__ */ React.createElement(IndexRowContext.Provider, {
    value: rowContextValue
  }, /* @__PURE__ */ React.createElement(IndexSelectionChangeContext.Provider, {
    value: handleSelectionChange
  }, children)));
}
const RowContext = /* @__PURE__ */ createContext({});
const RowHoveredContext = /* @__PURE__ */ createContext(void 0);
const scrollDefaultContext = {
  scrollableContainer: null,
  canScrollLeft: false,
  canScrollRight: false
};
const ScrollContext = /* @__PURE__ */ createContext(scrollDefaultContext);
const Cell = /* @__PURE__ */ memo(function Cell2({
  children,
  className: customClassName,
  flush,
  colSpan,
  headers: headers2,
  scope,
  as = "td",
  id
}) {
  const className = classNames(customClassName, styles$a.TableCell, flush && styles$a["TableCell-flush"]);
  return /* @__PURE__ */ React.createElement(as, {
    id,
    colSpan,
    headers: headers2,
    scope,
    className
  }, children);
});
var styles$9 = {
  "Wrapper": "Polaris-IndexTable-Checkbox__Wrapper"
};
const Checkbox2 = /* @__PURE__ */ memo(function Checkbox3({
  accessibilityLabel
}) {
  const i18n = useI18n();
  const {
    resourceName
  } = useIndexValue();
  const {
    itemId,
    selected,
    disabled,
    onInteraction
  } = useContext(RowContext);
  const label = accessibilityLabel ? accessibilityLabel : i18n.translate("Polaris.IndexTable.selectItem", {
    resourceName: resourceName.singular
  });
  return /* @__PURE__ */ React.createElement(CheckboxWrapper, null, /* @__PURE__ */ React.createElement("div", {
    className: styles$9.Wrapper,
    onClick: onInteraction,
    onKeyUp: noop
  }, /* @__PURE__ */ React.createElement(Checkbox$1, {
    id: `Select-${itemId}`,
    label,
    labelHidden: true,
    checked: selected,
    disabled
  })));
});
function CheckboxWrapper({
  children
}) {
  const {
    position
  } = useContext(RowContext);
  const checkboxNode = useRef(null);
  const handleResize = useCallback(debounce(() => {
    if (position !== 0 || !checkboxNode.current) return;
    const {
      width
    } = checkboxNode.current.getBoundingClientRect();
    setRootProperty("--pc-checkbox-offset", `${width}px`);
  }), [position]);
  useEffect(() => {
    handleResize();
  }, [handleResize]);
  useEffect(() => {
    if (!checkboxNode.current) return;
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
  const checkboxClassName = classNames(styles$a.TableCell, styles$a["TableCell-first"]);
  return /* @__PURE__ */ React.createElement("td", {
    className: checkboxClassName,
    ref: checkboxNode
  }, children);
}
function noop() {
}
const Row = /* @__PURE__ */ memo(function Row2({
  children,
  hideSelectable,
  selected,
  id,
  position,
  tone,
  disabled,
  selectionRange,
  rowType = "data",
  accessibilityLabel,
  onNavigation,
  onClick
}) {
  const {
    selectable: tableIsSelectable,
    selectMode,
    condensed
  } = useIndexRow();
  const rowIsSelectable = tableIsSelectable && !hideSelectable;
  const onSelectionChange = useIndexSelectionChange();
  const {
    value: hovered,
    setTrue: setHoverIn,
    setFalse: setHoverOut
  } = useToggle(false);
  const handleInteraction = useCallback((event) => {
    event.stopPropagation();
    let selectionType = SelectionType.Single;
    if (disabled || !rowIsSelectable || "key" in event && event.key !== " " || !onSelectionChange) return;
    if (event.nativeEvent.shiftKey) {
      selectionType = SelectionType.Multi;
    } else if (selectionRange) {
      selectionType = SelectionType.Range;
    }
    const selection = selectionRange ?? id;
    onSelectionChange(selectionType, !selected, selection, position);
  }, [id, onSelectionChange, selected, selectionRange, position, disabled, rowIsSelectable]);
  const contextValue = useMemo(() => ({
    itemId: id,
    selected,
    position,
    onInteraction: handleInteraction,
    disabled
  }), [id, selected, disabled, position, handleInteraction]);
  const primaryLinkElement = useRef(null);
  const isNavigating = useRef(false);
  const tableRowRef = useRef(null);
  const tableRowCallbackRef = useCallback((node) => {
    tableRowRef.current = node;
    const el = node == null ? void 0 : node.querySelector("[data-primary-link]");
    if (el) {
      primaryLinkElement.current = el;
    }
  }, []);
  const rowClassName = classNames(styles$a.TableRow, rowType === "subheader" && styles$a["TableRow-subheader"], rowType === "child" && styles$a["TableRow-child"], rowIsSelectable && condensed && styles$a.condensedRow, selected && styles$a["TableRow-selected"], hovered && !condensed && styles$a["TableRow-hovered"], disabled && styles$a["TableRow-disabled"], tone && styles$a[variationName("tone", tone)], !rowIsSelectable && !onClick && !primaryLinkElement.current && styles$a["TableRow-unclickable"]);
  let handleRowClick;
  if (!disabled && rowIsSelectable || onClick || primaryLinkElement.current) {
    handleRowClick = (event) => {
      if (rowType === "subheader") return;
      if (!tableRowRef.current || isNavigating.current) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      if (onClick) {
        onClick();
        return;
      }
      if (primaryLinkElement.current && !selectMode) {
        isNavigating.current = true;
        const {
          ctrlKey,
          metaKey
        } = event.nativeEvent;
        if (onNavigation) {
          onNavigation(id);
        }
        if ((ctrlKey || metaKey) && primaryLinkElement.current instanceof HTMLAnchorElement) {
          isNavigating.current = false;
          window.open(primaryLinkElement.current.href, "_blank");
          return;
        }
        primaryLinkElement.current.dispatchEvent(new MouseEvent(event.type, event.nativeEvent));
      } else {
        isNavigating.current = false;
        handleInteraction(event);
      }
    };
  }
  const RowWrapper = condensed ? "li" : "tr";
  const checkboxMarkup = hideSelectable ? /* @__PURE__ */ React.createElement(Cell, null) : /* @__PURE__ */ React.createElement(Checkbox2, {
    accessibilityLabel
  });
  return /* @__PURE__ */ React.createElement(RowContext.Provider, {
    value: contextValue
  }, /* @__PURE__ */ React.createElement(RowHoveredContext.Provider, {
    value: hovered
  }, /* @__PURE__ */ React.createElement(RowWrapper, {
    key: id,
    id,
    className: rowClassName,
    onMouseEnter: setHoverIn,
    onMouseLeave: setHoverOut,
    onClick: handleRowClick,
    ref: tableRowCallbackRef
  }, tableIsSelectable ? checkboxMarkup : null, children)));
});
function getTableHeadingsBySelector(wrapperElement, selector) {
  return wrapperElement ? Array.from(wrapperElement.querySelectorAll(selector)) : [];
}
var styles$8 = {
  "ScrollContainer": "Polaris-IndexTable-ScrollContainer"
};
function ScrollContainer({
  children,
  scrollableContainerRef,
  onScroll
}) {
  useEffect(() => {
    if (!scrollableContainerRef.current) return;
    scrollableContainerRef.current.dispatchEvent(new Event("scroll"));
  }, [scrollableContainerRef]);
  const [containerScroll, setContainerScroll] = useState(scrollDefaultContext);
  const handleScroll = useCallback(debounce(() => {
    if (!scrollableContainerRef.current) {
      return;
    }
    const availableScrollAmount = scrollableContainerRef.current.scrollWidth - scrollableContainerRef.current.offsetWidth;
    const canScrollLeft = scrollableContainerRef.current.scrollLeft > 0;
    const canScrollRight = scrollableContainerRef.current.scrollLeft < availableScrollAmount;
    onScroll(canScrollLeft, canScrollRight);
    setContainerScroll({
      scrollableContainer: scrollableContainerRef.current,
      canScrollLeft,
      canScrollRight
    });
  }, 40, {
    trailing: true,
    leading: true,
    maxWait: 40
  }), [onScroll, scrollableContainerRef]);
  return /* @__PURE__ */ React.createElement(ScrollContext.Provider, {
    value: containerScroll
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$8.ScrollContainer,
    ref: scrollableContainerRef,
    onScroll: handleScroll
  }, children));
}
const SCROLL_BAR_PADDING = 16;
const SCROLL_BAR_DEBOUNCE_PERIOD = 300;
function IndexTableBase({
  headings,
  bulkActions = [],
  promotedBulkActions = [],
  children,
  emptyState,
  sort,
  paginatedSelectAllActionText,
  lastColumnSticky = false,
  sortable,
  sortDirection,
  defaultSortDirection = "descending",
  sortColumnIndex,
  onSort,
  sortToggleLabels,
  hasZebraStriping,
  pagination,
  ...restProps
}) {
  const {
    loading,
    bulkSelectState,
    resourceName,
    bulkActionsAccessibilityLabel,
    selectMode,
    selectable = restProps.selectable,
    paginatedSelectAllText,
    itemCount,
    hasMoreItems,
    selectedItemsCount,
    condensed
  } = useIndexValue();
  const handleSelectionChange = useIndexSelectionChange();
  const i18n = useI18n();
  const {
    value: hasMoreLeftColumns,
    toggle: toggleHasMoreLeftColumns
  } = useToggle(false);
  const tablePosition = useRef({
    top: 0,
    left: 0
  });
  const tableHeadingRects = useRef([]);
  const scrollableContainerElement = useRef(null);
  const tableElement = useRef(null);
  const tableBodyElement = useRef(null);
  const condensedListElement = useRef(null);
  const [tableInitialized, setTableInitialized] = useState(false);
  const [stickyWrapper, setStickyWrapper] = useState(null);
  const [hideScrollContainer, setHideScrollContainer] = useState(true);
  const tableHeadings = useRef([]);
  const stickyTableHeadings = useRef([]);
  const stickyHeaderWrapperElement = useRef(null);
  const firstStickyHeaderElement = useRef(null);
  const stickyHeaderElement = useRef(null);
  const scrollBarElement = useRef(null);
  const scrollContainerElement = useRef(null);
  const scrollingWithBar = useRef(false);
  const scrollingContainer = useRef(false);
  const lastSortedColumnIndex = useRef(sortColumnIndex);
  const renderAfterSelectEvent = useRef(false);
  const lastSelectedItemsCount = useRef(0);
  const hasSelected = useRef(false);
  if (selectedItemsCount !== lastSelectedItemsCount.current) {
    renderAfterSelectEvent.current = true;
    lastSelectedItemsCount.current = selectedItemsCount;
  }
  if (!hasSelected.current && selectedItemsCount !== 0) {
    hasSelected.current = true;
  }
  const tableBodyRef = useCallback((node) => {
    if (node !== null && !tableInitialized) {
      setTableInitialized(true);
    }
    tableBodyElement.current = node;
  }, [tableInitialized]);
  const handleSelectAllItemsInStore = useCallback(() => {
    handleSelectionChange(selectedItemsCount === SELECT_ALL_ITEMS ? SelectionType.Page : SelectionType.All, true);
  }, [handleSelectionChange, selectedItemsCount]);
  const resizeTableHeadings = useMemo(() => debounce(() => {
    var _a, _b;
    if (!tableElement.current || !scrollableContainerElement.current) {
      return;
    }
    const boundingRect = scrollableContainerElement.current.getBoundingClientRect();
    tablePosition.current = {
      top: boundingRect.top,
      left: boundingRect.left
    };
    tableHeadingRects.current = tableHeadings.current.map((heading) => ({
      offsetWidth: heading.offsetWidth || 0,
      offsetLeft: heading.offsetLeft || 0
    }));
    if (tableHeadings.current.length === 0) {
      return;
    }
    if (selectable && tableHeadings.current.length > 1) {
      tableHeadings.current[1].style.left = `${tableHeadingRects.current[0].offsetWidth}px`;
      if ((_a = stickyTableHeadings.current) == null ? void 0 : _a.length) {
        stickyTableHeadings.current[1].style.left = `${tableHeadingRects.current[0].offsetWidth}px`;
      }
    }
    if ((_b = stickyTableHeadings.current) == null ? void 0 : _b.length) {
      stickyTableHeadings.current.forEach((heading, index) => {
        var _a2;
        heading.style.minWidth = `${((_a2 = tableHeadingRects.current[index]) == null ? void 0 : _a2.offsetWidth) || 0}px`;
      });
    }
  }), [selectable]);
  const resizeTableScrollBar = useCallback(() => {
    var _a, _b;
    if (scrollBarElement.current && tableElement.current && tableInitialized) {
      scrollBarElement.current.style.setProperty("--pc-index-table-scroll-bar-content-width", `${tableElement.current.offsetWidth - SCROLL_BAR_PADDING}px`);
      setHideScrollContainer(((_a = scrollContainerElement.current) == null ? void 0 : _a.offsetWidth) === ((_b = tableElement.current) == null ? void 0 : _b.offsetWidth));
    }
  }, [tableInitialized]);
  const debounceResizeTableScrollbar = useCallback(debounce(resizeTableScrollBar, SCROLL_BAR_DEBOUNCE_PERIOD, {
    trailing: true
  }), [resizeTableScrollBar]);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const handleCanScrollRight = useCallback(debounce(() => {
    if (!lastColumnSticky || !tableElement.current || !scrollableContainerElement.current) {
      return;
    }
    const tableRect = tableElement.current.getBoundingClientRect();
    const scrollableRect = scrollableContainerElement.current.getBoundingClientRect();
    setCanScrollRight(tableRect.width > scrollableRect.width);
  }), [lastColumnSticky]);
  useEffect(() => {
    handleCanScrollRight();
  }, [handleCanScrollRight]);
  const [canFitStickyColumn, setCanFitStickyColumn] = useState(true);
  const handleCanFitStickyColumn = useCallback(() => {
    if (!scrollableContainerElement.current || !tableHeadings.current.length) {
      return;
    }
    const scrollableRect = scrollableContainerElement.current.getBoundingClientRect();
    const checkboxColumnWidth = selectable ? tableHeadings.current[0].getBoundingClientRect().width : 0;
    const firstStickyColumnWidth = tableHeadings.current[selectable ? 1 : 0].getBoundingClientRect().width;
    const lastColumnIsNotTheFirst = selectable ? tableHeadings.current.length > 2 : 1;
    const lastStickyColumnWidth = lastColumnSticky && lastColumnIsNotTheFirst ? tableHeadings.current[tableHeadings.current.length - 1].getBoundingClientRect().width : 0;
    const restOfContentMinWidth = 100;
    setCanFitStickyColumn(scrollableRect.width > firstStickyColumnWidth + checkboxColumnWidth + lastStickyColumnWidth + restOfContentMinWidth);
  }, [lastColumnSticky, selectable]);
  useEffect(() => {
    if (tableInitialized) {
      handleCanFitStickyColumn();
    }
  }, [handleCanFitStickyColumn, tableInitialized]);
  const handleResize = useCallback(() => {
    var _a;
    (_a = scrollBarElement.current) == null ? void 0 : _a.style.setProperty("--pc-index-table-scroll-bar-content-width", `0px`);
    resizeTableHeadings();
    debounceResizeTableScrollbar();
    handleCanScrollRight();
    handleCanFitStickyColumn();
  }, [resizeTableHeadings, debounceResizeTableScrollbar, handleCanScrollRight, handleCanFitStickyColumn]);
  const handleScrollContainerScroll = useCallback((canScrollLeft, canScrollRight2) => {
    if (!scrollableContainerElement.current || !scrollBarElement.current) {
      return;
    }
    if (!scrollingWithBar.current) {
      scrollingContainer.current = true;
      scrollBarElement.current.scrollLeft = scrollableContainerElement.current.scrollLeft;
    }
    scrollingWithBar.current = false;
    if (stickyHeaderElement.current) {
      stickyHeaderElement.current.scrollLeft = scrollableContainerElement.current.scrollLeft;
    }
    if (canScrollLeft && !hasMoreLeftColumns || !canScrollLeft && hasMoreLeftColumns) {
      toggleHasMoreLeftColumns();
    }
    setCanScrollRight(canScrollRight2);
  }, [hasMoreLeftColumns, toggleHasMoreLeftColumns]);
  const handleScrollBarScroll = useCallback(() => {
    if (!scrollableContainerElement.current || !scrollBarElement.current) {
      return;
    }
    if (!scrollingContainer.current) {
      scrollingWithBar.current = true;
      scrollableContainerElement.current.scrollLeft = scrollBarElement.current.scrollLeft;
    }
    scrollingContainer.current = false;
  }, []);
  useIsomorphicLayoutEffect(() => {
    tableHeadings.current = getTableHeadingsBySelector(tableElement.current, "[data-index-table-heading]");
    stickyTableHeadings.current = getTableHeadingsBySelector(stickyHeaderWrapperElement.current, "[data-index-table-sticky-heading]");
    resizeTableHeadings();
  }, [headings, resizeTableHeadings, firstStickyHeaderElement, tableInitialized]);
  useEffect(() => {
    resizeTableScrollBar();
    setStickyWrapper(condensed ? condensedListElement.current : tableElement.current);
  }, [tableInitialized, resizeTableScrollBar, condensed]);
  const headingsMarkup = headings.map((heading, index) => renderHeading(heading, index, "th", {
    "data-index-table-heading": true
  }, heading.id));
  const stickyHeadingsMarkup = headings.map((heading, index) => (
    // NOTE: No id since it would be a duplicate of the non-sticky header's id
    renderHeading(heading, index, "div", {
      "data-index-table-sticky-heading": true
    })
  ));
  const [selectedItemsCountValue, setSelectedItemsCountValue] = useState(selectedItemsCount === SELECT_ALL_ITEMS ? `${itemCount}+` : selectedItemsCount);
  useEffect(() => {
    if (selectedItemsCount === SELECT_ALL_ITEMS || selectedItemsCount > 0) {
      setSelectedItemsCountValue(selectedItemsCount === SELECT_ALL_ITEMS ? `${itemCount}+` : selectedItemsCount);
    }
  }, [selectedItemsCount, itemCount]);
  const selectAllActionsLabel = i18n.translate("Polaris.IndexTable.selected", {
    selectedItemsCount: selectedItemsCountValue
  });
  const handleTogglePage = useCallback(() => {
    handleSelectionChange(SelectionType.Page, Boolean(!bulkSelectState || bulkSelectState === "indeterminate"));
  }, [bulkSelectState, handleSelectionChange]);
  const paginatedSelectAllAction = getPaginatedSelectAllAction();
  const loadingMarkup = /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$a.LoadingPanel, loading && styles$a.LoadingPanelEntered)
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$a.LoadingPanelRow
  }, /* @__PURE__ */ React.createElement(Spinner$1, {
    size: "small"
  }), /* @__PURE__ */ React.createElement("span", {
    className: styles$a.LoadingPanelText
  }, i18n.translate("Polaris.IndexTable.resourceLoadingAccessibilityLabel", {
    resourceNamePlural: resourceName.plural.toLocaleLowerCase()
  }))));
  const stickyTableClassNames = classNames(styles$a.StickyTable, hasMoreLeftColumns && styles$a["StickyTable-scrolling"], condensed && styles$a["StickyTable-condensed"]);
  const shouldShowActions = !condensed || selectedItemsCount;
  const promotedActions = shouldShowActions ? promotedBulkActions : [];
  const actions = shouldShowActions ? bulkActions : [];
  const stickyHeaderMarkup = /* @__PURE__ */ React.createElement("div", {
    className: stickyTableClassNames,
    role: "presentation"
  }, /* @__PURE__ */ React.createElement(Sticky, {
    boundingElement: stickyWrapper
  }, (isSticky) => {
    const stickyHeaderClassNames = classNames(
      styles$a.StickyTableHeader,
      isSticky && styles$a["StickyTableHeader-isSticky"],
      // Has a sticky left column enabled
      canFitStickyColumn && styles$a["StickyTableHeader-sticky"],
      // ie; is scrolled to the right
      hasMoreLeftColumns && styles$a["StickyTableHeader-scrolling"],
      // Has a sticky right column enabled
      canFitStickyColumn && lastColumnSticky && styles$a["StickyTableHeader-sticky-last"],
      // ie; is scrolled to the left
      canFitStickyColumn && lastColumnSticky && canScrollRight && styles$a["StickyTableHeader-sticky-scrolling"]
    );
    const bulkActionsClassName = classNames(styles$a.BulkActionsWrapper, selectMode && styles$a.BulkActionsWrapperVisible, condensed && styles$a["StickyTableHeader-condensed"], isSticky && styles$a["StickyTableHeader-isSticky"]);
    const bulkActionsMarkup = shouldShowActions && !condensed ? /* @__PURE__ */ React.createElement("div", {
      className: bulkActionsClassName
    }, /* @__PURE__ */ React.createElement(BulkActions, {
      selectMode,
      onToggleAll: handleTogglePage,
      paginatedSelectAllText,
      paginatedSelectAllAction,
      accessibilityLabel: bulkActionsAccessibilityLabel,
      selected: bulkSelectState,
      promotedActions,
      actions,
      onSelectModeToggle: condensed ? handleSelectModeToggle : void 0,
      label: selectAllActionsLabel,
      buttonSize: "micro"
    })) : null;
    const headerMarkup = condensed ? /* @__PURE__ */ React.createElement("div", {
      className: classNames(styles$a.HeaderWrapper, (!selectable || condensed) && styles$a.unselectable)
    }, loadingMarkup, sort) : /* @__PURE__ */ React.createElement("div", {
      className: stickyHeaderClassNames,
      ref: stickyHeaderWrapperElement
    }, loadingMarkup, /* @__PURE__ */ React.createElement("div", {
      className: styles$a.StickyTableHeadings,
      ref: stickyHeaderElement
    }, stickyHeadingsMarkup));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, headerMarkup, bulkActionsMarkup);
  }));
  const scrollBarWrapperClassNames = classNames(styles$a.ScrollBarContainer, pagination && styles$a.ScrollBarContainerWithPagination, condensed && styles$a.scrollBarContainerCondensed, hideScrollContainer && styles$a.scrollBarContainerHidden);
  const scrollBarClassNames = classNames(tableElement.current && tableInitialized && styles$a.ScrollBarContent);
  const scrollBarMarkup = itemCount > 0 ? /* @__PURE__ */ React.createElement(AfterInitialMount, {
    onMount: resizeTableScrollBar
  }, /* @__PURE__ */ React.createElement("div", {
    className: scrollBarWrapperClassNames,
    ref: scrollContainerElement
  }, /* @__PURE__ */ React.createElement("div", {
    onScroll: handleScrollBarScroll,
    className: styles$a.ScrollBar,
    ref: scrollBarElement
  }, /* @__PURE__ */ React.createElement("div", {
    className: scrollBarClassNames
  })))) : null;
  const isSortable = sortable == null ? void 0 : sortable.some((value) => value);
  const tableClassNames = classNames(styles$a.Table, hasMoreLeftColumns && styles$a["Table-scrolling"], selectMode && styles$a.disableTextSelection, !selectable && styles$a["Table-unselectable"], canFitStickyColumn && styles$a["Table-sticky"], isSortable && styles$a["Table-sortable"], canFitStickyColumn && lastColumnSticky && styles$a["Table-sticky-last"], canFitStickyColumn && lastColumnSticky && canScrollRight && styles$a["Table-sticky-scrolling"], hasZebraStriping && styles$a.ZebraStriping);
  const emptyStateMarkup = emptyState ? emptyState : /* @__PURE__ */ React.createElement(EmptySearchResult, {
    title: i18n.translate("Polaris.IndexTable.emptySearchTitle", {
      resourceNamePlural: resourceName.plural
    }),
    description: i18n.translate("Polaris.IndexTable.emptySearchDescription"),
    withIllustration: true
  });
  const sharedMarkup = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(EventListener, {
    event: "resize",
    handler: handleResize
  }), stickyHeaderMarkup);
  const condensedClassNames = classNames(styles$a.CondensedList, hasZebraStriping && styles$a.ZebraStriping);
  const bodyMarkup = condensed ? /* @__PURE__ */ React.createElement(React.Fragment, null, sharedMarkup, /* @__PURE__ */ React.createElement("ul", {
    "data-selectmode": Boolean(selectMode),
    className: condensedClassNames,
    ref: condensedListElement
  }, children)) : /* @__PURE__ */ React.createElement(React.Fragment, null, sharedMarkup, /* @__PURE__ */ React.createElement(ScrollContainer, {
    scrollableContainerRef: scrollableContainerElement,
    onScroll: handleScrollContainerScroll
  }, /* @__PURE__ */ React.createElement("table", {
    ref: tableElement,
    className: tableClassNames
  }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", {
    className: styles$a.HeadingRow
  }, headingsMarkup)), /* @__PURE__ */ React.createElement("tbody", {
    ref: tableBodyRef
  }, children))));
  const tableContentMarkup = itemCount > 0 ? bodyMarkup : /* @__PURE__ */ React.createElement("div", {
    className: styles$a.EmptySearchResultWrapper
  }, emptyStateMarkup);
  const paginationMarkup = pagination ? /* @__PURE__ */ React.createElement("div", {
    className: styles$a.PaginationWrapper
  }, /* @__PURE__ */ React.createElement(Pagination, Object.assign({
    type: "table"
  }, pagination))) : null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: styles$a.IndexTable
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$a.IndexTableWrapper
  }, !condensed && loadingMarkup, tableContentMarkup, scrollBarMarkup, paginationMarkup)));
  function renderHeading(heading, index, Tag, tagProps, id) {
    const isSecond = index === 0;
    const isLast = index === headings.length - 1;
    const hasSortable = sortable == null ? void 0 : sortable.some((value) => value === true);
    const headingAlignment = heading.alignment || "start";
    const headingContentClassName = classNames(styles$a.TableHeading, headingAlignment === "center" && styles$a["TableHeading-align-center"], headingAlignment === "end" && styles$a["TableHeading-align-end"], hasSortable && styles$a["TableHeading-sortable"], isSecond && styles$a["TableHeading-second"], isLast && !heading.hidden && styles$a["TableHeading-last"], !selectable && styles$a["TableHeading-unselectable"], heading.flush && styles$a["TableHeading-flush"]);
    const stickyPositioningStyle = selectable !== false && isSecond && tableHeadingRects.current && tableHeadingRects.current.length > 0 ? {
      left: tableHeadingRects.current[0].offsetWidth
    } : void 0;
    const headingContent = /* @__PURE__ */ React.createElement(Tag, Object.assign({
      id,
      className: headingContentClassName,
      key: getHeadingKey(heading),
      style: stickyPositioningStyle
    }, tagProps), renderHeadingContent(heading, index));
    if (index !== 0 || !selectable) {
      return headingContent;
    }
    const checkboxClassName = classNames(styles$a.TableHeading, hasSortable && styles$a["TableHeading-sortable"], index === 0 && styles$a["TableHeading-first"]);
    const checkboxContent = /* @__PURE__ */ React.createElement(Tag, Object.assign({
      className: checkboxClassName,
      key: `${heading}-${index}`
    }, tagProps), renderCheckboxContent());
    return [checkboxContent, headingContent];
  }
  function renderCheckboxContent() {
    return /* @__PURE__ */ React.createElement("div", {
      className: styles$a.ColumnHeaderCheckboxWrapper
    }, /* @__PURE__ */ React.createElement(Checkbox$1, {
      label: i18n.translate("Polaris.IndexTable.selectAllLabel", {
        resourceNamePlural: resourceName.plural
      }),
      labelHidden: true,
      onChange: handleSelectPage,
      checked: bulkSelectState
    }));
  }
  function handleSortHeadingClick(index, direction) {
    renderAfterSelectEvent.current = false;
    hasSelected.current = false;
    lastSortedColumnIndex.current = sortColumnIndex;
    onSort == null ? void 0 : onSort(index, direction);
  }
  function renderHeadingContent(heading, index) {
    let headingContent;
    const defaultTooltipProps = {
      width: heading.tooltipWidth ?? "default",
      activatorWrapper: "div",
      dismissOnMouseOut: true,
      persistOnClick: heading.tooltipPersistsOnClick
    };
    const defaultHeaderTooltipProps = {
      ...defaultTooltipProps,
      padding: "400",
      borderRadius: "200",
      content: heading.tooltipContent,
      preferredPosition: "above"
    };
    const headingTitle = /* @__PURE__ */ React.createElement(Text, {
      as: "span",
      variant: "bodySm",
      fontWeight: "medium",
      visuallyHidden: heading.hidden
    }, heading.title);
    if (heading.new) {
      headingContent = /* @__PURE__ */ React.createElement(LegacyStack, {
        wrap: false,
        alignment: "center"
      }, headingTitle, /* @__PURE__ */ React.createElement(Badge, {
        tone: "new"
      }, i18n.translate("Polaris.IndexTable.onboardingBadgeText")));
    } else {
      headingContent = headingTitle;
    }
    const style = {
      "--pc-index-table-heading-extra-padding-right": heading.paddingBlockEnd ? `var(--p-space-${heading.paddingBlockEnd})` : "0"
    };
    if (sortable == null ? void 0 : sortable[index]) {
      const isCurrentlySorted = index === sortColumnIndex;
      const isPreviouslySorted = !isCurrentlySorted && index === lastSortedColumnIndex.current;
      const isRenderAfterSelectEvent = renderAfterSelectEvent.current || !hasSelected.current && selectedItemsCount !== 0;
      const isAscending = sortDirection === "ascending";
      let newDirection = heading.defaultSortDirection ?? defaultSortDirection;
      let SourceComponent = newDirection === "ascending" ? SortAscendingIcon : SortDescendingIcon;
      if (isCurrentlySorted) {
        newDirection = isAscending ? "descending" : "ascending";
        SourceComponent = sortDirection === "ascending" ? SortAscendingIcon : SortDescendingIcon;
      }
      const iconMarkup = /* @__PURE__ */ React.createElement("span", {
        className: classNames(styles$a.TableHeadingSortIcon, (heading == null ? void 0 : heading.alignment) === "end" && styles$a["TableHeadingSortIcon-heading-align-end"], isCurrentlySorted && styles$a["TableHeadingSortIcon-visible"])
      }, /* @__PURE__ */ React.createElement(SourceComponent, {
        focusable: "false",
        "aria-hidden": "true",
        className: styles$a.TableHeadingSortSvg
      }));
      const defaultSortButtonProps = {
        onClick: () => handleSortHeadingClick(index, newDirection),
        className: classNames(styles$a.TableHeadingSortButton, !isCurrentlySorted && (heading == null ? void 0 : heading.alignment) === "end" && styles$a["TableHeadingSortButton-heading-align-end"], isCurrentlySorted && (heading == null ? void 0 : heading.alignment) === "end" && styles$a["TableHeadingSortButton-heading-align-end-currently-sorted"], isPreviouslySorted && !isRenderAfterSelectEvent && (heading == null ? void 0 : heading.alignment) === "end" && styles$a["TableHeadingSortButton-heading-align-end-previously-sorted"]),
        tabIndex: selectMode ? -1 : 0
      };
      const sortMarkup = /* @__PURE__ */ React.createElement(UnstyledButton, defaultSortButtonProps, iconMarkup, /* @__PURE__ */ React.createElement("span", {
        className: classNames(sortToggleLabels && selectMode && heading.tooltipContent && styles$a.TableHeadingTooltipUnderlinePlaceholder)
      }, headingContent));
      if (!sortToggleLabels || selectMode) {
        return /* @__PURE__ */ React.createElement("div", {
          className: styles$a.SortableTableHeadingWithCustomMarkup
        }, sortMarkup);
      }
      const tooltipDirection = isCurrentlySorted ? sortDirection : newDirection;
      const sortTooltipContent = sortToggleLabels[index][tooltipDirection];
      if (!heading.tooltipContent) {
        return (
          // Regular header with sort icon and sort direction tooltip
          /* @__PURE__ */ React.createElement("div", {
            style,
            className: classNames(heading.paddingBlockEnd && styles$a["TableHeading-extra-padding-right"])
          }, /* @__PURE__ */ React.createElement(Tooltip, Object.assign({}, defaultTooltipProps, {
            content: sortTooltipContent,
            preferredPosition: "above"
          }), sortMarkup))
        );
      }
      if (heading.tooltipContent) {
        return (
          // Header text and sort icon have separate tooltips
          /* @__PURE__ */ React.createElement("div", {
            className: classNames(styles$a.SortableTableHeadingWithCustomMarkup, heading.paddingBlockEnd && styles$a["TableHeading-extra-padding-right"]),
            style
          }, /* @__PURE__ */ React.createElement(UnstyledButton, defaultSortButtonProps, /* @__PURE__ */ React.createElement(Tooltip, defaultHeaderTooltipProps, /* @__PURE__ */ React.createElement("span", {
            className: styles$a.TableHeadingUnderline
          }, headingContent)), /* @__PURE__ */ React.createElement(Tooltip, Object.assign({}, defaultTooltipProps, {
            content: sortTooltipContent,
            preferredPosition: "above"
          }), iconMarkup)))
        );
      }
    }
    if (heading.tooltipContent) {
      return (
        // Non-sortable header with tooltip
        /* @__PURE__ */ React.createElement("div", {
          style,
          className: classNames(heading.paddingBlockEnd && styles$a["TableHeading-extra-padding-right"])
        }, /* @__PURE__ */ React.createElement(Tooltip, Object.assign({}, defaultHeaderTooltipProps, {
          activatorWrapper: "span"
        }), /* @__PURE__ */ React.createElement("span", {
          className: classNames(styles$a.TableHeadingUnderline, styles$a.SortableTableHeaderWrapper)
        }, headingContent)))
      );
    }
    return /* @__PURE__ */ React.createElement("div", {
      style,
      className: classNames(heading.paddingBlockEnd && styles$a["TableHeading-extra-padding-right"])
    }, headingContent);
  }
  function handleSelectPage(checked) {
    handleSelectionChange(SelectionType.Page, checked);
  }
  function getPaginatedSelectAllAction() {
    if (!selectable || !hasMoreItems) {
      return;
    }
    const customActionText = paginatedSelectAllActionText ?? i18n.translate("Polaris.IndexTable.selectAllItems", {
      itemsLength: itemCount,
      resourceNamePlural: resourceName.plural.toLocaleLowerCase()
    });
    const actionText = selectedItemsCount === SELECT_ALL_ITEMS ? i18n.translate("Polaris.IndexTable.undo") : customActionText;
    return {
      content: actionText,
      onAction: handleSelectAllItemsInStore
    };
  }
  function handleSelectModeToggle() {
    handleSelectionChange(SelectionType.All, false);
  }
}
function getHeadingKey(heading) {
  if (heading.id) {
    return heading.id;
  } else if (typeof heading.title === "string") {
    return heading.title;
  }
  return "";
}
function IndexTable({
  children,
  selectable = true,
  itemCount,
  selectedItemsCount = 0,
  resourceName: passedResourceName,
  loading,
  hasMoreItems,
  condensed,
  onSelectionChange,
  paginatedSelectAllText,
  ...indexTableBaseProps
}) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(IndexProvider, {
    selectable: selectable && !condensed,
    itemCount,
    selectedItemsCount,
    resourceName: passedResourceName,
    loading,
    hasMoreItems,
    condensed,
    onSelectionChange,
    paginatedSelectAllText
  }, /* @__PURE__ */ React.createElement(IndexTableBase, indexTableBaseProps, children)));
}
IndexTable.Cell = Cell;
IndexTable.Row = Row;
var styles$7 = {
  "Layout": "Polaris-Layout",
  "Section": "Polaris-Layout__Section",
  "Section-fullWidth": "Polaris-Layout__Section--fullWidth",
  "Section-oneHalf": "Polaris-Layout__Section--oneHalf",
  "Section-oneThird": "Polaris-Layout__Section--oneThird",
  "AnnotatedSection": "Polaris-Layout__AnnotatedSection",
  "AnnotationWrapper": "Polaris-Layout__AnnotationWrapper",
  "AnnotationContent": "Polaris-Layout__AnnotationContent",
  "Annotation": "Polaris-Layout__Annotation"
};
var styles$6 = {
  "TextContainer": "Polaris-TextContainer",
  "spacingTight": "Polaris-TextContainer--spacingTight",
  "spacingLoose": "Polaris-TextContainer--spacingLoose"
};
function TextContainer({
  spacing,
  children
}) {
  const className = classNames(styles$6.TextContainer, spacing && styles$6[variationName("spacing", spacing)]);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, children);
}
function AnnotatedSection({
  children,
  title,
  description,
  id
}) {
  const descriptionMarkup = typeof description === "string" ? /* @__PURE__ */ React.createElement(Text, {
    as: "p",
    variant: "bodyMd"
  }, description) : description;
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$7.AnnotatedSection
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$7.AnnotationWrapper
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$7.Annotation
  }, /* @__PURE__ */ React.createElement(TextContainer, {
    spacing: "tight"
  }, /* @__PURE__ */ React.createElement(Text, {
    id,
    variant: "headingMd",
    as: "h2"
  }, title), descriptionMarkup && /* @__PURE__ */ React.createElement(Box, {
    color: "text-secondary"
  }, descriptionMarkup))), /* @__PURE__ */ React.createElement("div", {
    className: styles$7.AnnotationContent
  }, children)));
}
function Section({
  children,
  variant
}) {
  const className = classNames(styles$7.Section, styles$7[`Section-${variant}`]);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, children);
}
const Layout = function Layout2({
  sectioned,
  children
}) {
  const content = sectioned ? /* @__PURE__ */ React.createElement(Section, null, children) : children;
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$7.Layout
  }, content);
};
Layout.AnnotatedSection = AnnotatedSection;
Layout.Section = Section;
var styles$5 = {
  "Link": "Polaris-Link",
  "monochrome": "Polaris-Link--monochrome",
  "removeUnderline": "Polaris-Link--removeUnderline"
};
function Link({
  url,
  children,
  onClick,
  external,
  target,
  id,
  monochrome,
  removeUnderline,
  accessibilityLabel,
  dataPrimaryLink
}) {
  return /* @__PURE__ */ React.createElement(BannerContext.Consumer, null, (BannerContext2) => {
    const shouldBeMonochrome = monochrome || BannerContext2;
    const className = classNames(styles$5.Link, shouldBeMonochrome && styles$5.monochrome, removeUnderline && styles$5.removeUnderline);
    return url ? /* @__PURE__ */ React.createElement(UnstyledLink, {
      onClick,
      className,
      url,
      external,
      target,
      id,
      "aria-label": accessibilityLabel,
      "data-primary-link": dataPrimaryLink
    }, children) : /* @__PURE__ */ React.createElement("button", {
      type: "button",
      onClick,
      className,
      id,
      "aria-label": accessibilityLabel,
      "data-primary-link": dataPrimaryLink
    }, children);
  });
}
var styles$4 = {
  "List": "Polaris-List",
  "typeNumber": "Polaris-List--typeNumber",
  "Item": "Polaris-List__Item",
  "spacingLoose": "Polaris-List--spacingLoose"
};
function Item({
  children
}) {
  return /* @__PURE__ */ React.createElement("li", {
    className: styles$4.Item
  }, children);
}
const List = function List2({
  children,
  gap = "loose",
  type = "bullet"
}) {
  const className = classNames(styles$4.List, gap && styles$4[variationName("spacing", gap)], type && styles$4[variationName("type", type)]);
  const ListElement = type === "bullet" ? "ul" : "ol";
  return /* @__PURE__ */ React.createElement(ListElement, {
    className
  }, children);
};
List.Item = Item;
function isInterface(x) {
  return !/* @__PURE__ */ isValidElement(x) && x !== void 0;
}
function isReactElement(x) {
  return /* @__PURE__ */ isValidElement(x) && x !== void 0;
}
var styles$3 = {
  "Page": "Polaris-Page",
  "fullWidth": "Polaris-Page--fullWidth",
  "narrowWidth": "Polaris-Page--narrowWidth",
  "Content": "Polaris-Page__Content"
};
var styles$2 = {
  "TitleWrapper": "Polaris-Page-Header__TitleWrapper",
  "TitleWrapperExpand": "Polaris-Page-Header__TitleWrapperExpand",
  "BreadcrumbWrapper": "Polaris-Page-Header__BreadcrumbWrapper",
  "PaginationWrapper": "Polaris-Page-Header__PaginationWrapper",
  "PrimaryActionWrapper": "Polaris-Page-Header__PrimaryActionWrapper",
  "Row": "Polaris-Page-Header__Row",
  "mobileView": "Polaris-Page-Header--mobileView",
  "RightAlign": "Polaris-Page-Header__RightAlign",
  "noBreadcrumbs": "Polaris-Page-Header--noBreadcrumbs",
  "AdditionalMetaData": "Polaris-Page-Header__AdditionalMetaData",
  "Actions": "Polaris-Page-Header__Actions",
  "longTitle": "Polaris-Page-Header--longTitle",
  "mediumTitle": "Polaris-Page-Header--mediumTitle",
  "isSingleRow": "Polaris-Page-Header--isSingleRow"
};
var styles$1 = {
  "Title": "Polaris-Header-Title",
  "TitleWithSubtitle": "Polaris-Header-Title__TitleWithSubtitle",
  "TitleWrapper": "Polaris-Header-Title__TitleWrapper",
  "SubTitle": "Polaris-Header-Title__SubTitle",
  "SubtitleCompact": "Polaris-Header-Title__SubtitleCompact",
  "SubtitleMaxWidth": "Polaris-Header-Title__SubtitleMaxWidth"
};
function Title({
  title,
  subtitle,
  titleMetadata,
  compactTitle,
  hasSubtitleMaxWidth
}) {
  const className = classNames(styles$1.Title, subtitle && styles$1.TitleWithSubtitle);
  const titleMarkup = title ? /* @__PURE__ */ React.createElement("h1", {
    className
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "headingLg",
    fontWeight: "bold"
  }, title)) : null;
  const titleMetadataMarkup = titleMetadata ? /* @__PURE__ */ React.createElement(Bleed, {
    marginBlock: "100"
  }, titleMetadata) : null;
  const wrappedTitleMarkup = /* @__PURE__ */ React.createElement("div", {
    className: styles$1.TitleWrapper
  }, titleMarkup, titleMetadataMarkup);
  const subtitleMarkup = subtitle ? /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$1.SubTitle, compactTitle && styles$1.SubtitleCompact, hasSubtitleMaxWidth && styles$1.SubtitleMaxWidth)
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "p",
    variant: "bodySm",
    tone: "subdued"
  }, subtitle)) : null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, wrappedTitleMarkup, subtitleMarkup);
}
const SHORT_TITLE = 20;
const REALLY_SHORT_TITLE = 8;
const LONG_TITLE = 34;
function Header({
  title,
  subtitle,
  pageReadyAccessibilityLabel,
  titleMetadata,
  additionalMetadata,
  titleHidden = false,
  primaryAction,
  pagination,
  filterActions,
  backAction,
  secondaryActions = [],
  actionGroups = [],
  compactTitle = false,
  onActionRollup
}) {
  const i18n = useI18n();
  const {
    isNavigationCollapsed
  } = useMediaQuery();
  const isSingleRow = !primaryAction && !pagination && (isInterface(secondaryActions) && !secondaryActions.length || isReactElement(secondaryActions)) && !actionGroups.length;
  const hasActionGroupsOrSecondaryActions = actionGroups.length > 0 || isInterface(secondaryActions) && secondaryActions.length > 0 || isReactElement(secondaryActions);
  const breadcrumbMarkup = backAction ? /* @__PURE__ */ React.createElement("div", {
    className: styles$2.BreadcrumbWrapper
  }, /* @__PURE__ */ React.createElement(Box, {
    maxWidth: "100%",
    paddingInlineEnd: "100",
    printHidden: true
  }, /* @__PURE__ */ React.createElement(Breadcrumbs, {
    backAction
  }))) : null;
  const paginationMarkup = pagination && !isNavigationCollapsed ? /* @__PURE__ */ React.createElement("div", {
    className: styles$2.PaginationWrapper
  }, /* @__PURE__ */ React.createElement(Box, {
    printHidden: true
  }, /* @__PURE__ */ React.createElement(Pagination, Object.assign({}, pagination, {
    hasPrevious: pagination.hasPrevious,
    hasNext: pagination.hasNext
  })))) : null;
  const pageTitleMarkup = /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$2.TitleWrapper, !hasActionGroupsOrSecondaryActions && styles$2.TitleWrapperExpand)
  }, /* @__PURE__ */ React.createElement(Title, {
    title,
    subtitle,
    titleMetadata,
    compactTitle,
    hasSubtitleMaxWidth: hasActionGroupsOrSecondaryActions
  }));
  const labelForPageReadyAccessibilityLabel = pageReadyAccessibilityLabel || title;
  const pageReadyAccessibilityLabelMarkup = labelForPageReadyAccessibilityLabel ? /* @__PURE__ */ React.createElement("div", {
    role: "status"
  }, /* @__PURE__ */ React.createElement(Text, {
    visuallyHidden: true,
    as: "p"
  }, i18n.translate("Polaris.Page.Header.pageReadyAccessibilityLabel", {
    title: labelForPageReadyAccessibilityLabel
  }))) : void 0;
  const primaryActionMarkup = primaryAction ? /* @__PURE__ */ React.createElement(PrimaryActionMarkup, {
    primaryAction
  }) : null;
  let actionMenuMarkup = null;
  if (isInterface(secondaryActions) && (secondaryActions.length > 0 || hasGroupsWithActions(actionGroups))) {
    actionMenuMarkup = /* @__PURE__ */ React.createElement(ActionMenu, {
      actions: secondaryActions,
      groups: actionGroups,
      rollup: isNavigationCollapsed,
      rollupActionsLabel: title ? i18n.translate("Polaris.Page.Header.rollupActionsLabel", {
        title
      }) : void 0,
      onActionRollup
    });
  } else if (isReactElement(secondaryActions)) {
    actionMenuMarkup = /* @__PURE__ */ React.createElement(React.Fragment, null, secondaryActions);
  }
  const navigationMarkup = breadcrumbMarkup || paginationMarkup ? /* @__PURE__ */ React.createElement(Box, {
    printHidden: true,
    paddingBlockEnd: "100",
    paddingInlineEnd: actionMenuMarkup && isNavigationCollapsed ? "1000" : void 0
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400",
    align: "space-between",
    blockAlign: "center"
  }, breadcrumbMarkup, paginationMarkup)) : null;
  const additionalMetadataMarkup = additionalMetadata ? /* @__PURE__ */ React.createElement("div", {
    className: styles$2.AdditionalMetaData
  }, /* @__PURE__ */ React.createElement(Text, {
    tone: "subdued",
    as: "span",
    variant: "bodySm"
  }, additionalMetadata)) : null;
  const headerClassNames = classNames(isSingleRow && styles$2.isSingleRow, navigationMarkup && styles$2.hasNavigation, actionMenuMarkup && styles$2.hasActionMenu, isNavigationCollapsed && styles$2.mobileView, !backAction && styles$2.noBreadcrumbs, title && title.length < LONG_TITLE && styles$2.mediumTitle, title && title.length > LONG_TITLE && styles$2.longTitle);
  const {
    slot1,
    slot2,
    slot3,
    slot4,
    slot5
  } = determineLayout({
    actionMenuMarkup,
    additionalMetadataMarkup,
    breadcrumbMarkup,
    isNavigationCollapsed,
    pageTitleMarkup,
    paginationMarkup,
    primaryActionMarkup,
    title
  });
  return /* @__PURE__ */ React.createElement(Box, {
    position: "relative",
    paddingBlockStart: {
      xs: "400",
      md: "600"
    },
    paddingBlockEnd: {
      xs: "400",
      md: "600"
    },
    paddingInlineStart: {
      xs: "400",
      sm: "0"
    },
    paddingInlineEnd: {
      xs: "400",
      sm: "0"
    },
    visuallyHidden: titleHidden
  }, pageReadyAccessibilityLabelMarkup, /* @__PURE__ */ React.createElement("div", {
    className: headerClassNames
  }, /* @__PURE__ */ React.createElement(FilterActionsProvider, {
    filterActions: Boolean(filterActions)
  }, /* @__PURE__ */ React.createElement(ConditionalRender, {
    condition: [slot1, slot2, slot3, slot4].some(notNull)
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$2.Row
  }, slot1, slot2, /* @__PURE__ */ React.createElement(ConditionalRender, {
    condition: [slot3, slot4].some(notNull)
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$2.RightAlign
  }, /* @__PURE__ */ React.createElement(ConditionalWrapper, {
    condition: [slot3, slot4].every(notNull),
    wrapper: (children) => /* @__PURE__ */ React.createElement("div", {
      className: styles$2.Actions
    }, children)
  }, slot3, slot4))))), /* @__PURE__ */ React.createElement(ConditionalRender, {
    condition: [slot5].some(notNull)
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$2.Row
  }, /* @__PURE__ */ React.createElement(InlineStack, {
    gap: "400"
  }, slot5))))));
}
function PrimaryActionMarkup({
  primaryAction
}) {
  const {
    isNavigationCollapsed
  } = useMediaQuery();
  let actionMarkup;
  if (isInterface(primaryAction)) {
    const {
      primary: isPrimary,
      helpText
    } = primaryAction;
    const primary = isPrimary === void 0 ? true : isPrimary;
    const content = buttonFrom(shouldShowIconOnly(isNavigationCollapsed, primaryAction), {
      variant: primary ? "primary" : void 0
    });
    actionMarkup = helpText ? /* @__PURE__ */ React.createElement(Tooltip, {
      content: helpText
    }, content) : content;
  } else {
    actionMarkup = primaryAction;
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$2.PrimaryActionWrapper
  }, /* @__PURE__ */ React.createElement(Box, {
    printHidden: true
  }, actionMarkup));
}
function shouldShowIconOnly(isMobile, action2) {
  let {
    content,
    accessibilityLabel
  } = action2;
  const {
    icon
  } = action2;
  if (icon == null) return {
    ...action2,
    icon: void 0
  };
  if (isMobile) {
    accessibilityLabel = accessibilityLabel || content;
    content = void 0;
  }
  return {
    ...action2,
    content,
    accessibilityLabel,
    icon
  };
}
function notNull(value) {
  return value != null;
}
function determineLayout({
  actionMenuMarkup,
  additionalMetadataMarkup,
  breadcrumbMarkup,
  isNavigationCollapsed,
  pageTitleMarkup,
  paginationMarkup,
  primaryActionMarkup,
  title
}) {
  const layouts = {
    mobileCompact: {
      slots: {
        slot1: null,
        slot2: pageTitleMarkup,
        slot3: actionMenuMarkup,
        slot4: primaryActionMarkup,
        slot5: additionalMetadataMarkup
      },
      condition: isNavigationCollapsed && breadcrumbMarkup == null && title != null && title.length <= REALLY_SHORT_TITLE
    },
    mobileDefault: {
      slots: {
        slot1: breadcrumbMarkup,
        slot2: pageTitleMarkup,
        slot3: actionMenuMarkup,
        slot4: primaryActionMarkup,
        slot5: additionalMetadataMarkup
      },
      condition: isNavigationCollapsed
    },
    desktopCompact: {
      slots: {
        slot1: breadcrumbMarkup,
        slot2: pageTitleMarkup,
        slot3: actionMenuMarkup,
        slot4: primaryActionMarkup,
        slot5: additionalMetadataMarkup
      },
      condition: !isNavigationCollapsed && paginationMarkup == null && actionMenuMarkup == null && title != null && title.length <= SHORT_TITLE
    },
    desktopDefault: {
      slots: {
        slot1: breadcrumbMarkup,
        slot2: pageTitleMarkup,
        slot3: /* @__PURE__ */ React.createElement(React.Fragment, null, actionMenuMarkup, primaryActionMarkup),
        slot4: paginationMarkup,
        slot5: additionalMetadataMarkup
      },
      condition: !isNavigationCollapsed
    }
  };
  const layout = Object.values(layouts).find((layout2) => layout2.condition) || layouts.desktopDefault;
  return layout.slots;
}
function Page({
  children,
  fullWidth,
  narrowWidth,
  ...rest
}) {
  const pageClassName = classNames(styles$3.Page, fullWidth && styles$3.fullWidth, narrowWidth && styles$3.narrowWidth);
  const hasHeaderContent = rest.title != null && rest.title !== "" || rest.subtitle != null && rest.subtitle !== "" || rest.primaryAction != null || rest.secondaryActions != null && (isInterface(rest.secondaryActions) && rest.secondaryActions.length > 0 || isReactElement(rest.secondaryActions)) || rest.actionGroups != null && rest.actionGroups.length > 0 || rest.backAction != null;
  const contentClassName = classNames(!hasHeaderContent && styles$3.Content);
  const headerMarkup = hasHeaderContent ? /* @__PURE__ */ React.createElement(Header, Object.assign({
    filterActions: true
  }, rest)) : null;
  return /* @__PURE__ */ React.createElement("div", {
    className: pageClassName
  }, headerMarkup, /* @__PURE__ */ React.createElement("div", {
    className: contentClassName
  }, children));
}
var styles = {
  "Select": "Polaris-Select",
  "disabled": "Polaris-Select--disabled",
  "error": "Polaris-Select--error",
  "Backdrop": "Polaris-Select__Backdrop",
  "Input": "Polaris-Select__Input",
  "Content": "Polaris-Select__Content",
  "InlineLabel": "Polaris-Select__InlineLabel",
  "Icon": "Polaris-Select__Icon",
  "SelectedOption": "Polaris-Select__SelectedOption",
  "Prefix": "Polaris-Select__Prefix",
  "hover": "Polaris-Select--hover",
  "toneMagic": "Polaris-Select--toneMagic"
};
const PLACEHOLDER_VALUE = "";
function Select({
  options: optionsProp,
  label,
  labelAction,
  labelHidden: labelHiddenProp,
  labelInline,
  disabled,
  helpText,
  placeholder,
  id: idProp,
  name,
  value = PLACEHOLDER_VALUE,
  error,
  onChange,
  onFocus,
  onBlur,
  requiredIndicator,
  tone
}) {
  const {
    value: focused,
    toggle: toggleFocused
  } = useToggle(false);
  const uniqId = useId();
  const id = idProp ?? uniqId;
  const labelHidden = labelInline ? true : labelHiddenProp;
  const className = classNames(styles.Select, error && styles.error, tone && styles[variationName("tone", tone)], disabled && styles.disabled);
  const handleFocus = useCallback((event) => {
    toggleFocused();
    onFocus == null ? void 0 : onFocus(event);
  }, [onFocus, toggleFocused]);
  const handleBlur = useCallback((event) => {
    toggleFocused();
    onBlur == null ? void 0 : onBlur(event);
  }, [onBlur, toggleFocused]);
  const handleChange = onChange ? (event) => onChange(event.currentTarget.value, id) : void 0;
  const describedBy = [];
  if (helpText) {
    describedBy.push(helpTextID$1(id));
  }
  if (error) {
    describedBy.push(`${id}Error`);
  }
  const options = optionsProp || [];
  let normalizedOptions = options.map(normalizeOption);
  if (placeholder) {
    normalizedOptions = [{
      label: placeholder,
      value: PLACEHOLDER_VALUE,
      disabled: true
    }, ...normalizedOptions];
  }
  const inlineLabelMarkup = labelInline && /* @__PURE__ */ React.createElement(Box, {
    paddingInlineEnd: "100"
  }, /* @__PURE__ */ React.createElement(Text, {
    as: "span",
    variant: "bodyMd",
    tone: tone && tone === "magic" && !focused ? "magic-subdued" : "subdued",
    truncate: true
  }, label));
  const selectedOption = getSelectedOption(normalizedOptions, value);
  const prefixMarkup = selectedOption.prefix && /* @__PURE__ */ React.createElement("div", {
    className: styles.Prefix
  }, selectedOption.prefix);
  const contentMarkup = /* @__PURE__ */ React.createElement("div", {
    className: styles.Content,
    "aria-hidden": true,
    "aria-disabled": disabled
  }, inlineLabelMarkup, prefixMarkup, /* @__PURE__ */ React.createElement("span", {
    className: styles.SelectedOption
  }, selectedOption.label), /* @__PURE__ */ React.createElement("span", {
    className: styles.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: SelectIcon
  })));
  const optionsMarkup = normalizedOptions.map(renderOption);
  return /* @__PURE__ */ React.createElement(Labelled, {
    id,
    label,
    error,
    action: labelAction,
    labelHidden,
    helpText,
    requiredIndicator,
    disabled
  }, /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("select", {
    id,
    name,
    value,
    className: styles.Input,
    disabled,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy.length ? describedBy.join(" ") : void 0,
    "aria-required": requiredIndicator
  }, optionsMarkup), contentMarkup, /* @__PURE__ */ React.createElement("div", {
    className: styles.Backdrop
  })));
}
function isString(option) {
  return typeof option === "string";
}
function isGroup(option) {
  return typeof option === "object" && "options" in option && option.options != null;
}
function normalizeStringOption(option) {
  return {
    label: option,
    value: option
  };
}
function normalizeOption(option) {
  if (isString(option)) {
    return normalizeStringOption(option);
  } else if (isGroup(option)) {
    const {
      title,
      options
    } = option;
    return {
      title,
      options: options.map((option2) => {
        return isString(option2) ? normalizeStringOption(option2) : option2;
      })
    };
  }
  return option;
}
function getSelectedOption(options, value) {
  const flatOptions = flattenOptions(options);
  let selectedOption = flatOptions.find((option) => value === option.value);
  if (selectedOption === void 0) {
    selectedOption = flatOptions.find((option) => !option.hidden);
  }
  return selectedOption || {
    value: "",
    label: ""
  };
}
function flattenOptions(options) {
  let flatOptions = [];
  options.forEach((optionOrGroup) => {
    if (isGroup(optionOrGroup)) {
      flatOptions = flatOptions.concat(optionOrGroup.options);
    } else {
      flatOptions.push(optionOrGroup);
    }
  });
  return flatOptions;
}
function renderSingleOption(option) {
  const {
    value,
    label,
    prefix: _prefix,
    key,
    ...rest
  } = option;
  return /* @__PURE__ */ React.createElement("option", Object.assign({
    key: key ?? value,
    value
  }, rest), label);
}
function renderOption(optionOrGroup) {
  if (isGroup(optionOrGroup)) {
    const {
      title,
      options
    } = optionOrGroup;
    return /* @__PURE__ */ React.createElement("optgroup", {
      label: title,
      key: title
    }, options.map(renderSingleOption));
  }
  return renderSingleOption(optionOrGroup);
}
const Polaris$1 = { "Avatar": { "label": "アバター", "labelWithInitials": "頭文字が{initials}のアバター" }, "Autocomplete": { "spinnerAccessibilityLabel": "読み込み中", "ellipsis": "{content}..." }, "Badge": { "PROGRESS_LABELS": { "incomplete": "未完了", "partiallyComplete": "一部完了済み", "complete": "完了" }, "TONE_LABELS": { "info": "情報", "success": "成功", "warning": "警告", "attention": "注意", "new": "新規", "critical": "重大", "readOnly": "読み取り専用", "enabled": "有効" }, "progressAndTone": "{toneLabel} {progressLabel}" }, "Banner": { "dismissButton": "通知を閉じる" }, "Button": { "spinnerAccessibilityLabel": "読み込み中" }, "Common": { "checkbox": "チェックボックス", "undo": "元に戻す", "cancel": "キャンセル", "clear": "クリア", "close": "閉じる", "submit": "送信", "more": "その他" }, "ContextualSaveBar": { "save": "保存", "discard": "破棄" }, "DataTable": { "sortAccessibilityLabel": "で{direction}を並び替える", "navAccessibilityLabel": "表{direction}を1列スクロールする", "totalsRowHeading": "合計", "totalRowHeading": "合計" }, "DatePicker": { "previousMonth": "先月 ({showPreviousYear}{previousMonthName}) を表示", "nextMonth": "来月 ({nextYear}{nextMonth}) を表示", "today": "今日 ", "months": { "january": "1月", "february": "2月", "march": "3月", "april": "4月", "may": "5月", "june": "6月", "july": "7月", "august": "8月", "september": "9月", "october": "10月", "november": "11月", "december": "12月" }, "daysAbbreviated": { "monday": "月曜日", "tuesday": "火曜日", "wednesday": "水曜日", "thursday": "木曜日", "friday": "金曜日", "saturday": "土曜日", "sunday": "日曜日" }, "days": { "monday": "月曜日", "tuesday": "火曜日", "wednesday": "水曜日", "thursday": "木曜日", "friday": "金曜日", "saturday": "土曜日", "sunday": "日曜日" }, "start": "範囲の開始", "end": "範囲の終了" }, "DiscardConfirmationModal": { "title": "保存されていないすべての変更を破棄", "message": "変更を破棄すると、最後に保存した後に編集した内容が削除されます。", "primaryAction": "変更を破棄", "secondaryAction": "編集を続ける" }, "DropZone": { "errorOverlayTextFile": "ファイルタイプが有効ではありません", "errorOverlayTextImage": "画像タイプが有効ではありません", "single": { "overlayTextFile": "ファイルをドロップしてアップロード", "overlayTextImage": "画像をドロップしてアップロード", "actionTitleFile": "ファイルを追加", "actionTitleImage": "画像を追加", "actionHintFile": "またはファイルをドロップしてアップロード", "actionHintImage": "または、画像をドロップしてアップロード", "labelFile": "ファイルをアップロード", "labelImage": "画像をアップロード", "overlayTextVideo": "ビデオをドロップしてアップロードする", "actionTitleVideo": "ビデオを追加する", "actionHintVideo": "または、ビデオをドロップしてアップロードする", "labelVideo": "ビデオをアップロード" }, "allowMultiple": { "overlayTextFile": "ファイルをドロップしてアップロード", "overlayTextImage": "画像をドロップしてアップロード", "actionTitleFile": "ファイルを追加する", "actionTitleImage": "画像を追加", "actionHintFile": "または、ファイルをドロップしてアップロードする", "actionHintImage": "または、画像をドロップしてアップロード", "labelFile": "ファイルをアップロード", "labelImage": "画像をアップロード", "overlayTextVideo": "ビデオをドロップしてアップロードする", "actionTitleVideo": "ビデオを追加する", "actionHintVideo": "または、ビデオをドロップしてアップロードする", "labelVideo": "ビデオをアップロード" }, "errorOverlayTextVideo": "ビデオタイプが有効ではありません" }, "EmptySearchResult": { "altText": "空の検索結果" }, "Frame": { "skipToContent": "コンテンツにスキップ", "Navigation": { "closeMobileNavigationLabel": "メニューを閉じる" }, "navigationLabel": "メニュー" }, "ActionMenu": { "RollupActions": { "rollupButton": "アクションを表示" }, "Actions": { "moreActions": "その他の操作" } }, "Filters": { "moreFilters": "詳細な絞り込み", "filter": "フィルター{resourceName}", "noFiltersApplied": "絞り込みが適用されていません", "cancel": "キャンセル", "done": "完了", "clearAllFilters": "すべての絞り込みをクリアする", "clear": "クリア", "clearLabel": "{filterName}をクリアする", "moreFiltersWithCount": "詳細な絞り込み ({count})", "addFilter": "絞り込みを追加", "clearFilters": "すべてクリア", "searchInView": "{viewName}内" }, "Modal": { "iFrameTitle": "body markup", "modalWarning": "これらの必要なプロパティがモーダルにありません: {missingProps}" }, "Pagination": { "previous": "前へ", "next": "次へ", "pagination": "ページネーション" }, "ProgressBar": { "negativeWarningMessage": "進行中のプロパティに渡される値に負数は使用できません。{progress}を0にリセットする。", "exceedWarningMessage": "進行中のプロパティに渡される値は100を超えることはできません。{progress}を100に設定する。" }, "ResourceList": { "sortingLabel": "並び替え", "defaultItemSingular": "個", "defaultItemPlural": "アイテム", "showing": "{itemsCount}個の{resource}を表示中", "loading": "{resource}を読み込んでいます", "selected": "{selectedItemsCount}を選択済み", "allItemsSelected": "ストアにあるすべての{itemsLength}以上の{resourceNamePlural}が選択されています", "selectAllItems": "ストアにあるすべての{itemsLength}以上の{resourceNamePlural}を選択する", "emptySearchResultTitle": "{resourceNamePlural}が見つかりませんでした", "emptySearchResultDescription": "絞り込みや検索ワードを変更してみてください", "selectButtonText": "選択", "a11yCheckboxDeselectAllSingle": "{resourceNameSingular}の選択を解除する", "a11yCheckboxSelectAllSingle": "{resourceNameSingular}を選択する", "a11yCheckboxDeselectAllMultiple": "すべての{itemsLength}の{resourceNamePlural}の選択を解除する", "a11yCheckboxSelectAllMultiple": "すべての{itemsLength}の{resourceNamePlural}を選択する", "Item": { "actionsDropdownLabel": "{accessibilityLabel}のアクション", "actionsDropdown": "アクションドロップダウン", "viewItem": "{itemName}の詳細を表示する" }, "BulkActions": { "actionsActivatorLabel": "アクション", "moreActionsActivatorLabel": "その他の操作" }, "showingTotalCount": "{totalItemsCount}の{itemsCount}、{resource}を表示中", "allFilteredItemsSelected": "この絞り込み内の{itemsLength}と{resourceNamePlural}がすべて選択されます", "selectAllFilteredItems": "この絞り込みの{itemsLength}と{resourceNamePlural}をすべて選択する" }, "SkeletonPage": { "loadingLabel": "ページを読み込み中" }, "Tabs": { "toggleTabsLabel": "その他のビュー", "newViewAccessibilityLabel": "新たなビューを作成", "newViewTooltip": "ビューを作成", "Tab": { "rename": "ビューの名前を変更", "duplicate": "ビューを複製", "edit": "ビューを編集", "editColumns": "列を編集", "delete": "ビューを削除", "copy": "{name}のコピー", "deleteModal": { "title": "ビューを削除しますか？", "description": "これは元に戻せません。{viewName}ビューは管理画面で使用できなくなります。", "cancel": "キャンセル", "delete": "ビューを削除" } }, "RenameModal": { "title": "ビューの名前を変更する", "label": "名前", "cancel": "キャンセル", "create": "保存", "errors": { "sameName": "この名前のビューはすでに存在しています。別の名前を選択してください。" } }, "DuplicateModal": { "title": "ビューを複製する", "label": "名前", "cancel": "キャンセル", "create": "ビューを作成", "errors": { "sameName": "この名前のビューはすでに存在しています。別の名前を選択してください。" } }, "CreateViewModal": { "title": "新たなビューを作成する", "label": "名前", "cancel": "キャンセル", "create": "ビューを作成", "errors": { "sameName": "この名前のビューはすでに存在しています。別の名前を選択してください。" } } }, "Tag": { "ariaLabel": "{children}を削除" }, "TextField": { "characterCount": "{count}文字", "characterCountWithMaxLength": "{limit}中{count}の文字を使用" }, "TopBar": { "toggleMenuLabel": "メニューを切り替える", "SearchField": { "clearButtonLabel": "クリア", "search": "検索" } }, "MediaCard": { "popoverButton": "アクション", "dismissButton": "閉じる" }, "VideoThumbnail": { "playButtonA11yLabel": { "default": "ビデオを再生", "defaultWithDuration": "長さ{duration}の動画を再生する", "duration": { "hours": { "other": { "only": "{hourCount}時間", "andMinutes": "{hourCount}時間{minuteCount}分", "andMinute": "{hourCount}時間{minuteCount}分", "minutesAndSeconds": "{hourCount}時間{minuteCount}分{secondCount}秒", "minutesAndSecond": "{hourCount}時間{minuteCount}分{secondCount}秒", "minuteAndSeconds": "{hourCount}時間{minuteCount}分{secondCount}秒", "minuteAndSecond": "{hourCount}時間{minuteCount}分{secondCount}秒", "andSeconds": "{hourCount}時間{secondCount}秒", "andSecond": "{hourCount}時間{secondCount}秒" }, "one": { "only": "{hourCount}時間", "andMinutes": "{hourCount}時間{minuteCount}分", "andMinute": "{hourCount}時間{minuteCount}分", "minutesAndSeconds": "{hourCount}時間{minuteCount}分{secondCount}秒", "minutesAndSecond": "{hourCount}時間{minuteCount}分{secondCount}秒", "minuteAndSeconds": "{hourCount}時間{minuteCount}分{secondCount}秒", "minuteAndSecond": "{hourCount}時間{minuteCount}分{secondCount}秒", "andSeconds": "{hourCount}時間{secondCount}秒", "andSecond": "{hourCount}時間{secondCount}秒" } }, "minutes": { "other": { "only": "{minuteCount}分", "andSeconds": "{minuteCount}分{secondCount}秒", "andSecond": "{minuteCount}分{secondCount}秒" }, "one": { "only": "{minuteCount}分", "andSeconds": "{minuteCount}分{secondCount}秒", "andSecond": "{minuteCount}分{secondCount}秒" } }, "seconds": { "other": "{secondCount}秒", "one": "{secondCount}秒" } } } }, "Loading": { "label": "ページの読み込み表示バー" }, "TooltipOverlay": { "accessibilityLabel": "ツールチップ: {label}" }, "IndexProvider": { "defaultItemSingular": "アイテム", "defaultItemPlural": "アイテム", "allItemsSelected": "すべての{itemsLength}+{resourceNamePlural}が選択されています", "selected": "{selectedItemsCount}を選択済み", "a11yCheckboxDeselectAllSingle": "{resourceNameSingular}の選択を解除する", "a11yCheckboxSelectAllSingle": "{resourceNameSingular}を選択する", "a11yCheckboxDeselectAllMultiple": "すべての{itemsLength}の{resourceNamePlural}の選択を解除する", "a11yCheckboxSelectAllMultiple": "すべての{itemsLength}の{resourceNamePlural}を選択する" }, "IndexTable": { "emptySearchTitle": "{resourceNamePlural}が見つかりませんでした", "emptySearchDescription": "絞り込みや検索ワードを変更してみてください", "onboardingBadgeText": "新規", "resourceLoadingAccessibilityLabel": "{resourceNamePlural}を読み込んでいます...", "selectAllLabel": "すべての{resourceNamePlural}を選択する", "selected": "{selectedItemsCount}を選択済み", "undo": "元に戻す", "selectAllItems": "すべての{itemsLength}+{resourceNamePlural}を選択する", "selectItem": "{resourceName}を選択する", "selectButtonText": "選択", "sortAccessibilityLabel": "で{direction}を並び替える" }, "Page": { "Header": { "rollupActionsLabel": "{title}のアクションを表示", "pageReadyAccessibilityLabel": "{title}。このページの準備が整いました" } }, "FullscreenBar": { "back": "戻る", "accessibilityLabel": "フルスクリーンモードを閉じる" }, "FilterPill": { "clear": "クリア", "unsavedChanges": "未保存の変更 - {label}" }, "IndexFilters": { "searchFilterTooltip": "検索と絞り込み", "searchFilterTooltipWithShortcut": "検索と絞り込み (F)", "searchFilterAccessibilityLabel": "検索と絞り込みの結果", "sort": "検索結果を並べ替える", "addView": "新たなビューを追加", "newView": "カスタム検索", "SortButton": { "ariaLabel": "検索結果を並べ替える", "tooltip": "並び替え", "title": "並び替え", "sorting": { "asc": "昇順", "desc": "降順", "az": "A～Z", "za": "Z～A" } }, "UpdateButtons": { "cancel": "キャンセル", "update": "アップデート", "save": "保存", "saveAs": "名前を付けて保存", "modal": { "title": "表示内容を保存", "label": "名前", "sameName": "この名前のビューはすでに存在しています。別の名前を選択してください。", "save": "保存", "cancel": "キャンセル" } }, "EditColumnsButton": { "tooltip": "列を編集", "accessibilityLabel": "表の列の順序および表示をカスタマイズする" } }, "ActionList": { "SearchField": { "clearButtonLabel": "クリア", "search": "検索", "placeholder": "アクションを検索" } } };
const ja = {
  Polaris: Polaris$1
};
const polarisStyles = "/assets/styles-C7YjYK5e.css";
const links$2 = () => [
  { rel: "stylesheet", href: polarisStyles }
];
function App$2() {
  return /* @__PURE__ */ jsxs("html", { lang: "ja", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(AppProvider, { i18n: ja, children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$2,
  links: links$2
}, Symbol.toStringTag, { value: "Module" }));
const action$8 = async ({ request }) => {
  const raw = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = createHmac("sha256", process.env.SHOPIFY_API_SECRET).update(raw, "utf8").digest("base64");
  const valid = hmac.length === digest.length && timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
  if (!valid) return new Response("unauthorized", { status: 401 });
  console.log("Customer data request received:", JSON.parse(raw));
  return new Response("ok", { status: 200 });
};
const loader$b = () => new Response(null, { status: 405 });
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const action$7 = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma$1.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$7
}, Symbol.toStringTag, { value: "Module" }));
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const action$6 = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  try {
    await prisma$1.$transaction([
      // セッションデータ削除
      prisma$1.session.deleteMany({ where: { shop } }),
      // 商品選択データ削除
      prisma$1.selectedProduct.deleteMany({ where: { shopDomain: shop } }),
      // ショップ設定削除
      prisma$1.shopSetting.deleteMany({ where: { shopDomain: shop } })
      // 実行ログは監査のため残す（必要に応じて削除）
      // db.priceUpdateLog.deleteMany({ where: { shopDomain: shop } }),
    ]);
    console.log(`Successfully cleaned up all data for shop: ${shop}`);
  } catch (error) {
    console.error(`Error cleaning up data for shop ${shop}:`, error);
  }
  return new Response();
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$a = async ({ request }) => {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  const state = url.searchParams.get("state");
  url.searchParams.get("code");
  if (url.searchParams.has("health")) {
    return json({ ok: true, path: url.pathname });
  }
  if (uid && state) {
    try {
      const tokenRes = await fetch("https://api.next-engine.org/api_neauth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          uid,
          state,
          client_id: process.env.NE_CLIENT_ID,
          client_secret: process.env.NE_CLIENT_SECRET
        })
      });
      const tokens = await tokenRes.json();
      if (tokens.access_token) {
        const html = `
          <h1>NextEngine 認証成功</h1>
          <p>トークンを取得しました。以下の値をconfig.jsonに保存してください：</p>
          <pre>
{
  "access_token": "${tokens.access_token}",
  "refresh_token": "${tokens.refresh_token || "なし"}",
  "expires_in": ${tokens.expires_in || "なし"}
}
          </pre>
          <p><strong>config.jsonのaccess_tokenとrefresh_tokenを上記の値で更新してください。</strong></p>
        `;
        return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
      } else {
        return json({ error: "token_exchange_failed", response: tokens }, { status: 400 });
      }
    } catch (error) {
      return json({ error: "api_call_failed", message: String(error) }, { status: 500 });
    }
  }
  return json({ error: "missing_uid_or_code", received: Object.fromEntries(url.searchParams.entries()) }, { status: 400 });
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
async function sendViaSendGrid(to, subject, html, text) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com" },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html }
      ]
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${error}`);
  }
  return { messageId: response.headers.get("x-message-id") || "sendgrid-sent" };
}
async function sendViaResend(to, subject, html, text) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to,
      subject,
      html,
      text
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }
  const result = await response.json();
  return { messageId: result.id };
}
async function sendPriceUpdateNotification(toEmail, data) {
  if (!toEmail) {
    return { success: false, error: "メールアドレスが設定されていません" };
  }
  try {
    const subject = `[${data.shopDomain}] 価格自動更新完了 - ${data.updatedCount}件更新`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">🔄 価格自動更新が完了しました</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 更新結果</h3>
          <ul>
            <li><strong>ショップ:</strong> ${data.shopDomain}</li>
            <li><strong>実行時刻:</strong> ${new Date(data.timestamp).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</li>
            <li><strong>更新成功:</strong> ${data.updatedCount}件</li>
            <li><strong>更新失敗:</strong> ${data.failedCount}件</li>
          </ul>
        </div>

        ${data.goldRatio || data.platinumRatio ? `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>💰 価格変動情報</h3>
          <ul>
            ${data.goldRatio ? `<li><strong>🥇 金:</strong> ${data.goldRatio}</li>` : ""}
            ${data.platinumRatio ? `<li><strong>🥈 プラチナ:</strong> ${data.platinumRatio}</li>` : ""}
          </ul>
        </div>` : ""}

        ${data.failedCount > 0 ? `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c62828;">⚠️ 注意事項</h3>
          <p>${data.failedCount}件の商品で価格更新に失敗しました。管理画面でログを確認してください。</p>
        </div>` : ""}

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📱 次の操作:</strong></p>
          <ul>
            <li>更新結果の詳細は管理画面の「ログ」ページで確認できます</li>
            <li>Shopify管理画面で実際の商品価格をご確認ください</li>
            <li>問題がある場合は、アプリの設定を見直してください</li>
          </ul>
        </div>

        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          この通知は金・プラチナ価格自動更新アプリから送信されています。<br>
          通知設定はアプリの「設定」ページから変更できます。
        </p>
      </div>
    `;
    const textContent = `
[${data.shopDomain}] 価格自動更新が完了しました

📊 更新結果:
- ショップ: ${data.shopDomain}
- 実行時刻: ${new Date(data.timestamp).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
- 更新成功: ${data.updatedCount}件
- 更新失敗: ${data.failedCount}件

${data.goldRatio ? `🥇 金: ${data.goldRatio}
` : ""}${data.platinumRatio ? `🥈 プラチナ: ${data.platinumRatio}
` : ""}
${data.failedCount > 0 ? `
⚠️ ${data.failedCount}件の商品で更新に失敗しました。管理画面でログを確認してください。
` : ""}
詳細な結果は管理画面の「ログ」ページでご確認ください。
    `;
    let result;
    if (process.env.RESEND_API_KEY) {
      result = await sendViaResend(toEmail, subject, htmlContent, textContent);
    } else if (process.env.SENDGRID_API_KEY) {
      result = await sendViaSendGrid(toEmail, subject, htmlContent, textContent);
    } else {
      console.log("📧 [開発モード] メール通知:");
      console.log(`宛先: ${toEmail}`);
      console.log(`件名: ${subject}`);
      console.log(`本文:
${textContent}`);
      result = { messageId: "console-output" };
    }
    console.log(`📧 通知メール送信成功: ${toEmail} (MessageID: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("📧 メール送信エラー:", error);
    return {
      success: false,
      error: `メール送信に失敗しました: ${error.message}`
    };
  }
}
async function sendTestEmail(toEmail) {
  if (!toEmail) {
    return { success: false, error: "メールアドレスが設定されていません" };
  }
  const testData = {
    shopDomain: "test-shop.myshopify.com",
    updatedCount: 3,
    failedCount: 0,
    goldRatio: "+0.50%",
    platinumRatio: "-0.25%",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return await sendPriceUpdateNotification(toEmail, testData);
}
const action$5 = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const setting = await prisma$1.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true }
    });
    const email = setting == null ? void 0 : setting.notificationEmail;
    if (!email) {
      return json({
        success: false,
        error: "通知メールアドレスが設定されていません"
      });
    }
    const result = await sendTestEmail(email);
    if (result.success) {
      return json({
        success: true,
        email,
        message: "テストメールを送信しました"
      });
    } else {
      return json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error("テストメール送信エラー:", error);
    return json({
      success: false,
      error: "メール送信処理でエラーが発生しました"
    });
  }
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = /* @__PURE__ */ JSON.parse('{"ActionMenu":{"Actions":{"moreActions":"More actions"},"RollupActions":{"rollupButton":"View actions"}},"ActionList":{"SearchField":{"clearButtonLabel":"Clear","search":"Search","placeholder":"Search actions"}},"Avatar":{"label":"Avatar","labelWithInitials":"Avatar with initials {initials}"},"Autocomplete":{"spinnerAccessibilityLabel":"Loading","ellipsis":"{content}…"},"Badge":{"PROGRESS_LABELS":{"incomplete":"Incomplete","partiallyComplete":"Partially complete","complete":"Complete"},"TONE_LABELS":{"info":"Info","success":"Success","warning":"Warning","critical":"Critical","attention":"Attention","new":"New","readOnly":"Read-only","enabled":"Enabled"},"progressAndTone":"{toneLabel} {progressLabel}"},"Banner":{"dismissButton":"Dismiss notification"},"Button":{"spinnerAccessibilityLabel":"Loading"},"Common":{"checkbox":"checkbox","undo":"Undo","cancel":"Cancel","clear":"Clear","close":"Close","submit":"Submit","more":"More"},"ContextualSaveBar":{"save":"Save","discard":"Discard"},"DataTable":{"sortAccessibilityLabel":"sort {direction} by","navAccessibilityLabel":"Scroll table {direction} one column","totalsRowHeading":"Totals","totalRowHeading":"Total"},"DatePicker":{"previousMonth":"Show previous month, {previousMonthName} {showPreviousYear}","nextMonth":"Show next month, {nextMonth} {nextYear}","today":"Today ","start":"Start of range","end":"End of range","months":{"january":"January","february":"February","march":"March","april":"April","may":"May","june":"June","july":"July","august":"August","september":"September","october":"October","november":"November","december":"December"},"days":{"monday":"Monday","tuesday":"Tuesday","wednesday":"Wednesday","thursday":"Thursday","friday":"Friday","saturday":"Saturday","sunday":"Sunday"},"daysAbbreviated":{"monday":"Mo","tuesday":"Tu","wednesday":"We","thursday":"Th","friday":"Fr","saturday":"Sa","sunday":"Su"}},"DiscardConfirmationModal":{"title":"Discard all unsaved changes","message":"If you discard changes, you’ll delete any edits you made since you last saved.","primaryAction":"Discard changes","secondaryAction":"Continue editing"},"DropZone":{"single":{"overlayTextFile":"Drop file to upload","overlayTextImage":"Drop image to upload","overlayTextVideo":"Drop video to upload","actionTitleFile":"Add file","actionTitleImage":"Add image","actionTitleVideo":"Add video","actionHintFile":"or drop file to upload","actionHintImage":"or drop image to upload","actionHintVideo":"or drop video to upload","labelFile":"Upload file","labelImage":"Upload image","labelVideo":"Upload video"},"allowMultiple":{"overlayTextFile":"Drop files to upload","overlayTextImage":"Drop images to upload","overlayTextVideo":"Drop videos to upload","actionTitleFile":"Add files","actionTitleImage":"Add images","actionTitleVideo":"Add videos","actionHintFile":"or drop files to upload","actionHintImage":"or drop images to upload","actionHintVideo":"or drop videos to upload","labelFile":"Upload files","labelImage":"Upload images","labelVideo":"Upload videos"},"errorOverlayTextFile":"File type is not valid","errorOverlayTextImage":"Image type is not valid","errorOverlayTextVideo":"Video type is not valid"},"EmptySearchResult":{"altText":"Empty search results"},"Frame":{"skipToContent":"Skip to content","navigationLabel":"Navigation","Navigation":{"closeMobileNavigationLabel":"Close navigation"}},"FullscreenBar":{"back":"Back","accessibilityLabel":"Exit fullscreen mode"},"Filters":{"moreFilters":"More filters","moreFiltersWithCount":"More filters ({count})","filter":"Filter {resourceName}","noFiltersApplied":"No filters applied","cancel":"Cancel","done":"Done","clearAllFilters":"Clear all filters","clear":"Clear","clearLabel":"Clear {filterName}","addFilter":"Add filter","clearFilters":"Clear all","searchInView":"in:{viewName}"},"FilterPill":{"clear":"Clear","unsavedChanges":"Unsaved changes - {label}"},"IndexFilters":{"searchFilterTooltip":"Search and filter","searchFilterTooltipWithShortcut":"Search and filter (F)","searchFilterAccessibilityLabel":"Search and filter results","sort":"Sort your results","addView":"Add a new view","newView":"Custom search","SortButton":{"ariaLabel":"Sort the results","tooltip":"Sort","title":"Sort by","sorting":{"asc":"Ascending","desc":"Descending","az":"A-Z","za":"Z-A"}},"EditColumnsButton":{"tooltip":"Edit columns","accessibilityLabel":"Customize table column order and visibility"},"UpdateButtons":{"cancel":"Cancel","update":"Update","save":"Save","saveAs":"Save as","modal":{"title":"Save view as","label":"Name","sameName":"A view with this name already exists. Please choose a different name.","save":"Save","cancel":"Cancel"}}},"IndexProvider":{"defaultItemSingular":"Item","defaultItemPlural":"Items","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} are selected","selected":"{selectedItemsCount} selected","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}"},"IndexTable":{"emptySearchTitle":"No {resourceNamePlural} found","emptySearchDescription":"Try changing the filters or search term","onboardingBadgeText":"New","resourceLoadingAccessibilityLabel":"Loading {resourceNamePlural}…","selectAllLabel":"Select all {resourceNamePlural}","selected":"{selectedItemsCount} selected","undo":"Undo","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural}","selectItem":"Select {resourceName}","selectButtonText":"Select","sortAccessibilityLabel":"sort {direction} by"},"Loading":{"label":"Page loading bar"},"Modal":{"iFrameTitle":"body markup","modalWarning":"These required properties are missing from Modal: {missingProps}"},"Page":{"Header":{"rollupActionsLabel":"View actions for {title}","pageReadyAccessibilityLabel":"{title}. This page is ready"}},"Pagination":{"previous":"Previous","next":"Next","pagination":"Pagination"},"ProgressBar":{"negativeWarningMessage":"Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.","exceedWarningMessage":"Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."},"ResourceList":{"sortingLabel":"Sort by","defaultItemSingular":"item","defaultItemPlural":"items","showing":"Showing {itemsCount} {resource}","showingTotalCount":"Showing {itemsCount} of {totalItemsCount} {resource}","loading":"Loading {resource}","selected":"{selectedItemsCount} selected","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} in your store are selected","allFilteredItemsSelected":"All {itemsLength}+ {resourceNamePlural} in this filter are selected","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural} in your store","selectAllFilteredItems":"Select all {itemsLength}+ {resourceNamePlural} in this filter","emptySearchResultTitle":"No {resourceNamePlural} found","emptySearchResultDescription":"Try changing the filters or search term","selectButtonText":"Select","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}","Item":{"actionsDropdownLabel":"Actions for {accessibilityLabel}","actionsDropdown":"Actions dropdown","viewItem":"View details for {itemName}"},"BulkActions":{"actionsActivatorLabel":"Actions","moreActionsActivatorLabel":"More actions"}},"SkeletonPage":{"loadingLabel":"Page loading"},"Tabs":{"newViewAccessibilityLabel":"Create new view","newViewTooltip":"Create view","toggleTabsLabel":"More views","Tab":{"rename":"Rename view","duplicate":"Duplicate view","edit":"Edit view","editColumns":"Edit columns","delete":"Delete view","copy":"Copy of {name}","deleteModal":{"title":"Delete view?","description":"This can’t be undone. {viewName} view will no longer be available in your admin.","cancel":"Cancel","delete":"Delete view"}},"RenameModal":{"title":"Rename view","label":"Name","cancel":"Cancel","create":"Save","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"DuplicateModal":{"title":"Duplicate view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"CreateViewModal":{"title":"Create new view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}}},"Tag":{"ariaLabel":"Remove {children}"},"TextField":{"characterCount":"{count} characters","characterCountWithMaxLength":"{count} of {limit} characters used"},"TooltipOverlay":{"accessibilityLabel":"Tooltip: {label}"},"TopBar":{"toggleMenuLabel":"Toggle menu","SearchField":{"clearButtonLabel":"Clear","search":"Search"}},"MediaCard":{"dismissButton":"Dismiss","popoverButton":"Actions"},"VideoThumbnail":{"playButtonA11yLabel":{"default":"Play video","defaultWithDuration":"Play video of length {duration}","duration":{"hours":{"other":{"only":"{hourCount} hours","andMinutes":"{hourCount} hours and {minuteCount} minutes","andMinute":"{hourCount} hours and {minuteCount} minute","minutesAndSeconds":"{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hours, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hours, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hours, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hours and {secondCount} seconds","andSecond":"{hourCount} hours and {secondCount} second"},"one":{"only":"{hourCount} hour","andMinutes":"{hourCount} hour and {minuteCount} minutes","andMinute":"{hourCount} hour and {minuteCount} minute","minutesAndSeconds":"{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hour, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hour, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hour, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hour and {secondCount} seconds","andSecond":"{hourCount} hour and {secondCount} second"}},"minutes":{"other":{"only":"{minuteCount} minutes","andSeconds":"{minuteCount} minutes and {secondCount} seconds","andSecond":"{minuteCount} minutes and {secondCount} second"},"one":{"only":"{minuteCount} minute","andSeconds":"{minuteCount} minute and {secondCount} seconds","andSecond":"{minuteCount} minute and {secondCount} second"}},"seconds":{"other":"{secondCount} seconds","one":"{secondCount} second"}}}}}');
const polarisTranslations = {
  Polaris
};
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const links$1 = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$9 = async () => {
  return json({ errors: {}, polarisTranslations });
};
const action$4 = async ({ request }) => {
  const formData = await request.formData();
  const rawShop = (formData.get("shop") || "").toString();
  const shop = normalizeShop(rawShop);
  if (!shop) {
    return json({ errors: { shop: "Shop domain is required" } }, { status: 400 });
  }
  try {
    const url = new URL(request.url);
    url.searchParams.set("shop", shop);
    const newReq = new Request(url.toString(), { method: "POST", body: formData });
    return await login(newReq);
  } catch (e) {
    return json({ errors: loginErrorMessage(e) }, { status: 400 });
  }
};
function normalizeShop(input) {
  const s = input.trim().toLowerCase();
  if (!s) return "";
  if (s.endsWith(".myshopify.com")) return s;
  if (!s.includes(".")) return `${s}.myshopify.com`;
  const base = s.split(".myshopify.com")[0].replace(/\.$/, "");
  return `${base}.myshopify.com`;
}
function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const errors = (actionData == null ? void 0 : actionData.errors) || loaderData.errors || {};
  return /* @__PURE__ */ jsx(AppProvider, { i18n: loaderData.polarisTranslations, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", replace: true, children: /* @__PURE__ */ jsxs(FormLayout, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Log in" }),
    /* @__PURE__ */ jsx(
      TextField,
      {
        type: "text",
        name: "shop",
        label: "Shop domain",
        helpText: "example.myshopify.com",
        value: shop,
        onChange: (v) => setShop(v),
        autoComplete: "off",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx(Button, { submit: true, children: "Log in" })
  ] }) }) }) }) });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: Auth,
  links: links$1,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
let _goldCache = null;
let _platinumCache = null;
const TTL_MS = 10 * 60 * 1e3;
function getMetalUrl(metalType) {
  switch (metalType) {
    case "gold":
      return "https://gold.tanaka.co.jp/commodity/souba/d-gold.php";
    case "platinum":
      return "https://gold.tanaka.co.jp/commodity/souba/d-platinum.php";
    default:
      throw new Error(`Unsupported metal type: ${metalType}`);
  }
}
function getMetalRowClass(metalType) {
  switch (metalType) {
    case "gold":
      return "gold";
    case "platinum":
      return "pt";
    // プラチナのclass名
    default:
      throw new Error(`Unsupported metal type: ${metalType}`);
  }
}
async function fetchMetalPriceData(metalType) {
  const cache = metalType === "gold" ? _goldCache : _platinumCache;
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const url = getMetalUrl(metalType);
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();
    console.log(`${metalType} HTML取得成功、長さ:`, html.length);
    const textify = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    let retailPrice = null;
    let changeYen = null;
    let buyPrice = null;
    let buyChangeYen = null;
    try {
      const metalRowLabel = metalType === "gold" ? "金" : "プラチナ";
      const rowMatch = html.match(new RegExp(`<tr[^>]*>s*<td[^>]*class="metal_name"[^>]*>s*${metalRowLabel}s*<\\/td>[\\s\\S]*?<\\/tr>`, "i"));
      if (rowMatch) {
        const rowHtml = rowMatch[0];
        const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => textify(m[1]));
        if (tds.length >= 5) {
          const numFrom = (s) => {
            const m = s.match(/([\d,]+)\s*円/);
            return m ? parseInt(m[1].replace(/,/g, "")) : null;
          };
          const yenChangeFrom = (s) => {
            const m = s.match(/([+\-]?\d+(?:\.\d+)?)\s*円/);
            return m ? parseFloat(m[1]) : null;
          };
          retailPrice = numFrom(tds[1]);
          changeYen = yenChangeFrom(tds[2]);
          buyPrice = numFrom(tds[3]);
          buyChangeYen = yenChangeFrom(tds[4]);
        }
      }
    } catch {
    }
    const extractTextByLabel = (h, label) => {
      const re = new RegExp(`<th[^>]*>[\\s\\S]*?${label.source}[\\s\\S]*?<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "is");
      const m = h.match(re);
      return m ? textify(m[1]) : null;
    };
    const extractNumberByLabel = (h, label) => {
      const t = extractTextByLabel(h, label);
      if (!t) return null;
      const m = t.match(/([\\d,]+)\\s*円/);
      return m ? parseInt(m[1].replace(/,/g, "")) : null;
    };
    const extractChangeByLabel = (h, label) => {
      const t = extractTextByLabel(h, label);
      if (!t) return null;
      const m = t.match(/([+\\-]?\\d+(?:\\.\\d+)?)\\s*円/);
      return m ? parseFloat(m[1]) : null;
    };
    if (retailPrice === null) retailPrice = extractNumberByLabel(html, /店頭小売価格/);
    if (buyPrice === null) buyPrice = extractNumberByLabel(html, /店頭買取価格/);
    if (changeYen === null) changeYen = extractChangeByLabel(html, /小売価格|店頭小売価格/);
    if (buyChangeYen === null) buyChangeYen = extractChangeByLabel(html, /買取価格|店頭買取価格/);
    if (retailPrice === null || buyPrice === null || changeYen === null || buyChangeYen === null) {
      const metalRowClass = getMetalRowClass(metalType);
      const metalRowMatch = html.match(new RegExp(`<tr[^>]*class="${metalRowClass}"[^>]*>.*?</tr>`, "is"));
      if (metalRowMatch) {
        const metalRow = metalRowMatch[0];
        console.log(`${metalType} 行（フォールバック）取得成功`);
        if (retailPrice === null) {
          const priceMatch = metalRow.match(/<td[^>]*class=\"retail_tax\"[^>]*>([\d,]+)\s*円/);
          if (priceMatch) retailPrice = parseInt(priceMatch[1].replace(/,/g, ""));
        }
        if (buyPrice === null) {
          const buyPriceMatch = metalRow.match(/<td[^>]*class=\"purchase_tax\"[^>]*>([\d,]+)\s*円/);
          if (buyPriceMatch) buyPrice = parseInt(buyPriceMatch[1].replace(/,/g, ""));
        }
        if (changeYen === null) {
          const changeMatch = metalRow.match(/<td[^>]*class=\"retail_ratio\"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
          if (changeMatch) changeYen = parseFloat(changeMatch[1]);
        }
        if (buyChangeYen === null) {
          const buyChangeMatch = metalRow.match(/<td[^>]*class=\"purchase_ratio\"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
          if (buyChangeMatch) buyChangeYen = parseFloat(buyChangeMatch[1]);
        }
      }
    }
    if (!retailPrice) {
      const priceContexts = html.match(/.{0,50}(\d{1,3}(?:,\d{3})*)\s*円.{0,50}/gi);
      console.log("価格コンテキスト（最初の5つ）:", priceContexts == null ? void 0 : priceContexts.slice(0, 5));
    }
    if (changeYen === null) {
      const changeContexts = html.match(/.{0,50}前日比.{0,50}/gi);
      console.log("前日比コンテキスト:", changeContexts == null ? void 0 : changeContexts.slice(0, 3));
    }
    console.log(`${metalType} price extraction result:`, {
      retailPrice,
      changeYen,
      url
    });
    let changeRatio = changeYen !== null && retailPrice !== null ? changeYen / retailPrice : null;
    if (typeof changeRatio === "number" && !Number.isFinite(changeRatio)) {
      changeRatio = null;
    }
    const changePercent = changeRatio !== null ? `${(changeRatio * 100).toFixed(2)}%` : "0.00%";
    let buyChangeRatio = buyChangeYen !== null && buyPrice !== null ? buyChangeYen / buyPrice : null;
    if (typeof buyChangeRatio === "number" && !Number.isFinite(buyChangeRatio)) {
      buyChangeRatio = null;
    }
    const buyChangePercent = buyChangeRatio !== null ? `${(buyChangeRatio * 100).toFixed(2)}%` : "0.00%";
    let changeDirection = "flat";
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = "up";
      else if (changeRatio < 0) changeDirection = "down";
    }
    const data = {
      metalType,
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : "取得失敗",
      buyPrice,
      buyPriceFormatted: buyPrice ? `¥${buyPrice.toLocaleString()}/g` : "取得失敗",
      changeRatio,
      changePercent: changeRatio !== null ? changeRatio >= 0 ? `+${changePercent}` : changePercent : "0.00%",
      buyChangeRatio,
      buyChangePercent: buyChangeRatio !== null ? buyChangeRatio >= 0 ? `+${buyChangePercent}` : buyChangePercent : "0.00%",
      changeDirection,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    const cacheData = { at: Date.now(), data };
    if (metalType === "gold") {
      _goldCache = cacheData;
    } else {
      _platinumCache = cacheData;
    }
    return data;
  } catch (error) {
    console.error(`田中貴金属${metalType}価格取得エラー:`, error);
    const cacheData = { at: Date.now(), data: null };
    if (metalType === "gold") {
      _goldCache = cacheData;
    } else {
      _platinumCache = cacheData;
    }
    return null;
  }
}
async function fetchGoldPriceDataTanaka() {
  return await fetchMetalPriceData("gold");
}
async function fetchPlatinumPriceDataTanaka() {
  return await fetchMetalPriceData("platinum");
}
function verifyCronAuth(request) {
  const fromVercelCron = request.headers.get("x-vercel-cron") === "1";
  if (fromVercelCron) return null;
  const expected = process.env.CRON_SECRET;
  if (!expected) return null;
  const got = request.headers.get("authorization") || "";
  if (got === `Bearer ${expected}`) return null;
  return json({ error: "Unauthorized" }, { status: 401 });
}
class ShopifyAdminClient {
  constructor(shop, accessToken) {
    this.shop = shop;
    this.accessToken = accessToken;
  }
  async graphql(query, options = {}) {
    const url = `https://${this.shop}/admin/api/2025-01/graphql.json`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.accessToken
      },
      body: JSON.stringify({
        query,
        variables: options.variables || {}
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || (body == null ? void 0 : body.errors)) {
      return { status: response.status, body, ok: false };
    }
    return { status: response.status, body, ok: true };
  }
}
async function fetchMetalPriceRatios() {
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    const gold = goldData && goldData.changeRatio !== null ? goldData.changeRatio : null;
    const platinum = platinumData && platinumData.changeRatio !== null ? platinumData.changeRatio : null;
    console.log(`金価格情報: ${goldData == null ? void 0 : goldData.retailPriceFormatted}, 前日比: ${goldData == null ? void 0 : goldData.changePercent}, 変動率: ${gold ? (gold * 100).toFixed(2) + "%" : "N/A"}`);
    console.log(`プラチナ価格情報: ${platinumData == null ? void 0 : platinumData.retailPriceFormatted}, 前日比: ${platinumData == null ? void 0 : platinumData.changePercent}, 変動率: ${platinum ? (platinum * 100).toFixed(2) + "%" : "N/A"}`);
    const goldNoChange = gold === 0;
    const platinumNoChange = platinum === 0;
    if (goldNoChange && platinumNoChange) {
      console.log("📊 金・プラチナとも相場変動なし（祝日等）- 価格更新をスキップ");
      return { gold: null, platinum: null, noChange: true };
    }
    return { gold, platinum, noChange: false };
  } catch (error) {
    console.error("金属価格取得エラー:", error);
    return { gold: null, platinum: null };
  }
}
function calcFinalPriceWithStep$1(current, ratio, minPct01, step = 1) {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return String(rounded);
}
async function processProduct(target, ratio, metalType, admin, entries, details, minPct01) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  try {
    const productGid2 = target.productId.startsWith("gid://") ? target.productId : `gid://shopify/Product/${target.productId}`;
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
          title
          variants(first: 250) {
            edges {
              node {
                id
                price
              }
            }
          }
        } 
      }
    `, { variables: { id: productGid2 } });
    if (resp.status === 401 || ((_d = (_c = (_b = (_a = resp.body) == null ? void 0 : _a.errors) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.includes("Invalid API key or access token"))) {
      console.error(`🚨 401 Unauthorized detected for product: ${productGid2}`);
      details.push({
        success: false,
        productId: productGid2,
        error: "401 Unauthorized: 再認証が必要",
        metalType
      });
      return;
    }
    if (!resp.ok || ((_e = resp.body) == null ? void 0 : _e.errors) && resp.body.errors.length) {
      const msg = ((_h = (_g = (_f = resp.body) == null ? void 0 : _f.errors) == null ? void 0 : _g[0]) == null ? void 0 : _h.message) ?? `HTTP ${resp.status}`;
      console.error(`商品 ${productGid2} (${metalType}) GraphQLエラー:`, msg);
      details.push({
        success: false,
        productId: productGid2,
        error: `GraphQLエラー: ${msg}`,
        metalType
      });
      return;
    }
    const product = (_j = (_i = resp.body) == null ? void 0 : _i.data) == null ? void 0 : _j.product;
    if (!product) {
      console.error(`商品 ${productGid2} (${metalType}) データが見つかりません`);
      details.push({
        success: false,
        productId: productGid2,
        error: "商品データが見つかりません",
        metalType
      });
      return;
    }
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price || 0);
      if (!current) continue;
      const newPrice = calcFinalPriceWithStep$1(current, ratio, minPct01, 10);
      if (parseFloat(newPrice) !== current) {
        entries.push({
          productId: productGid2,
          // GID形式を使用 
          productTitle: product.title,
          variantId: variant.id,
          newPrice,
          oldPrice: current,
          metalType
        });
      }
    }
  } catch (error) {
    console.error(`商品 ${productGid} (${metalType}) の処理でエラー:`, error);
    details.push({
      success: false,
      productId: productGid,
      error: `商品処理エラー: ${error.message}`,
      metalType
    });
  }
}
async function updateShopPrices(shop, accessToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
  const admin = new ShopifyAdminClient(shop, accessToken);
  let minPctSaved = 93;
  try {
    const ratios = await fetchMetalPriceRatios();
    if (ratios.noChange) {
      return {
        shop,
        success: true,
        message: "相場変動なしのためスキップ",
        updated: 0,
        failed: 0
      };
    }
    if (ratios.gold === null && ratios.platinum === null) {
      return {
        shop,
        success: false,
        error: "金・プラチナ価格の取得に失敗",
        updated: 0,
        failed: 0
      };
    }
    const setting = await prisma$1.shopSetting.findUnique({
      where: { shopDomain: shop }
    });
    minPctSaved = (setting == null ? void 0 : setting.minPricePct) ?? 93;
    const minPct01 = minPctSaved > 1 ? minPctSaved / 100 : minPctSaved;
    if (!setting || !setting.autoUpdateEnabled) {
      console.log(`${shop}: 自動更新が無効です`);
      return {
        shop,
        success: true,
        message: "自動更新無効",
        updated: 0,
        failed: 0
      };
    }
    const targets = await prisma$1.selectedProduct.findMany({
      where: {
        shopDomain: shop,
        selected: true
      },
      select: { productId: true, metalType: true }
    });
    console.log(`${shop}: 対象商品数（selected=true）: ${targets.length}`);
    if (!targets.length) {
      return {
        shop,
        success: true,
        message: "対象商品なし",
        updated: 0,
        failed: 0
      };
    }
    const normalize = (s) => (s ?? "").trim().toLowerCase();
    const goldTargets = targets.filter((t) => normalize(t.metalType) === "gold");
    const platinumTargets = targets.filter((t) => normalize(t.metalType) === "platinum");
    console.log(`${shop}: 金商品 ${goldTargets.length}件, プラチナ商品 ${platinumTargets.length}件`);
    if ((ratios.gold === null || goldTargets.length === 0) && (ratios.platinum === null || platinumTargets.length === 0)) {
      return {
        shop,
        success: true,
        message: "有効な価格変動・対象商品なし",
        updated: 0,
        failed: 0
      };
    }
    const entries = [];
    let updated = 0, failed = 0;
    const details = [];
    if (ratios.gold !== null && goldTargets.length > 0) {
      console.log(`${shop}: 金商品価格更新開始（変動率: ${(ratios.gold * 100).toFixed(2)}%）`);
      for (const target of goldTargets) {
        await processProduct(target, ratios.gold, "gold", admin, entries, details, minPct01);
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    if (ratios.platinum !== null && platinumTargets.length > 0) {
      console.log(`${shop}: プラチナ商品価格更新開始（変動率: ${(ratios.platinum * 100).toFixed(2)}%）`);
      for (const target of platinumTargets) {
        await processProduct(target, ratios.platinum, "platinum", admin, entries, details, minPct01);
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    if (!entries.length) {
      const goldRatio = ratios.gold;
      const platinumRatio = ratios.platinum;
      if (goldRatio !== null && goldTargets.length > 0) {
        await prisma$1.priceUpdateLog.create({
          data: {
            shopDomain: shop,
            executionType: "cron",
            metalType: "gold",
            priceRatio: goldRatio,
            minPricePct: minPctSaved,
            totalProducts: goldTargets.length,
            updatedCount: 0,
            failedCount: 0,
            success: true,
            errorMessage: null
          }
        });
      }
      if (platinumRatio !== null && platinumTargets.length > 0) {
        await prisma$1.priceUpdateLog.create({
          data: {
            shopDomain: shop,
            executionType: "cron",
            metalType: "platinum",
            priceRatio: platinumRatio,
            minPricePct: minPctSaved,
            totalProducts: platinumTargets.length,
            updatedCount: 0,
            failedCount: 0,
            success: true,
            errorMessage: null
          }
        });
      }
      return {
        shop,
        success: true,
        message: "価格変更不要",
        updated: 0,
        failed: 0
      };
    }
    const byProduct = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const arr = byProduct.get(e.productId) || [];
      arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice });
      byProduct.set(e.productId, arr);
    }
    updated = 0;
    failed = 0;
    for (const [productId, variants] of byProduct) {
      try {
        const res = await admin.graphql(`
          mutation UpdateViaBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              product { id }
              productVariants { id price }
              userErrors { field message }
            }
          }
        `, {
          variables: {
            productId,
            variants: variants.map((v) => ({ id: v.id, price: v.price }))
          }
        });
        if (res.status === 401 || ((_d = (_c = (_b = (_a = res.body) == null ? void 0 : _a.errors) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.includes("Invalid API key or access token"))) {
          console.error(`🚨 401 Unauthorized detected during price update for shop: ${shop}`);
          await prisma$1.session.deleteMany({ where: { shop } });
          await prisma$1.priceUpdateLog.create({
            data: {
              shopDomain: shop,
              executionType: "cron",
              metalType: "gold",
              priceRatio: null,
              minPricePct: minPctSaved,
              totalProducts: targets.length,
              updatedCount: updated,
              failedCount: entries.length - updated,
              success: false,
              errorMessage: "401 Unauthorized during price update: 再認証が必要"
            }
          });
          return {
            shop,
            success: false,
            needsReauth: true,
            message: "価格更新中に認証エラー: アプリの再インストールが必要です",
            updated,
            failed: entries.length - updated
          };
        }
        if (!res.ok || ((_e = res.body) == null ? void 0 : _e.errors) && res.body.errors.length) {
          const msg = ((_h = (_g = (_f = res.body) == null ? void 0 : _f.errors) == null ? void 0 : _g[0]) == null ? void 0 : _h.message) ?? `HTTP ${res.status}`;
          console.error(`商品 ${productId} 更新GraphQLエラー:`, msg);
          for (const variant of variants) {
            details.push({
              success: false,
              productId,
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              error: `更新GraphQLエラー: ${msg}`
            });
          }
          failed += variants.length;
          continue;
        }
        const errs = ((_k = (_j = (_i = res.body) == null ? void 0 : _i.data) == null ? void 0 : _j.productVariantsBulkUpdate) == null ? void 0 : _k.userErrors) || [];
        if (errs.length) {
          failed += variants.length;
          for (const variant of variants) {
            details.push({
              success: false,
              productId,
              variantId: variant.id,
              error: ((_l = errs[0]) == null ? void 0 : _l.message) || "不明なエラー"
            });
          }
        } else {
          const updatedVariants = ((_o = (_n = (_m = res.body) == null ? void 0 : _m.data) == null ? void 0 : _n.productVariantsBulkUpdate) == null ? void 0 : _o.productVariants) || [];
          updated += updatedVariants.length;
          for (const variant of variants) {
            const uv = updatedVariants.find((u) => u.id === variant.id);
            details.push({
              success: true,
              productId,
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              newPrice: uv ? parseFloat(uv.price) : parseFloat(variant.price)
            });
          }
        }
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        console.error(`商品 ${productId} の更新でエラー:`, error);
        for (const variant of variants) {
          details.push({
            success: false,
            productId,
            variantId: variant.id,
            oldPrice: variant.oldPrice,
            error: `更新処理エラー: ${error.message}`
          });
        }
        failed += variants.length;
      }
    }
    const goldEntries = entries.filter((e) => e.metalType === "gold");
    const platinumEntries = entries.filter((e) => e.metalType === "platinum");
    const goldDetails = details.filter((d) => d.metalType === "gold");
    const platinumDetails = details.filter((d) => d.metalType === "platinum");
    const goldUpdated = goldDetails.filter((d) => d.success).length;
    const goldFailed = goldDetails.filter((d) => !d.success).length;
    const platinumUpdated = platinumDetails.filter((d) => d.success).length;
    const platinumFailed = platinumDetails.filter((d) => !d.success).length;
    if (ratios.gold !== null && (goldTargets.length > 0 || goldEntries.length > 0)) {
      await prisma$1.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: "cron",
          metalType: "gold",
          priceRatio: ratios.gold,
          minPricePct: minPctSaved,
          totalProducts: goldTargets.length,
          updatedCount: goldUpdated,
          // 実更新数
          failedCount: goldFailed,
          // 実失敗数
          success: goldFailed === 0,
          errorMessage: goldFailed > 0 ? `金: ${goldFailed}件の更新に失敗` : null,
          details: JSON.stringify(goldDetails)
        }
      });
    }
    if (ratios.platinum !== null && (platinumTargets.length > 0 || platinumEntries.length > 0)) {
      await prisma$1.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: "cron",
          metalType: "platinum",
          priceRatio: ratios.platinum,
          minPricePct: minPctSaved,
          totalProducts: platinumTargets.length,
          updatedCount: platinumUpdated,
          // 実更新数
          failedCount: platinumFailed,
          // 実失敗数
          success: platinumFailed === 0,
          errorMessage: platinumFailed > 0 ? `プラチナ: ${platinumFailed}件の更新に失敗` : null,
          details: JSON.stringify(platinumDetails)
        }
      });
    }
    const shopSetting = await prisma$1.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true }
    });
    if (shopSetting == null ? void 0 : shopSetting.notificationEmail) {
      try {
        const emailData = {
          shopDomain: shop,
          updatedCount: updated,
          failedCount: failed,
          goldRatio: ratios.gold ? (ratios.gold * 100).toFixed(2) + "%" : void 0,
          platinumRatio: ratios.platinum ? (ratios.platinum * 100).toFixed(2) + "%" : void 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          details
        };
        const emailResult = await sendPriceUpdateNotification(
          shopSetting.notificationEmail,
          emailData
        );
        if (emailResult.success) {
          console.log(`📧 メール通知送信成功: ${shopSetting.notificationEmail}`);
        } else {
          console.error(`📧 メール通知送信失敗: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error("📧 メール通知処理でエラー:", emailError);
      }
    }
    return {
      shop,
      success: true,
      updated,
      failed,
      goldRatio: ratios.gold ? (ratios.gold * 100).toFixed(2) + "%" : "N/A",
      platinumRatio: ratios.platinum ? (ratios.platinum * 100).toFixed(2) + "%" : "N/A",
      emailSent: !!(shopSetting == null ? void 0 : shopSetting.notificationEmail)
    };
  } catch (error) {
    console.error(`${shop}の処理でエラー:`, error);
    await prisma$1.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: "cron",
        metalType: "gold",
        priceRatio: null,
        minPricePct: minPctSaved,
        totalProducts: 0,
        updatedCount: 0,
        failedCount: 0,
        success: false,
        errorMessage: error.message
      }
    });
    return {
      shop,
      success: false,
      error: error.message,
      updated: 0,
      failed: 0
    };
  }
}
async function runAllShops(opts = {}) {
  const force = !!opts.force;
  try {
    console.log(`🕙 Cron実行開始: ${(/* @__PURE__ */ new Date()).toISOString()}`);
    const now = /* @__PURE__ */ new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1e3);
    const currentHour = jstNow.getHours();
    const dayOfWeek = jstNow.getDay();
    if (!force && (dayOfWeek === 0 || dayOfWeek === 6)) {
      const message = `${jstNow.toDateString()}は土日のため価格更新をスキップします`;
      console.log(message);
      return {
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
        shops: []
      };
    }
    const targetHour = 10;
    const inWindow = currentHour >= 10 && currentHour <= 11;
    const enabledShops = await prisma$1.shopSetting.findMany({
      where: {
        autoUpdateEnabled: true,
        // force=trueでない場合は10〜11時台実行
        ...force ? {} : inWindow ? {} : { shopDomain: "never-match" }
      },
      select: { shopDomain: true }
    });
    if (!enabledShops.length) {
      const message = force ? "自動更新有効なショップがありません" : `JST ${currentHour}:00 - 10:00-11:00時間帯でないため実行をスキップします`;
      console.log(message);
      return {
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
        shops: []
      };
    }
    console.log(`🕐 JST ${currentHour}:00 (10:00-11:00実行時間帯) - ${enabledShops.length}件のショップで価格更新を開始`);
    const results = [];
    for (const shop of enabledShops) {
      const session = await prisma$1.session.findFirst({
        where: {
          shop: shop.shopDomain,
          isOnline: false
          // オフライントークンのみ（背景処理用）
        },
        orderBy: { expires: "desc" }
      });
      if (!session || !session.accessToken) {
        console.log(`${shop.shopDomain}: 有効なセッションが見つかりません`);
        results.push({
          shop: shop.shopDomain,
          success: false,
          error: "有効なセッションなし",
          updated: 0,
          failed: 0
        });
        continue;
      }
      console.log(`${shop.shopDomain}: 価格更新を開始`);
      const result = await updateShopPrices(shop.shopDomain, session.accessToken);
      results.push(result);
      await new Promise((r) => setTimeout(r, 1e3));
    }
    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
    const successCount = results.filter((r) => r.success).length;
    console.log(`🏁 Cron実行完了: 成功 ${successCount}/${results.length}ショップ, 更新 ${totalUpdated}件, 失敗 ${totalFailed}件`);
    return {
      message: "自動価格更新完了",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      summary: {
        totalShops: results.length,
        successShops: successCount,
        totalUpdated,
        totalFailed
      },
      shops: results
    };
  } catch (error) {
    console.error("Cron実行エラー:", error);
    return {
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
      shops: []
    };
  }
}
const loader$8 = async ({ request }) => {
  const deny = verifyCronAuth(request);
  if (deny) return deny;
  try {
    const force = new URL(request.url).searchParams.get("force") === "1";
    const result = await runAllShops({ force });
    return json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    console.error("Cron実行エラー:", e);
    return json({ error: e.message }, { status: 500 });
  } finally {
    await prisma$1.$disconnect().catch(() => {
    });
  }
};
const action$3 = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const deny = verifyCronAuth(request);
  if (deny) return deny;
  try {
    const force = new URL(request.url).searchParams.get("force") === "1";
    const result = await runAllShops({ force });
    return json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    console.error("Cron実行エラー:", e);
    return json({ error: e.message }, { status: 500 });
  } finally {
    await prisma$1.$disconnect().catch(() => {
    });
  }
};
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const prisma = new PrismaClient();
async function fetchGoldChangeRatioTanaka() {
  try {
    const response = await fetch("https://gold.tanaka.co.jp/commodity/souba/");
    const html = await response.text();
    console.log("HTML取得成功、長さ:", html.length);
    let retailPrice = null;
    let changeYen = null;
    let priceMatchResult = null;
    let changeMatchResult = null;
    const goldRowMatch = html.match(/<tr[^>]*class="gold"[^>]*>.*?<\/tr>/is);
    if (goldRowMatch) {
      const goldRow = goldRowMatch[0];
      const priceMatch = goldRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      if (priceMatch) {
        retailPrice = parseInt(priceMatch[1].replace(/,/g, ""));
        priceMatchResult = priceMatch[0];
      }
      const changeMatch = goldRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      if (changeMatch) {
        changeYen = parseFloat(changeMatch[1]);
        changeMatchResult = changeMatch[0];
      }
    }
    if (!retailPrice || changeYen === null) {
      const priceContexts = html.match(/.{0,50}(\d{1,3}(?:,\d{3})*)\s*円.{0,50}/gi);
      const changeContexts = html.match(/.{0,50}前日比.{0,50}/gi);
      return {
        success: false,
        error: "金価格データの抽出に失敗",
        htmlLength: html.length,
        retailPrice,
        changeYen,
        priceMatchResult,
        changeMatchResult,
        priceContexts: priceContexts == null ? void 0 : priceContexts.slice(0, 5),
        changeContexts: changeContexts == null ? void 0 : changeContexts.slice(0, 3)
      };
    }
    const changeRatio = changeYen / retailPrice;
    return {
      success: true,
      retailPrice,
      changeYen,
      changeRatio,
      changePercent: (changeRatio * 100).toFixed(2) + "%",
      priceMatchResult,
      changeMatchResult
    };
  } catch (error) {
    console.error("金価格取得エラー:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
const loader$7 = async ({ request }) => {
  const url = new URL(request.url);
  const test = url.searchParams.get("test");
  if (test === "gold-price") {
    const result = await fetchGoldChangeRatioTanaka();
    return json({
      test: "gold-price",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...result
    });
  }
  if (test === "platinum-price") {
    try {
      const url2 = "https://gold.tanaka.co.jp/commodity/souba/d-platinum.php";
      const resp = await fetch(url2, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
      const html = await resp.text();
      let retailPrice = null;
      let changeYen = null;
      const platinumRowMatch = html.match(/<tr[^>]*class="pt"[^>]*>.*?<\/tr>/is);
      if (platinumRowMatch) {
        const platinumRow = platinumRowMatch[0];
        const priceMatch = platinumRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
        if (priceMatch) {
          retailPrice = parseInt(priceMatch[1].replace(/,/g, ""));
        }
        const changeMatch = platinumRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
        if (changeMatch) {
          changeYen = parseFloat(changeMatch[1]);
        }
      }
      const changeRatio = changeYen !== null && retailPrice !== null ? changeYen / retailPrice : null;
      return json({
        test: "platinum-price",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        success: retailPrice !== null && changeYen !== null,
        retailPrice,
        changeYen,
        changeRatio,
        changePercent: changeRatio ? (changeRatio * 100).toFixed(2) + "%" : null,
        retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : "取得失敗"
      });
    } catch (error) {
      return json({
        test: "platinum-price",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        success: false,
        error: error.message
      });
    }
  }
  if (test === "shop-settings") {
    try {
      const enabledShops = await prisma.shopSetting.findMany({
        where: { autoUpdateEnabled: true },
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      const allShops = await prisma.shopSetting.findMany({
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      const selectedProducts = await prisma.selectedProduct.findMany({
        where: { shopDomain: "luxrexor2.myshopify.com", selected: true },
        select: { shopDomain: true, productId: true }
      });
      return json({
        test: "shop-settings",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        enabledShops,
        allShops,
        totalShops: allShops.length,
        enabledCount: enabledShops.length,
        selectedProducts: selectedProducts.length,
        selectedProductIds: selectedProducts.map((p) => p.productId.split("/").pop())
        // ID部分のみ
      });
    } catch (error) {
      return json({
        test: "shop-settings",
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } finally {
      await prisma.$disconnect();
    }
  }
  return json({
    status: "ready",
    message: "Test endpoint is ready. Use ?test=gold-price or ?test=shop-settings for specific tests",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
const action$2 = async ({ request }) => {
  const formData = await request.formData();
  const action2 = formData.get("action");
  if (action2 === "test-cron") {
    try {
      const cronResponse = await fetch(`${new URL(request.url).origin}/api/cron/price-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const cronData = await cronResponse.json();
      return json({
        action: "test-cron",
        cronStatus: cronResponse.status,
        cronData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      return json({
        action: "test-cron",
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  return json({
    status: "success",
    message: "API endpoint is working. Use action=test-cron to test cron execution",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({ request }) => {
  const url = new URL(request.url);
  return redirect("/app" + url.search);
};
function App$1() {
  return null;
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$4 = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider$1, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link$1, { to: "/app", rel: "home", prefetch: "intent", children: "ホーム" }),
      /* @__PURE__ */ jsx(Link$1, { to: "/app/products", prefetch: "intent", children: "商品価格調整" }),
      /* @__PURE__ */ jsx(Link$1, { to: "/app/settings", prefetch: "intent", children: "設定" }),
      /* @__PURE__ */ jsx(Link$1, { to: "/app/logs", prefetch: "intent", children: "実行ログ" }),
      /* @__PURE__ */ jsx(Link$1, { to: "/app/additional", prefetch: "intent", children: "Additional page" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function AdditionalPage() {
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx(TitleBar, { title: "Additional page" }),
    /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
          "The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              url: "https://shopify.dev/docs/apps/tools/app-bridge",
              target: "_blank",
              removeUnderline: true,
              children: "App Bridge"
            }
          ),
          "."
        ] }),
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
          "To create your own page and have it show up in the app navigation, add a page inside ",
          /* @__PURE__ */ jsx(Code, { children: "app/routes" }),
          ", and a link to it in the ",
          /* @__PURE__ */ jsx(Code, { children: "<NavMenu>" }),
          " component found in ",
          /* @__PURE__ */ jsx(Code, { children: "app/routes/app.jsx" }),
          "."
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Resources" }),
        /* @__PURE__ */ jsx(List, { children: /* @__PURE__ */ jsx(List.Item, { children: /* @__PURE__ */ jsx(
          Link,
          {
            url: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            removeUnderline: true,
            children: "App nav best practices"
          }
        ) }) })
      ] }) }) })
    ] })
  ] });
}
function Code({ children }) {
  return /* @__PURE__ */ jsx("span", { style: {
    padding: "2px 8px",
    background: "#e2e8f0",
    border: "1px solid #cbd5e1",
    borderRadius: "12px"
  }, children: /* @__PURE__ */ jsx("code", { children }) });
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdditionalPage
}, Symbol.toStringTag, { value: "Module" }));
const _ClientCache = class _ClientCache {
  // 5分
  static set(key, data, ttl = _ClientCache.DEFAULT_TTL) {
    if (typeof window === "undefined") return;
    const item = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn("キャッシュ保存に失敗（Shopify認証影響なし）:", error);
    }
  }
  static get(key) {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      const item = JSON.parse(stored);
      if (Date.now() > item.expiresAt) {
        sessionStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch (error) {
      console.warn("キャッシュ取得に失敗:", error);
      sessionStorage.removeItem(key);
      return null;
    }
  }
  static clear(key) {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  }
  static clearAll() {
    if (typeof window === "undefined") return;
    sessionStorage.clear();
  }
  static isExpired(key) {
    if (typeof window === "undefined") return true;
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return true;
      const item = JSON.parse(stored);
      return Date.now() > item.expiresAt;
    } catch {
      return true;
    }
  }
  static getInfo(key) {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      const item = JSON.parse(stored);
      return {
        timestamp: item.timestamp,
        expiresAt: item.expiresAt
      };
    } catch {
      return null;
    }
  }
};
__publicField(_ClientCache, "DEFAULT_TTL", 5 * 60 * 1e3);
let ClientCache = _ClientCache;
const CACHE_KEYS = {
  PRODUCTS: "shopify_products_cache"
};
function calcFinalPriceWithStep(current, ratio, minPct01, step = 1) {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return String(rounded);
}
async function runBulkUpdateBySpec(admin, shop, opts = {}) {
  var _a, _b, _c, _d, _e, _f, _g;
  const onlyIds = Array.isArray(opts.onlyProductIds) && opts.onlyProductIds.length ? opts.onlyProductIds : null;
  const minPriceRate = typeof opts.minPriceRate === "number" ? opts.minPriceRate : void 0;
  console.log("[UPDATE] onlyIds:", onlyIds == null ? void 0 : onlyIds.slice(0, 3), "count:", onlyIds == null ? void 0 : onlyIds.length);
  const [goldData, platinumData] = await Promise.all([
    fetchMetalPriceData("gold"),
    fetchMetalPriceData("platinum")
  ]);
  const setting = await prisma$1.shopSetting.findUnique({ where: { shopDomain: shop } });
  const minPct = minPriceRate ?? (setting == null ? void 0 : setting.minPricePct) ?? 93;
  const targets = await prisma$1.selectedProduct.findMany({
    where: {
      shopDomain: shop,
      selected: true,
      ...onlyIds ? { productId: { in: onlyIds } } : {}
    },
    select: { productId: true, metalType: true }
  });
  console.log("[UPDATE] target count:", targets.length);
  console.log("[UPDATE] sample ids:", targets.slice(0, 5));
  if (!targets.length) {
    return {
      ok: false,
      reason: onlyIds ? "選択した商品が保存されていません" : "更新対象がありません",
      details: [],
      summary: { total: 0, success: 0, failed: 0 }
    };
  }
  const goldTargets = targets.filter((t) => t.metalType === "gold");
  const platinumTargets = targets.filter((t) => t.metalType === "platinum");
  if (goldTargets.length > 0 && (!goldData || goldData.changeRatio === null)) {
    return { ok: false, disabled: true, reason: "金価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }
  if (platinumTargets.length > 0 && (!platinumData || platinumData.changeRatio === null)) {
    return { ok: false, disabled: true, reason: "プラチナ価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }
  const entries = [];
  for (const t of goldTargets) {
    const ratio = goldData.changeRatio;
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
          variants(first: 250) {
            edges {
              node {
                id
                price
              }
            }
          }
        } 
      }
    `, { variables: { id: t.productId } });
    const body = await resp.json();
    const product = (_a = body == null ? void 0 : body.data) == null ? void 0 : _a.product;
    if (!product) continue;
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price ?? 0);
      if (!current) continue;
      const minPct01 = minPct / 100;
      const newPrice = calcFinalPriceWithStep(current, ratio, minPct01, 10);
      if (parseFloat(newPrice) !== current) {
        entries.push({
          productId: t.productId,
          variantId: variant.id,
          newPrice,
          oldPrice: current,
          metalType: "gold"
        });
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  for (const t of platinumTargets) {
    const ratio = platinumData.changeRatio;
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
          variants(first: 250) {
            edges {
              node {
                id
                price
              }
            }
          }
        } 
      }
    `, { variables: { id: t.productId } });
    const body = await resp.json();
    const product = (_b = body == null ? void 0 : body.data) == null ? void 0 : _b.product;
    if (!product) continue;
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price ?? 0);
      if (!current) continue;
      const minPct01 = minPct / 100;
      const newPrice = calcFinalPriceWithStep(current, ratio, minPct01, 10);
      if (parseFloat(newPrice) !== current) {
        entries.push({
          productId: t.productId,
          variantId: variant.id,
          newPrice,
          oldPrice: current,
          metalType: "platinum"
        });
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!entries.length) {
    return { ok: true, minPct, updated: 0, failed: 0, details: [], message: "価格変更不要" };
  }
  const byProduct = /* @__PURE__ */ new Map();
  for (const e of entries) {
    const arr = byProduct.get(e.productId) ?? [];
    arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice, metalType: e.metalType });
    byProduct.set(e.productId, arr);
  }
  let updated = 0, failed = 0;
  const details = [];
  let retryDelay = 300;
  for (const [productId, variants] of byProduct) {
    const res = await admin.graphql(`
      mutation UpdateViaBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product { id }
          productVariants { id price }
          userErrors { field message }
        }
      }
    `, { variables: {
      productId,
      variants: variants.map((v) => ({ id: v.id, price: v.price }))
    } });
    const r = await res.json();
    const errs = ((_d = (_c = r == null ? void 0 : r.data) == null ? void 0 : _c.productVariantsBulkUpdate) == null ? void 0 : _d.userErrors) ?? [];
    if (errs.length) {
      failed += variants.length;
      for (const variant of variants) {
        details.push({
          success: false,
          productId,
          variantId: variant.id,
          error: ((_e = errs[0]) == null ? void 0 : _e.message) || "不明なエラー"
        });
      }
    } else {
      const updatedVariants = ((_g = (_f = r == null ? void 0 : r.data) == null ? void 0 : _f.productVariantsBulkUpdate) == null ? void 0 : _g.productVariants) ?? [];
      updated += updatedVariants.length;
      for (const variant of variants) {
        const updatedVariant = updatedVariants.find((uv) => uv.id === variant.id);
        details.push({
          success: true,
          productId,
          variantId: variant.id,
          oldPrice: variant.oldPrice,
          newPrice: updatedVariant ? parseFloat(updatedVariant.price) : variant.oldPrice
        });
      }
    }
    await new Promise((r2) => setTimeout(r2, retryDelay));
    retryDelay = Math.min(retryDelay * 1.5, 1e3);
  }
  const goldEntries = entries.filter((e) => e.metalType === "gold");
  const platinumEntries = entries.filter((e) => e.metalType === "platinum");
  const logPromises = [];
  if (goldEntries.length > 0) {
    logPromises.push(prisma$1.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: "manual",
        metalType: "gold",
        priceRatio: goldData.changeRatio,
        minPricePct: minPct,
        totalProducts: goldTargets.length,
        updatedCount: details.filter((d) => d.success && goldEntries.some((e) => e.variantId === d.variantId)).length,
        failedCount: details.filter((d) => !d.success && goldEntries.some((e) => e.variantId === d.variantId)).length,
        success: failed === 0,
        details: JSON.stringify(details.filter((d) => goldEntries.some((e) => e.variantId === d.variantId)))
      }
    }));
  }
  if (platinumEntries.length > 0) {
    logPromises.push(prisma$1.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: "manual",
        metalType: "platinum",
        priceRatio: platinumData.changeRatio,
        minPricePct: minPct,
        totalProducts: platinumTargets.length,
        updatedCount: details.filter((d) => d.success && platinumEntries.some((e) => e.variantId === d.variantId)).length,
        failedCount: details.filter((d) => !d.success && platinumEntries.some((e) => e.variantId === d.variantId)).length,
        success: failed === 0,
        details: JSON.stringify(details.filter((d) => platinumEntries.some((e) => e.variantId === d.variantId)))
      }
    }));
  }
  await Promise.all(logPromises);
  return {
    ok: true,
    goldRatio: (goldData == null ? void 0 : goldData.changeRatio) || null,
    platinumRatio: (platinumData == null ? void 0 : platinumData.changeRatio) || null,
    minPct,
    updated,
    failed,
    details,
    summary: {
      total: goldTargets.length + platinumTargets.length,
      success: updated,
      failed,
      gold: goldTargets.length,
      platinum: platinumTargets.length
    },
    message: `${goldTargets.length}件の金商品、${platinumTargets.length}件のプラチナ商品を処理完了`
  };
}
function UnselectButton({ productId, onOptimistic, scheduleRevalidate }) {
  const fx = useFetcher();
  const busy = fx.state !== "idle";
  useEffect(() => {
    var _a;
    if (fx.state === "idle" && ((_a = fx.data) == null ? void 0 : _a.success)) {
      scheduleRevalidate == null ? void 0 : scheduleRevalidate();
    }
  }, [fx.state, fx.data, scheduleRevalidate]);
  return /* @__PURE__ */ jsxs(fx.Form, { method: "post", replace: true, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", value: "unselectProducts" }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "productId", value: productId }),
    /* @__PURE__ */ jsx(
      Button,
      {
        size: "micro",
        variant: "tertiary",
        tone: "critical",
        loading: busy,
        disabled: busy,
        onClick: (e) => {
          e.preventDefault();
          onOptimistic == null ? void 0 : onOptimistic(productId);
          const fd = new FormData(e.currentTarget.form);
          fx.submit(fd, { method: "post" });
        },
        children: "解除"
      }
    )
  ] });
}
function filterProducts(products, searchTerm, filterType = "all") {
  let filtered = products;
  if (filterType === "k18") {
    filtered = products.filter(
      (product) => product.title.includes("K18") || product.title.includes("18金")
    );
  }
  if (searchTerm) {
    filtered = filtered.filter(
      (product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()) || product.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return filtered;
}
function calculateNewPrice(currentPrice, adjustmentRatio, minPriceRate = 0.93) {
  const newPrice = currentPrice * (1 + adjustmentRatio);
  const minPrice = currentPrice * minPriceRate;
  const finalPrice = Math.max(newPrice, minPrice);
  return adjustmentRatio >= 0 ? Math.ceil(finalPrice / 10) * 10 : Math.floor(finalPrice / 10) * 10;
}
async function fetchProductIdsByCollection(admin, collectionId) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const ids = [];
  let after = null;
  let hasNext = true;
  while (hasNext) {
    const res = await admin.graphql(
      `#graphql
       query($id: ID!, $first: Int!, $after: String) {
         collection(id: $id) {
           products(first: $first, after: $after) {
             edges {
               cursor
               node { id }
             }
             pageInfo { hasNextPage }
           }
         }
       }`,
      { variables: { id: collectionId, first: 250, after } }
    );
    const body = await res.json();
    if ((_a = body == null ? void 0 : body.errors) == null ? void 0 : _a.length) throw new Error(body.errors[0].message || "GraphQL error");
    const edges = ((_d = (_c = (_b = body == null ? void 0 : body.data) == null ? void 0 : _b.collection) == null ? void 0 : _c.products) == null ? void 0 : _d.edges) ?? [];
    ids.push(...edges.map((e) => e.node.id));
    hasNext = ((_h = (_g = (_f = (_e = body == null ? void 0 : body.data) == null ? void 0 : _e.collection) == null ? void 0 : _f.products) == null ? void 0 : _g.pageInfo) == null ? void 0 : _h.hasNextPage) ?? false;
    after = edges.length ? edges[edges.length - 1].cursor : null;
  }
  return Array.from(new Set(ids));
}
async function fetchAllCollections(admin) {
  async function paginate(query, rootKey, pickCount) {
    var _a, _b, _c, _d;
    const out = [];
    let cursor = null;
    let hasNext = true;
    while (hasNext) {
      const res = await admin.graphql(query, { variables: { first: 250, after: cursor } });
      const body = await res.json();
      if ((_a = body == null ? void 0 : body.errors) == null ? void 0 : _a.length) throw new Error(JSON.stringify(body.errors));
      const conn = (_b = body == null ? void 0 : body.data) == null ? void 0 : _b[rootKey];
      const edges = (conn == null ? void 0 : conn.edges) ?? [];
      for (const { node } of edges) {
        out.push({
          id: node.id,
          title: node.title,
          handle: node.handle,
          // 取得できた場合のみ件数を設定
          productsCount: pickCount === "scalar" ? Number(node.productsCount ?? 0) : pickCount === "object" ? Number(((_c = node.productsCount) == null ? void 0 : _c.count) ?? 0) : void 0
        });
      }
      hasNext = ((_d = conn == null ? void 0 : conn.pageInfo) == null ? void 0 : _d.hasNextPage) ?? false;
      cursor = edges.length ? edges[edges.length - 1].cursor : null;
    }
    return out;
  }
  const qCollectionsScalar = `#graphql
    query($first:Int!,$after:String){
      collections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;
  const qCollectionsNoCount = `#graphql
    query($first:Int!,$after:String){
      collections(first:$first, after:$after){
        edges{cursor node{ id title handle }}
        pageInfo{hasNextPage}
      }
    }`;
  const qCustomScalar = `#graphql
    query($first:Int!,$after:String){
      customCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;
  const qSmartScalar = `#graphql
    query($first:Int!,$after:String){
      smartCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;
  const qCustomObj = `#graphql
    query($first:Int!,$after:String){
      customCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount{count} }}
        pageInfo{hasNextPage}
      }
    }`;
  const qSmartObj = `#graphql
    query($first:Int!,$after:String){
      smartCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount{count} }}
        pageInfo{hasNextPage}
      }
    }`;
  try {
    return await paginate(qCollectionsScalar, "collections", "scalar");
  } catch {
  }
  try {
    return await paginate(qCollectionsNoCount, "collections");
  } catch {
  }
  try {
    const [c, s] = await Promise.all([
      paginate(qCustomScalar, "customCollections", "scalar"),
      paginate(qSmartScalar, "smartCollections", "scalar")
    ]);
    return [...c, ...s];
  } catch {
  }
  try {
    const [c, s] = await Promise.all([
      paginate(qCustomObj, "customCollections", "object"),
      paginate(qSmartObj, "smartCollections", "object")
    ]);
    return [...c, ...s];
  } catch (e) {
    console.error("fetchAllCollections failed:", e);
    return [];
  }
}
async function fetchAllProducts(admin) {
  let allProducts = [];
  let cursor = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const response = await admin.graphql(
      `#graphql
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                handle
                status
                variants(first: 250) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
                    }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }`,
      {
        variables: {
          first: 250,
          after: cursor
        }
      }
    );
    const responseJson = await response.json();
    const products = responseJson.data.products.edges.map((edge) => edge.node);
    allProducts = [...allProducts, ...products];
    hasNextPage = responseJson.data.products.pageInfo.hasNextPage;
    cursor = responseJson.data.products.edges.length > 0 ? responseJson.data.products.edges[responseJson.data.products.edges.length - 1].cursor : null;
  }
  return allProducts;
}
async function fetchMetalPrices() {
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    const toPct = (r) => typeof r === "number" && Number.isFinite(r) ? (r * 100).toFixed(2) : "0.00";
    return {
      gold: goldData ? {
        ratio: typeof goldData.changeRatio === "number" && Number.isFinite(goldData.changeRatio) ? goldData.changeRatio : null,
        percentage: toPct(goldData.changeRatio),
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        buyPrice: goldData.buyPrice,
        buyPriceFormatted: goldData.buyPriceFormatted,
        buyChangePercent: goldData.buyChangePercent,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinum: platinumData ? {
        ratio: typeof platinumData.changeRatio === "number" && Number.isFinite(platinumData.changeRatio) ? platinumData.changeRatio : null,
        percentage: toPct(platinumData.changeRatio),
        change: platinumData.changePercent,
        retailPrice: platinumData.retailPrice,
        retailPriceFormatted: platinumData.retailPriceFormatted,
        buyPrice: platinumData.buyPrice,
        buyPriceFormatted: platinumData.buyPriceFormatted,
        buyChangePercent: platinumData.buyChangePercent,
        changeDirection: platinumData.changeDirection,
        lastUpdated: platinumData.lastUpdated
      } : null
    };
  } catch (error) {
    console.error("金属価格取得エラー:", error);
    return { gold: null, platinum: null };
  }
}
const loader$3 = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "true";
  const [metalPrices, selectedProducts, selectedCollections, shopSetting] = await Promise.all([
    fetchMetalPrices(),
    prisma$1.selectedProduct.findMany({
      where: {
        shopDomain: session.shop,
        selected: true
      },
      select: { productId: true, metalType: true }
    }),
    prisma$1.selectedCollection.findMany({
      where: {
        shopDomain: session.shop,
        selected: true
      },
      select: { collectionId: true, metalType: true }
    }),
    prisma$1.shopSetting.findUnique({
      where: { shopDomain: session.shop }
    })
  ]);
  const selectedProductIds = selectedProducts.map((p) => p.productId);
  const selectedCollectionIds = selectedCollections.map((c) => c.collectionId);
  const productsPromise = fetchAllProducts(admin);
  const collectionsPromise = fetchAllCollections(admin).catch((e) => {
    console.error("fetchAllCollections failed:", e);
    return [];
  });
  return defer({
    products: productsPromise,
    // Promise を渡す
    collections: collectionsPromise,
    // Promise を渡す
    goldPrice: metalPrices.gold,
    platinumPrice: metalPrices.platinum,
    selectedProductIds,
    savedSelectedProducts: selectedProducts,
    selectedCollectionIds,
    savedSelectedCollections: selectedCollections,
    shopSetting,
    forceRefresh,
    cacheTimestamp: Date.now()
  });
};
const action$1 = async ({ request }) => {
  var _a, _b;
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  if (action2 === "saveSelection") {
    const ids = formData.getAll("productId").map(String);
    const types = formData.getAll("metalType").map((v) => v === "platinum" ? "platinum" : "gold");
    const pairs = Array.from(
      new Map(ids.map((id, i) => [id, types[i]])).entries()
    );
    const saved = [];
    for (const [productId, metalType] of pairs) {
      await prisma$1.selectedProduct.upsert({
        where: { shopDomain_productId: { shopDomain: session.shop, productId } },
        update: { metalType, selected: true },
        create: { shopDomain: session.shop, productId, selected: true, metalType }
      });
      saved.push({ productId, metalType });
    }
    return json({
      success: true,
      message: `${saved.length}件を保存しました`,
      savedProducts: saved
    });
  }
  if (action2 === "saveSingleProduct") {
    const productId = formData.get("productId");
    const metalType = formData.get("metalType");
    await prisma$1.selectedProduct.upsert({
      where: {
        shopDomain_productId: {
          shopDomain: session.shop,
          productId
        }
      },
      update: {
        metalType: metalType === "platinum" ? "platinum" : "gold",
        selected: true
      },
      create: {
        shopDomain: session.shop,
        productId,
        selected: true,
        metalType: metalType === "platinum" ? "platinum" : "gold"
      }
    });
    return json({
      success: true,
      message: `商品の金属種別を${metalType === "platinum" ? "プラチナ" : "金"}に設定しました`,
      savedProducts: [{ productId, metalType }]
    });
  }
  if (action2 === "unselectProducts") {
    const productIds = formData.getAll("productId").map(String);
    await prisma$1.selectedProduct.deleteMany({
      where: {
        shopDomain: session.shop,
        productId: { in: productIds }
      }
    });
    return json({
      success: true,
      message: `${productIds.length}件の商品選択を解除しました`,
      unselectedProducts: productIds
    });
  }
  if (action2 === "updatePrices") {
    const idsFromUI = JSON.parse(formData.get("selectedProductIds") || "[]");
    const minPriceRate = parseFloat(formData.get("minPriceRate"));
    try {
      const result = await runBulkUpdateBySpec(admin, session.shop, {
        onlyProductIds: idsFromUI.length > 0 ? idsFromUI : null,
        minPriceRate
      });
      if (!result.ok) {
        return json({
          error: result.reason,
          disabled: result.disabled,
          updateResults: []
        });
      }
      try {
        const setting = await prisma$1.shopSetting.findUnique({
          where: { shopDomain: session.shop },
          select: { notificationEmail: true }
        });
        const updatedCount = ((_a = result.summary) == null ? void 0 : _a.success) ?? result.updated ?? 0;
        const failedCount = ((_b = result.summary) == null ? void 0 : _b.failed) ?? result.failed ?? 0;
        if ((setting == null ? void 0 : setting.notificationEmail) && updatedCount > 0) {
          const emailData = {
            shopDomain: session.shop,
            updatedCount,
            failedCount,
            goldRatio: typeof result.goldRatio === "number" ? `${(result.goldRatio * 100).toFixed(2)}%` : void 0,
            platinumRatio: typeof result.platinumRatio === "number" ? `${(result.platinumRatio * 100).toFixed(2)}%` : void 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            details: result.details
          };
          const emailRes = await sendPriceUpdateNotification(setting.notificationEmail, emailData);
          if (!emailRes.success) {
            console.error("📧 手動更新メール送信失敗:", emailRes.error);
          }
        }
      } catch (mailErr) {
        console.error("📧 手動更新メール通知エラー:", mailErr);
      }
      return json({
        updateResults: result.details,
        summary: result.summary,
        goldRatio: result.goldRatio,
        message: result.message
      });
    } catch (error) {
      return json({
        error: `価格更新中にエラーが発生しました: ${error.message}`,
        updateResults: []
      });
    }
  }
  if (action2 === "saveCollectionSelection") {
    const collectionId = formData.get("collectionId");
    const metalType = formData.get("metalType") === "platinum" ? "platinum" : "gold";
    try {
      await prisma$1.selectedCollection.upsert({
        where: { shopDomain_collectionId: { shopDomain: session.shop, collectionId } },
        update: { selected: true, metalType },
        create: { shopDomain: session.shop, collectionId, selected: true, metalType }
      });
      const productIds = await fetchProductIdsByCollection(admin, collectionId);
      const saved = [];
      for (const productId of productIds) {
        await prisma$1.selectedProduct.upsert({
          where: { shopDomain_productId: { shopDomain: session.shop, productId } },
          update: { selected: true, metalType },
          create: { shopDomain: session.shop, productId, selected: true, metalType }
        });
        saved.push({ productId, metalType });
      }
      return json({
        success: true,
        message: `コレクション内 ${saved.length}件を${metalType === "platinum" ? "プラチナ" : "金"}で登録しました`,
        savedProducts: saved,
        savedCollection: { collectionId, metalType }
      });
    } catch (error) {
      return json({
        error: `コレクション商品登録中にエラーが発生しました: ${error.message}`,
        success: false
      });
    }
  }
  if (action2 === "unselectCollection") {
    const collectionId = formData.get("collectionId");
    try {
      await prisma$1.selectedCollection.deleteMany({
        where: { shopDomain: session.shop, collectionId }
      });
      const ids = await fetchProductIdsByCollection(admin, collectionId);
      await prisma$1.selectedProduct.deleteMany({
        where: { shopDomain: session.shop, productId: { in: ids } }
      });
      return json({
        success: true,
        message: `コレクション内 ${ids.length}件の登録を解除しました`,
        unselectedProducts: ids,
        unselectedCollection: collectionId
      });
    } catch (error) {
      return json({
        error: `コレクション商品解除中にエラーが発生しました: ${error.message}`,
        success: false
      });
    }
  }
  return json({ error: "不正なアクション" });
};
function ProductsContent({ products, collections, goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, selectedCollectionIds, savedSelectedCollections, shopSetting, forceRefresh, cacheTimestamp }) {
  var _a, _b;
  const mu = useFetcher();
  const updater = useFetcher();
  const revalidator = useRevalidator();
  const savedTypeMap = useMemo(() => {
    const m = {};
    (savedSelectedProducts || []).forEach((sp) => {
      m[sp.productId] = sp.metalType;
    });
    return m;
  }, [savedSelectedProducts]);
  const savedCollectionTypeMap = useMemo(() => {
    const m = {};
    (savedSelectedCollections || []).forEach((sc) => {
      m[sc.collectionId] = sc.metalType;
    });
    return m;
  }, [savedSelectedCollections]);
  useMemo(
    () => new Set((savedSelectedProducts || []).map((sp) => sp.productId)),
    [savedSelectedProducts]
  );
  useMemo(
    () => new Set((savedSelectedCollections || []).map((sc) => sc.collectionId)),
    [savedSelectedCollections]
  );
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productMetalTypes, setProductMetalTypes] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectionType, setSelectionType] = useState("products");
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");
  const [minPriceRate, setMinPriceRate] = useState((shopSetting == null ? void 0 : shopSetting.minPricePct) || 93);
  const [showPreview, setShowPreview] = useState(false);
  const [pricePreview, setPricePreview] = useState([]);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCollections, setSelectedCollections] = useState(selectedCollectionIds || []);
  const [collectionMetalTypes, setCollectionMetalTypes] = useState(savedCollectionTypeMap || {});
  const [savedIdSet, setSavedIdSet] = useState(
    () => new Set((savedSelectedProducts || []).map((sp) => sp.productId))
  );
  const addSaved = useCallback((ids) => {
    setSavedIdSet((prev) => /* @__PURE__ */ new Set([...prev, ...ids]));
  }, []);
  const removeSaved = useCallback((ids) => {
    setSavedIdSet((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);
  const revalidateTimer = useRef(null);
  const scheduleRevalidate = useCallback(() => {
    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
    revalidateTimer.current = setTimeout(() => {
      revalidator.revalidate();
      revalidateTimer.current = null;
    }, 500);
  }, [revalidator]);
  useEffect(() => () => {
    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
  }, []);
  useEffect(() => {
    if (!forceRefresh) {
      const cachedProducts = ClientCache.get(CACHE_KEYS.PRODUCTS);
      if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
        setIsUsingCache(true);
        const cacheInfo = ClientCache.getInfo(CACHE_KEYS.PRODUCTS);
        if (cacheInfo) {
          setLastUpdated(new Date(cacheInfo.timestamp));
        }
        if (selectedProductIds && selectedProductIds.length > 0) {
          const persistedSelected = cachedProducts.filter((p) => selectedProductIds.includes(p.id));
          setSelectedProducts(persistedSelected);
          if (savedSelectedProducts && savedSelectedProducts.length > 0) {
            const metalTypeMap = {};
            savedSelectedProducts.forEach((sp) => {
              metalTypeMap[sp.productId] = sp.metalType;
            });
            setProductMetalTypes(metalTypeMap);
          }
        }
        return;
      }
    }
    if (products && products.length > 0) {
      ClientCache.set(CACHE_KEYS.PRODUCTS, products);
      setIsUsingCache(false);
      setLastUpdated(new Date(cacheTimestamp));
      if (selectedProductIds && selectedProductIds.length > 0) {
        const persistedSelected = products.filter((p) => selectedProductIds.includes(p.id));
        setSelectedProducts(persistedSelected);
        if (savedSelectedProducts && savedSelectedProducts.length > 0) {
          const metalTypeMap = {};
          savedSelectedProducts.forEach((sp) => {
            metalTypeMap[sp.productId] = sp.metalType;
          });
          setProductMetalTypes(metalTypeMap);
        }
      }
    }
  }, [products, selectedProductIds, forceRefresh, cacheTimestamp]);
  useEffect(() => {
    if (mu.state === "idle" && mu.data) {
      if (mu.data.savedProducts) {
        const savedIds2 = mu.data.savedProducts.map((p) => p.productId);
        setSelectedProducts((prev) => prev.filter((p) => !savedIds2.includes(p.id)));
        addSaved(savedIds2);
      }
      if (mu.data.savedCollection) {
        const { collectionId, metalType } = mu.data.savedCollection;
        setSelectedCollections((prev) => [...prev.filter((id) => id !== collectionId), collectionId]);
        setCollectionMetalTypes((prev) => ({ ...prev, [collectionId]: metalType }));
      }
      if (mu.data.unselectedProducts) {
        const removed = new Set(mu.data.unselectedProducts);
        setSelectedProducts((prev) => prev.filter((p) => !removed.has(p.id)));
        setProductMetalTypes((prev) => {
          const next = { ...prev };
          mu.data.unselectedProducts.forEach((id) => delete next[id]);
          return next;
        });
        removeSaved(mu.data.unselectedProducts);
        scheduleRevalidate();
      }
      if (mu.data.unselectedCollection) {
        const collectionId = mu.data.unselectedCollection;
        setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
        setCollectionMetalTypes((prev) => {
          const next = { ...prev };
          delete next[collectionId];
          return next;
        });
        scheduleRevalidate();
      }
    }
  }, [mu.state, mu.data, addSaved, removeSaved, scheduleRevalidate]);
  const handleRefresh = useCallback(() => {
    ClientCache.clear(CACHE_KEYS.PRODUCTS);
    setIsUsingCache(false);
    revalidator.revalidate();
  }, [revalidator]);
  const filteredProducts = filterProducts(products, searchValue, filterType);
  const handleSelectProduct = useCallback((productId, isSelected) => {
    const product = products.find((p) => p.id === productId);
    if (isSelected) {
      setSelectedProducts((prev) => [...prev, product]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
      setProductMetalTypes((prev) => {
        const newTypes = { ...prev };
        delete newTypes[productId];
        return newTypes;
      });
    }
  }, [products]);
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedProducts(filteredProducts);
    } else {
      setSelectedProducts([]);
      setProductMetalTypes({});
    }
  }, [filteredProducts]);
  const handleMetalTypeChange = useCallback((productId, metalType) => {
    setProductMetalTypes((prev) => ({ ...prev, [productId]: metalType }));
    addSaved([productId]);
    const formData = new FormData();
    formData.append("action", "saveSingleProduct");
    formData.append("productId", productId);
    formData.append("metalType", metalType);
    mu.submit(formData, { method: "post" });
  }, [mu, addSaved]);
  const handleSelectCollection = useCallback((collectionId, checked) => {
    setSelectedCollections(
      (prev) => checked ? [.../* @__PURE__ */ new Set([...prev, collectionId])] : prev.filter((id) => id !== collectionId)
    );
    if (!checked) {
      const fd = new FormData();
      fd.append("action", "unselectCollection");
      fd.append("collectionId", collectionId);
      mu.submit(fd, { method: "post" });
    }
  }, [mu]);
  const handleCollectionMetalTypeChange = useCallback((collectionId, type) => {
    setCollectionMetalTypes((prev) => ({ ...prev, [collectionId]: type }));
    const fd = new FormData();
    fd.append("action", "saveCollectionSelection");
    fd.append("collectionId", collectionId);
    fd.append("metalType", type);
    mu.submit(fd, { method: "post" });
  }, [mu]);
  const handleBulkMetalTypeChange = useCallback((metalType) => {
    const targetProducts = selectedProducts.filter((product) => !selectedProductIds.includes(product.id));
    if (targetProducts.length === 0) return;
    const newMetalTypes = {};
    targetProducts.forEach((product) => {
      newMetalTypes[product.id] = metalType;
    });
    setProductMetalTypes((prev) => ({ ...prev, ...newMetalTypes }));
    addSaved(targetProducts.map((p) => p.id));
    const formData = new FormData();
    formData.append("action", "saveSelection");
    targetProducts.forEach((product) => {
      formData.append("productId", product.id);
      formData.append("metalType", metalType);
    });
    mu.submit(formData, { method: "post" });
  }, [selectedProducts, selectedProductIds, mu, addSaved]);
  const saveSelection = useCallback(() => {
    const unsetProducts = selectedProducts.filter((product) => !productMetalTypes[product.id]);
    if (unsetProducts.length > 0) {
      alert(`以下の商品の金属種別を選択してください：
${unsetProducts.map((p) => p.title).join("\n")}`);
      return;
    }
    addSaved(selectedProducts.map((p) => p.id));
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach((product) => {
      formData.append("productId", product.id);
      formData.append("metalType", productMetalTypes[product.id]);
    });
    mu.submit(formData, { method: "post" });
  }, [selectedProducts, productMetalTypes, mu, addSaved]);
  useCallback((productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    setProductMetalTypes((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    removeSaved([productId]);
    const formData = new FormData();
    formData.append("action", "unselectProducts");
    formData.append("productId", productId);
    mu.submit(formData, { method: "post" });
  }, [mu, removeSaved]);
  const handleBulkUnselect = useCallback(() => {
    const ids = selectedProducts.filter((p) => savedIdSet.has(p.id)).map((p) => p.id);
    if (ids.length === 0) return;
    removeSaved(ids);
    setSelectedProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setProductMetalTypes((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    const fd = new FormData();
    fd.append("action", "unselectProducts");
    ids.forEach((id) => fd.append("productId", id));
    mu.submit(fd, { method: "post" });
  }, [selectedProducts, savedIdSet, removeSaved, mu]);
  const generatePricePreview = useCallback(() => {
    if (selectedProducts.length === 0) return;
    const preview = selectedProducts.map((product) => {
      const metalType = productMetalTypes[product.id] || "gold";
      const priceData = metalType === "gold" ? goldPrice : platinumPrice;
      if (!priceData) {
        return {
          ...product,
          metalType,
          error: `${metalType === "gold" ? "金" : "プラチナ"}価格データが取得できません`,
          variants: product.variants.edges.map((edge) => ({
            ...edge.node,
            currentPrice: parseFloat(edge.node.price),
            newPrice: parseFloat(edge.node.price),
            priceChange: 0,
            changed: false
          }))
        };
      }
      return {
        ...product,
        metalType,
        variants: product.variants.edges.map((edge) => {
          const variant = edge.node;
          const currentPrice = parseFloat(variant.price);
          const newPrice = calculateNewPrice(currentPrice, priceData.ratio, minPriceRate / 100);
          return {
            ...variant,
            currentPrice,
            newPrice,
            priceChange: newPrice - currentPrice,
            changed: newPrice !== currentPrice
          };
        })
      };
    });
    setPricePreview(preview);
    setShowPreview(true);
  }, [selectedProducts, goldPrice, platinumPrice, productMetalTypes, minPriceRate]);
  const executePriceUpdate = useCallback(() => {
    const hasGoldProducts = selectedProducts.some((p) => (productMetalTypes[p.id] || "gold") === "gold");
    const hasPlatinumProducts = selectedProducts.some((p) => productMetalTypes[p.id] === "platinum");
    if (hasGoldProducts && !goldPrice) return;
    if (hasPlatinumProducts && !platinumPrice) return;
    const ids = selectedProducts.map((p) => p.id);
    updater.submit(
      {
        action: "updatePrices",
        selectedProductIds: JSON.stringify(ids),
        minPriceRate: minPriceRate.toString()
      },
      { method: "post" }
    );
    setShowPreview(false);
  }, [selectedProducts, goldPrice, platinumPrice, productMetalTypes, minPriceRate, updater]);
  return /* @__PURE__ */ jsx(
    Page,
    {
      fullWidth: true,
      title: "商品価格自動調整",
      subtitle: selectionType === "products" ? `${filteredProducts.length}件の商品（全${products.length}件）` : `${(collections == null ? void 0 : collections.length) ?? 0}件のコレクション`,
      primaryAction: {
        content: "価格調整プレビュー",
        onAction: generatePricePreview,
        disabled: selectionType !== "products" || selectedProducts.length === 0 || selectedProducts.some((p) => (productMetalTypes[p.id] || "gold") === "gold") && !goldPrice || selectedProducts.some((p) => productMetalTypes[p.id] === "platinum") && !platinumPrice,
        loading: selectionType === "products" && updater.state === "submitting"
      },
      secondaryActions: [
        {
          content: "商品を再読み込み",
          icon: RefreshIcon,
          onAction: handleRefresh,
          loading: revalidator.state === "loading"
        }
      ],
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsxs(Layout.Section, { children: [
          /* @__PURE__ */ jsxs(Layout, { children: [
            /* @__PURE__ */ jsxs(Layout.Section, { children: [
              goldPrice && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "16px", background: "#fbbf24", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
                /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
                  /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: "20px" }, children: "🥇" }),
                    /* @__PURE__ */ jsx("h3", { style: { color: "white" }, children: "田中貴金属 金価格情報" })
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { tone: goldPrice.changeDirection === "up" ? "critical" : goldPrice.changeDirection === "down" ? "success" : "info", children: goldPrice.changeDirection === "up" ? "上昇" : goldPrice.changeDirection === "down" ? "下落" : "変動なし" })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "400", wrap: true, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "店頭小売価格（税込）" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: goldPrice.retailPriceFormatted })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "小売価格前日比" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: goldPrice.change })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "店頭買取価格（税込）" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: goldPrice.buyPriceFormatted || "取得失敗" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "買取価格前日比" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: goldPrice.buyChangePercent || "0.00%" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "価格調整率" }),
                    /* @__PURE__ */ jsxs("h4", { style: { color: "white", margin: "4px 0" }, children: [
                      goldPrice.percentage,
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { marginTop: "12px" }, children: /* @__PURE__ */ jsxs("p", { style: { color: "white", margin: 0, fontSize: "11px" }, children: [
                  "出典: ",
                  /* @__PURE__ */ jsx("a", { href: "https://gold.tanaka.co.jp/commodity/souba/", target: "_blank", rel: "noopener noreferrer", style: { color: "white", textDecoration: "underline" }, children: "田中貴金属工業株式会社" })
                ] }) }),
                /* @__PURE__ */ jsxs("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: [
                  "最終更新: ",
                  new Date(goldPrice.lastUpdated).toLocaleString("ja-JP")
                ] })
              ] }) }) }),
              !goldPrice && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: "金価格情報の取得に失敗しました。" })
            ] }),
            /* @__PURE__ */ jsxs(Layout.Section, { children: [
              platinumPrice && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "16px", background: "#94a3b8", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
                /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
                  /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: "20px" }, children: "🥈" }),
                    /* @__PURE__ */ jsx("h3", { style: { color: "white" }, children: "田中貴金属 プラチナ価格情報" })
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { tone: platinumPrice.changeDirection === "up" ? "critical" : platinumPrice.changeDirection === "down" ? "success" : "info", children: platinumPrice.changeDirection === "up" ? "上昇" : platinumPrice.changeDirection === "down" ? "下落" : "変動なし" })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "400", wrap: true, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "店頭小売価格（税込）" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: platinumPrice.retailPriceFormatted })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "小売価格前日比" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: platinumPrice.change })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "店頭買取価格（税込）" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: platinumPrice.buyPriceFormatted || "取得失敗" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "買取価格前日比" }),
                    /* @__PURE__ */ jsx("h4", { style: { color: "white", margin: "4px 0" }, children: platinumPrice.buyChangePercent || "0.00%" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: "価格調整率" }),
                    /* @__PURE__ */ jsxs("h4", { style: { color: "white", margin: "4px 0" }, children: [
                      platinumPrice.percentage,
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { marginTop: "12px" }, children: /* @__PURE__ */ jsxs("p", { style: { color: "white", margin: 0, fontSize: "11px" }, children: [
                  "出典: ",
                  /* @__PURE__ */ jsx("a", { href: "https://gold.tanaka.co.jp/commodity/souba/d-platinum.php", target: "_blank", rel: "noopener noreferrer", style: { color: "white", textDecoration: "underline" }, children: "田中貴金属工業株式会社" })
                ] }) }),
                /* @__PURE__ */ jsxs("p", { style: { color: "white", margin: 0, fontSize: "12px" }, children: [
                  "最終更新: ",
                  new Date(platinumPrice.lastUpdated).toLocaleString("ja-JP")
                ] })
              ] }) }) }),
              !platinumPrice && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: "プラチナ価格情報の取得に失敗しました。" })
            ] })
          ] }),
          !goldPrice && !platinumPrice && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: "金・プラチナ価格情報の取得に失敗しました。価格調整機能をご利用いただけません。" })
        ] }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
            /* @__PURE__ */ jsx("h3", { children: "商品検索・選択" }),
            /* @__PURE__ */ jsx(
              Button,
              {
                icon: RefreshIcon,
                variant: "tertiary",
                onClick: handleRefresh,
                loading: revalidator.state === "loading",
                children: "商品を再読み込み"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Text, { variant: "bodySm", tone: "subdued", children: [
            "最終更新: ",
            lastUpdated ? lastUpdated.toLocaleString("ja-JP") : "読み込み中...",
            isUsingCache && /* @__PURE__ */ jsx(Badge, { tone: "info", size: "small", children: "キャッシュ" })
          ] }) }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
            /* @__PURE__ */ jsx("div", { style: { minWidth: "180px" }, children: /* @__PURE__ */ jsx(
              Select,
              {
                label: "表示する内容",
                options: [
                  { label: "全ての商品", value: "products" },
                  { label: "全てのコレクション", value: "collections" }
                ],
                value: selectionType,
                onChange: setSelectionType
              }
            ) }),
            selectionType === "products" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "商品検索",
                  value: searchValue,
                  onChange: setSearchValue,
                  placeholder: "商品名またはハンドルで検索...",
                  clearButton: true,
                  onClearButtonClick: () => setSearchValue("")
                }
              ) }),
              /* @__PURE__ */ jsx("div", { style: { minWidth: "150px" }, children: /* @__PURE__ */ jsx(
                Select,
                {
                  label: "商品フィルター",
                  options: [
                    { label: "すべての商品", value: "all" },
                    { label: "K18商品のみ", value: "k18" }
                  ],
                  value: filterType,
                  onChange: setFilterType
                }
              ) })
            ] }),
            selectionType === "collections" && /* @__PURE__ */ jsx("div", { style: { minWidth: "200px" }, children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "コレクションを選択して商品を表示" }) })
          ] }),
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "価格下限設定 (%)",
              type: "number",
              value: minPriceRate.toString(),
              onChange: (value) => setMinPriceRate(parseInt(value) || 93),
              suffix: "%",
              helpText: "現在価格に対する最低価格の割合（例: 93% = 7%以上は下がらない）",
              min: "50",
              max: "100"
            }
          ),
          /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: "300", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => handleSelectAll(true),
                  disabled: filteredProducts.length === 0,
                  size: "large",
                  children: "すべて選択"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => handleSelectAll(false),
                  disabled: selectedProducts.length === 0,
                  size: "large",
                  children: "選択解除"
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleBulkUnselect,
                  tone: "critical",
                  disabled: selectedProducts.filter((p) => savedIdSet.has(p.id)).length === 0 || mu.state === "submitting",
                  size: "large",
                  children: [
                    "選択中の保存済み ",
                    selectedProducts.filter((p) => savedIdSet.has(p.id)).length,
                    " 件を解除"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: saveSelection,
                  disabled: mu.state === "submitting" || selectedProducts.length === 0 || selectedProducts.some((p) => !productMetalTypes[p.id]),
                  variant: "primary",
                  size: "large",
                  children: "選択を保存"
                }
              )
            ] }),
            selectedProducts.length > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", as: "span", children: [
                  "新規選択商品(",
                  selectedProducts.filter((p) => !selectedProductIds.includes(p.id)).length,
                  "件)に一括設定:"
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: () => handleBulkMetalTypeChange("gold"),
                    disabled: selectedProducts.filter((p) => !selectedProductIds.includes(p.id)).length === 0,
                    tone: "warning",
                    children: "🥇 選択した全ての商品を金価格に設定"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: () => handleBulkMetalTypeChange("platinum"),
                    disabled: selectedProducts.filter((p) => !selectedProductIds.includes(p.id)).length === 0,
                    tone: "info",
                    children: "🥈 選択した全ての商品をプラチナ価格に設定"
                  }
                )
              ] }),
              selectedProducts.filter((p) => selectedProductIds.includes(p.id)).length > 0 && /* @__PURE__ */ jsxs(Text, { variant: "bodySm", tone: "subdued", children: [
                "※既に保存済みの",
                selectedProducts.filter((p) => selectedProductIds.includes(p.id)).length,
                "件は一括設定の対象外です"
              ] })
            ] }) })
          ] }),
          selectedProducts.length > 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsxs("h4", { children: [
                "選択中の商品 (",
                selectedProducts.length,
                "件)"
              ] }),
              /* @__PURE__ */ jsxs(InlineStack, { gap: "200", children: [
                /* @__PURE__ */ jsxs(Badge, { tone: "warning", children: [
                  "🥇 金: ",
                  selectedProducts.filter((p) => productMetalTypes[p.id] === "gold").length,
                  "件"
                ] }),
                /* @__PURE__ */ jsxs(Badge, { tone: "info", children: [
                  "🥈 プラチナ: ",
                  selectedProducts.filter((p) => productMetalTypes[p.id] === "platinum").length,
                  "件"
                ] }),
                /* @__PURE__ */ jsxs(Badge, { tone: "critical", children: [
                  "⚠️ 未設定: ",
                  selectedProducts.filter((p) => !productMetalTypes[p.id]).length,
                  "件"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(BlockStack, { gap: "200", children: selectedProducts.map((product) => {
              const metalType = productMetalTypes[product.id];
              return /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "14px" }, children: metalType === "gold" ? "🥇" : metalType === "platinum" ? "🥈" : "⚠️" }),
                /* @__PURE__ */ jsx(Text, { variant: "bodySm", children: product.title }),
                metalType ? /* @__PURE__ */ jsx(Badge, { tone: metalType === "gold" ? "warning" : "info", size: "small", children: metalType === "gold" ? "金価格" : "プラチナ価格" }) : /* @__PURE__ */ jsx(Badge, { tone: "critical", size: "small", children: "金属種別未選択" })
              ] }, product.id);
            }) }),
            selectedProducts.filter((p) => !productMetalTypes[p.id]).length > 0 && /* @__PURE__ */ jsxs(Banner, { tone: "warning", children: [
              /* @__PURE__ */ jsx("strong", { children: "金属種別未選択の商品があります。" }),
              "各商品の金属種別（金価格 または プラチナ価格）を選択してから保存してください。"
            ] })
          ] }) }),
          selectedProductIds && selectedProductIds.length > 0 && /* @__PURE__ */ jsxs(Banner, { tone: "success", children: [
            "現在 ",
            /* @__PURE__ */ jsxs("strong", { children: [
              selectedProductIds.length,
              "件"
            ] }),
            " の商品が自動更新対象として保存されています"
          ] }),
          ((_a = mu.data) == null ? void 0 : _a.message) && /* @__PURE__ */ jsx(Banner, { tone: "success", children: mu.data.message })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
          selectionType === "collections" && ((collections == null ? void 0 : collections.length) ?? 0) === 0 && /* @__PURE__ */ jsx(Banner, { tone: "info", children: "コレクションが見つかりません。" }),
          /* @__PURE__ */ jsx("div", { style: {
            width: "100%",
            overflowX: "auto",
            overflowAnchor: "none"
          }, children: /* @__PURE__ */ jsx("div", { style: { minWidth: 1680 }, children: /* @__PURE__ */ jsx(
            IndexTable,
            {
              resourceName: {
                singular: selectionType === "products" ? "商品" : "コレクション",
                plural: selectionType === "products" ? "商品" : "コレクション"
              },
              itemCount: selectionType === "products" ? filteredProducts.length : (collections == null ? void 0 : collections.length) || 0,
              selectedItemsCount: selectedProducts.length,
              onSelectionChange: (selectionType2) => {
                if (selectionType2 === "all") {
                  handleSelectAll(true);
                } else if (selectionType2 === "none") {
                  handleSelectAll(false);
                }
              },
              headings: selectionType === "products" ? [
                { title: "選択" },
                { title: "商品名" },
                { title: "ステータス" },
                { title: "価格" },
                { title: "バリエーション" },
                { title: "連動設定" }
              ] : [
                { title: "選択" },
                { title: "コレクション名" },
                { title: "商品数" },
                { title: "ハンドル" },
                { title: "連動設定" }
              ],
              selectable: false,
              children: selectionType === "products" ? filteredProducts.map((product, index) => {
                var _a2;
                const isSelected = selectedProducts.some((p) => p.id === product.id);
                const variants = product.variants.edges;
                const priceRange = variants.length > 1 ? `¥${Math.min(...variants.map((v) => parseFloat(v.node.price)))} - ¥${Math.max(...variants.map((v) => parseFloat(v.node.price)))}` : `¥${((_a2 = variants[0]) == null ? void 0 : _a2.node.price) || 0}`;
                const metalType = productMetalTypes[product.id];
                const isSaved = savedIdSet.has(product.id);
                const displayType = productMetalTypes[product.id] ?? savedTypeMap[product.id] ?? "";
                return /* @__PURE__ */ jsxs(
                  IndexTable.Row,
                  {
                    id: product.id,
                    children: [
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "60px", maxWidth: "60px", children: /* @__PURE__ */ jsx(
                        Checkbox$1,
                        {
                          checked: isSelected,
                          onChange: (checked) => handleSelectProduct(product.id, checked)
                        }
                      ) }) }),
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "480px", maxWidth: "720px", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                        isSelected && metalType && /* @__PURE__ */ jsx("span", { style: { fontSize: "16px" }, children: metalType === "gold" ? "🥇" : "🥈" }),
                        /* @__PURE__ */ jsx(Tooltip, { content: product.title, dismissOnMouseOut: true, children: /* @__PURE__ */ jsx(
                          Text,
                          {
                            as: "span",
                            variant: "bodySm",
                            style: {
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              whiteSpace: "normal",
                              wordBreak: "break-word"
                            },
                            children: product.title
                          }
                        ) }),
                        isSelected && metalType && /* @__PURE__ */ jsx(Badge, { tone: metalType === "gold" ? "warning" : "info", size: "small", children: metalType === "gold" ? "金" : "Pt" }),
                        isSelected && !metalType && !isSaved && /* @__PURE__ */ jsx(Badge, { tone: "critical", size: "small", children: "未設定" }),
                        isSaved && /* @__PURE__ */ jsx(Badge, { tone: "success", size: "small", children: "保存済" })
                      ] }) }) }),
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "100px", maxWidth: "120px", children: /* @__PURE__ */ jsx(Badge, { status: product.status === "ACTIVE" ? "success" : "critical", children: product.status }) }) }),
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "140px", maxWidth: "200px", children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", children: priceRange }) }) }),
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "100px", maxWidth: "140px", children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", children: variants.length }) }) }),
                      /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "360px", maxWidth: "420px", children: isSelected || isSaved ? /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx(
                          Select,
                          {
                            label: "金属種別",
                            labelHidden: true,
                            options: [
                              { label: "金属種別を選択...", value: "", disabled: true },
                              { label: "🥇 金価格", value: "gold" },
                              { label: "🥈 プラチナ価格", value: "platinum" }
                            ],
                            value: displayType,
                            onChange: (value) => handleMetalTypeChange(product.id, value),
                            placeholder: "選択してください",
                            disabled: isSaved && !isSelected
                          }
                        ),
                        !displayType && isSelected && !isSaved && /* @__PURE__ */ jsx("div", { style: { marginTop: "4px" }, children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "critical", children: "※選択が必要です" }) }),
                        isSaved && /* @__PURE__ */ jsx("div", { style: { marginTop: "4px" }, children: /* @__PURE__ */ jsxs(InlineStack, { gap: "100", blockAlign: "center", children: [
                          /* @__PURE__ */ jsxs(Text, { variant: "bodySm", tone: "subdued", children: [
                            "保存済み設定",
                            isSelected ? "（編集可）" : ""
                          ] }),
                          /* @__PURE__ */ jsx(
                            UnselectButton,
                            {
                              productId: product.id,
                              onOptimistic: (id) => {
                                setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
                                setProductMetalTypes((prev) => {
                                  const next = { ...prev };
                                  delete next[id];
                                  return next;
                                });
                                removeSaved([id]);
                              },
                              scheduleRevalidate
                            }
                          )
                        ] }) })
                      ] }) : /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "-" }) }) })
                    ]
                  },
                  product.id
                );
              }) : (
                // コレクション表示モード
                (collections == null ? void 0 : collections.map((collection) => {
                  const isChecked = selectedCollections.includes(collection.id);
                  const cType = collectionMetalTypes[collection.id] || "";
                  return /* @__PURE__ */ jsxs(
                    IndexTable.Row,
                    {
                      id: collection.id,
                      children: [
                        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "60px", maxWidth: "60px", children: /* @__PURE__ */ jsx(
                          Checkbox$1,
                          {
                            checked: isChecked,
                            onChange: (checked) => handleSelectCollection(collection.id, checked)
                          }
                        ) }) }),
                        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "320px", maxWidth: "480px", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                          /* @__PURE__ */ jsx("span", { style: { fontSize: "16px" }, children: "📦" }),
                          /* @__PURE__ */ jsx(Tooltip, { content: collection.title, dismissOnMouseOut: true, children: /* @__PURE__ */ jsx(
                            Text,
                            {
                              variant: "bodyMd",
                              fontWeight: "medium",
                              style: {
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                whiteSpace: "normal",
                                wordBreak: "break-word"
                              },
                              children: collection.title
                            }
                          ) }),
                          isChecked && cType && /* @__PURE__ */ jsx(Badge, { tone: cType === "gold" ? "warning" : "info", size: "small", children: cType === "gold" ? "金" : "Pt" })
                        ] }) }) }),
                        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "120px", maxWidth: "160px", children: /* @__PURE__ */ jsxs(Badge, { tone: "info", children: [
                          collection.productsCount ?? "-",
                          "件の商品"
                        ] }) }) }),
                        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "150px", maxWidth: "200px", children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: collection.handle }) }) }),
                        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsx(Box, { minWidth: "280px", maxWidth: "340px", children: isChecked ? /* @__PURE__ */ jsx(
                          Select,
                          {
                            label: "金属種別",
                            labelHidden: true,
                            options: [
                              { label: "金属種別を選択...", value: "", disabled: true },
                              { label: "🥇 金価格", value: "gold" },
                              { label: "🥈 プラチナ価格", value: "platinum" }
                            ],
                            value: cType,
                            onChange: (v) => handleCollectionMetalTypeChange(collection.id, v),
                            placeholder: "選択してください"
                          }
                        ) : /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "-" }) }) })
                      ]
                    },
                    collection.id
                  );
                })) || []
              )
            }
          ) }) })
        ] }) }),
        /* @__PURE__ */ jsx(
          Modal,
          {
            open: showPreview,
            onClose: () => setShowPreview(false),
            title: "価格調整プレビュー",
            primaryAction: {
              content: "価格を更新",
              onAction: executePriceUpdate,
              loading: updater.state === "submitting"
            },
            secondaryActions: [
              {
                content: "キャンセル",
                onAction: () => setShowPreview(false)
              }
            ],
            large: true,
            children: /* @__PURE__ */ jsx(Modal.Section, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: pricePreview.map((product) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
                /* @__PURE__ */ jsx("h4", { children: product.title }),
                /* @__PURE__ */ jsx(Badge, { tone: product.metalType === "gold" ? "warning" : "info", children: product.metalType === "gold" ? "金価格" : "プラチナ価格" })
              ] }),
              product.error ? /* @__PURE__ */ jsx(Banner, { tone: "critical", children: product.error }) : product.variants.map((variant) => /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
                /* @__PURE__ */ jsx("span", { children: variant.title || "デフォルト" }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "200", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "¥",
                    variant.currentPrice,
                    " → ¥",
                    variant.newPrice
                  ] }),
                  variant.changed && /* @__PURE__ */ jsxs(Badge, { tone: variant.priceChange > 0 ? "warning" : "success", children: [
                    variant.priceChange > 0 ? "+" : "",
                    variant.priceChange,
                    "円"
                  ] })
                ] })
              ] }, variant.id))
            ] }) }, product.id)) }) })
          }
        ),
        ((_b = updater.data) == null ? void 0 : _b.updateResults) && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx("h3", { children: "価格更新結果" }),
          updater.data.summary && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "合計: ",
              /* @__PURE__ */ jsx("strong", { children: updater.data.summary.total }),
              "件"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "成功: ",
              /* @__PURE__ */ jsx("strong", { children: updater.data.summary.success }),
              "件"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "失敗: ",
              /* @__PURE__ */ jsx("strong", { children: updater.data.summary.failed }),
              "件"
            ] })
          ] }) }),
          updater.data.error && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: updater.data.error }),
          updater.data.message && /* @__PURE__ */ jsx(Banner, { tone: "info", children: updater.data.message }),
          updater.data.updateResults.map((result, index) => {
            var _a2, _b2;
            return /* @__PURE__ */ jsx(
              Banner,
              {
                tone: result.success ? "success" : "critical",
                children: result.success ? `Variant ${result.variantId}: ¥${(_a2 = result.oldPrice) == null ? void 0 : _a2.toLocaleString()} → ¥${(_b2 = result.newPrice) == null ? void 0 : _b2.toLocaleString()}` : `Product ${result.productId} / Variant ${result.variantId}: ${result.error}`
              },
              index
            );
          })
        ] }) }) })
      ] })
    }
  );
}
function Products() {
  const data = useLoaderData();
  const { goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, selectedCollectionIds, savedSelectedCollections, shopSetting, forceRefresh, cacheTimestamp } = data;
  return /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx(
        Page,
        {
          fullWidth: true,
          title: "商品価格自動調整",
          subtitle: "読み込み中...",
          secondaryActions: [
            {
              content: "商品を再読み込み",
              icon: RefreshIcon,
              onAction: () => {
                ClientCache.clear(CACHE_KEYS.PRODUCTS);
                window.location.search = "?refresh=true";
              }
            }
          ],
          children: /* @__PURE__ */ jsxs(Layout, { children: [
            /* @__PURE__ */ jsx(Layout.Section, { children: goldPrice && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
              /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
                /* @__PURE__ */ jsx("h3", { children: "田中貴金属 金価格情報" }),
                /* @__PURE__ */ jsx(Badge, { tone: goldPrice.changeDirection === "up" ? "attention" : goldPrice.changeDirection === "down" ? "success" : "info", children: goldPrice.changeDirection === "up" ? "上昇" : goldPrice.changeDirection === "down" ? "下落" : "変動なし" })
              ] }),
              /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { children: "店頭小売価格（税込）" }),
                  /* @__PURE__ */ jsx("h4", { children: goldPrice.retailPriceFormatted })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { children: "小売価格前日比" }),
                  /* @__PURE__ */ jsx("h4", { children: goldPrice.change })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { children: "店頭買取価格（税込）" }),
                  /* @__PURE__ */ jsx("h4", { children: goldPrice.buyPriceFormatted || "取得失敗" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { children: "買取価格前日比" }),
                  /* @__PURE__ */ jsx("h4", { children: goldPrice.buyChangePercent || "0.00%" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsxs("strong", { children: [
                  "価格調整率: ",
                  goldPrice.percentage,
                  "%"
                ] }),
                "（この変動率で商品価格を自動調整します）"
              ] }) }),
              /* @__PURE__ */ jsxs("p", { children: [
                "最終更新: ",
                new Date(goldPrice.lastUpdated).toLocaleString("ja-JP")
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "60px 20px" }, children: [
              /* @__PURE__ */ jsx(Spinner$1, { size: "large" }),
              /* @__PURE__ */ jsx("p", { style: { marginTop: "20px" }, children: "商品データを読み込んでいます..." }),
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "初回読み込みには時間がかかります。次回からキャッシュにより高速表示されます。" })
            ] }) }) }) })
          ] })
        }
      ),
      children: /* @__PURE__ */ jsx(Await, { resolve: Promise.allSettled([data.products, data.collections]), children: ([p, c]) => {
        const products = p.status === "fulfilled" ? p.value : [];
        const collections = c.status === "fulfilled" ? c.value : [];
        return /* @__PURE__ */ jsx(
          ProductsContent,
          {
            products,
            collections,
            goldPrice,
            platinumPrice,
            selectedProductIds,
            savedSelectedProducts,
            selectedCollectionIds,
            savedSelectedCollections,
            shopSetting,
            forceRefresh,
            cacheTimestamp
          }
        );
      } })
    }
  );
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Products,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const setting = await prisma$1.shopSetting.upsert({
    where: { shopDomain: shop },
    update: {},
    create: {
      shopDomain: shop,
      minPricePct: 93,
      autoUpdateEnabled: false
    }
  });
  return json({ setting });
}
async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const form = await request.formData();
  const autoUpdateEnabled = form.get("autoUpdateEnabled") === "true";
  const minPricePct = Math.max(1, Math.min(100, Number(form.get("minPricePct") || 93)));
  const notificationEmail = String(form.get("notificationEmail") || "");
  await prisma$1.shopSetting.upsert({
    where: { shopDomain: shop },
    update: {
      autoUpdateEnabled,
      minPricePct,
      notificationEmail: notificationEmail || null
    },
    create: {
      shopDomain: shop,
      autoUpdateEnabled,
      minPricePct,
      notificationEmail: notificationEmail || null
    }
  });
  return json({
    success: true,
    message: "設定が正常に保存されました",
    setting: {
      autoUpdateEnabled,
      minPricePct,
      notificationEmail: notificationEmail || null
    }
  });
}
function Settings() {
  var _a, _b, _c, _d, _e;
  const { setting } = useLoaderData();
  const fetcher = useFetcher();
  const testEmailFetcher = useFetcher();
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(setting.autoUpdateEnabled);
  const [minPricePct, setMinPricePct] = useState(setting.minPricePct.toString());
  const [notificationEmail, setNotificationEmail] = useState(setting.notificationEmail || "");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEmailTestMessage, setShowEmailTestMessage] = useState(false);
  useEffect(() => {
    var _a2;
    if ((_a2 = fetcher.data) == null ? void 0 : _a2.success) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3e3);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);
  useEffect(() => {
    if (testEmailFetcher.data) {
      setShowEmailTestMessage(true);
      const timer = setTimeout(() => setShowEmailTestMessage(false), 5e3);
      return () => clearTimeout(timer);
    }
  }, [testEmailFetcher.data]);
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("autoUpdateEnabled", autoUpdateEnabled.toString());
    formData.append("minPricePct", minPricePct);
    formData.append("notificationEmail", notificationEmail);
    fetcher.submit(formData, { method: "post" });
  };
  const handleTestEmail = () => {
    testEmailFetcher.submit({}, {
      method: "post",
      action: "/api/test-email"
    });
  };
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "アプリ設定",
      subtitle: "自動価格調整の設定を管理します",
      titleMetadata: /* @__PURE__ */ jsx(Badge, { tone: "info", children: "V2.0" }),
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        showSuccessMessage && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { tone: "success", onDismiss: () => setShowSuccessMessage(false), children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", align: "center", children: [
          /* @__PURE__ */ jsx(Icon, { source: CheckCircleIcon, tone: "success" }),
          /* @__PURE__ */ jsx(Text, { children: "設定が正常に保存されました" })
        ] }) }) }),
        showEmailTestMessage && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(
          Banner,
          {
            tone: ((_a = testEmailFetcher.data) == null ? void 0 : _a.success) ? "success" : "critical",
            onDismiss: () => setShowEmailTestMessage(false),
            children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", align: "center", children: [
              /* @__PURE__ */ jsx(
                Icon,
                {
                  source: CheckCircleIcon,
                  tone: ((_b = testEmailFetcher.data) == null ? void 0 : _b.success) ? "success" : "critical"
                }
              ),
              /* @__PURE__ */ jsx(Text, { children: ((_c = testEmailFetcher.data) == null ? void 0 : _c.success) ? `テストメールを送信しました: ${(_d = testEmailFetcher.data) == null ? void 0 : _d.email}` : `テストメール送信失敗: ${(_e = testEmailFetcher.data) == null ? void 0 : _e.error}` })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "300", align: "start", children: [
            /* @__PURE__ */ jsx(Icon, { source: SettingsIcon, tone: "base" }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "自動更新設定" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "田中貴金属の価格変動に基づいて商品価格を自動調整します" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsxs(FormLayout, { children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: "400", align: "start", children: [
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
                Checkbox$1,
                {
                  label: "自動更新を有効化",
                  helpText: "有効にすると毎日JST 10:00に自動で価格調整が実行されます",
                  checked: autoUpdateEnabled,
                  onChange: setAutoUpdateEnabled
                }
              ) }),
              /* @__PURE__ */ jsx("div", { style: { paddingTop: "24px" }, children: /* @__PURE__ */ jsx(Badge, { tone: autoUpdateEnabled ? "info" : "warning", children: autoUpdateEnabled ? "JST 10:00実行" : "無効" }) })
            ] }),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "価格下限設定（%）",
                type: "number",
                value: minPricePct,
                onChange: setMinPricePct,
                min: 1,
                max: 100,
                suffix: "%",
                helpText: `現在価格の${minPricePct}%を下限として保護します（例: ${minPricePct}% = ${100 - parseInt(minPricePct)}%以上下がらない）`
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "300", align: "start", children: [
            /* @__PURE__ */ jsx(Icon, { source: NotificationIcon, tone: "base" }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "通知設定" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "価格更新の実行結果やエラーを通知します" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsxs(FormLayout, { children: [
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "通知メールアドレス（任意）",
                type: "email",
                value: notificationEmail,
                onChange: setNotificationEmail,
                placeholder: "you@example.com",
                helpText: "設定すると自動更新の結果がメールで通知されます"
              }
            ),
            notificationEmail && /* @__PURE__ */ jsxs(InlineStack, { gap: "200", align: "start", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "secondary",
                  size: "medium",
                  onClick: handleTestEmail,
                  loading: testEmailFetcher.state === "submitting",
                  disabled: !notificationEmail,
                  children: "テストメール送信"
                }
              ),
              /* @__PURE__ */ jsx("div", { style: { paddingTop: "6px" }, children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "設定したメールアドレスに通知のテストメールを送信します" }) })
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "300", align: "start", children: [
            /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "base" }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "実行スケジュール" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "自動更新の実行タイミングについて" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "実行曜日" }),
                /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "平日（月〜金曜日）" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "実行時刻" }),
                /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "10:00（日本時間）固定" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "祝日対応" }),
                /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "自動的にスキップ" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Banner, { tone: "success", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text, { fontWeight: "semibold", children: "🕙 自動更新スケジュール" }),
              /* @__PURE__ */ jsxs(Text, { children: [
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "実行時刻:" }),
                " JST 10:00（固定）",
                /* @__PURE__ */ jsx("br", {}),
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "対象曜日:" }),
                " 月曜日〜金曜日（平日のみ）",
                /* @__PURE__ */ jsx("br", {}),
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "祝日:" }),
                " 自動的にスキップ",
                /* @__PURE__ */ jsx("br", {}),
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "実行条件:" }),
                " 自動更新が有効で、対象商品が選択されている場合"
              ] })
            ] }) })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(InlineStack, { align: "end", children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            size: "large",
            onClick: handleSubmit,
            loading: fetcher.state === "submitting",
            children: "設定を保存"
          }
        ) }) })
      ] })
    }
  );
}
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Settings,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  var _a;
  const { session } = await authenticate.admin(request);
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    const [selectedProducts, recentLogs, shopSetting] = await Promise.all([
      prisma$1.selectedProduct.count({
        where: { shopDomain: session.shop, selected: true }
      }),
      prisma$1.priceUpdateLog.findMany({
        where: { shopDomain: session.shop },
        orderBy: { executedAt: "desc" },
        take: 5
      }),
      prisma$1.shopSetting.findUnique({
        where: { shopDomain: session.shop }
      })
    ]);
    return json({
      goldPrice: goldData ? {
        ratio: typeof goldData.changeRatio === "number" && Number.isFinite(goldData.changeRatio) ? goldData.changeRatio : null,
        percentage: typeof goldData.changeRatio === "number" && Number.isFinite(goldData.changeRatio) ? (goldData.changeRatio * 100).toFixed(2) : "0.00",
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        buyPrice: goldData.buyPrice,
        buyPriceFormatted: goldData.buyPriceFormatted,
        buyChangePercent: goldData.buyChangePercent,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinumPrice: platinumData ? {
        ratio: typeof platinumData.changeRatio === "number" && Number.isFinite(platinumData.changeRatio) ? platinumData.changeRatio : null,
        percentage: typeof platinumData.changeRatio === "number" && Number.isFinite(platinumData.changeRatio) ? (platinumData.changeRatio * 100).toFixed(2) : "0.00",
        change: platinumData.changePercent,
        retailPrice: platinumData.retailPrice,
        retailPriceFormatted: platinumData.retailPriceFormatted,
        buyPrice: platinumData.buyPrice,
        buyPriceFormatted: platinumData.buyPriceFormatted,
        buyChangePercent: platinumData.buyChangePercent,
        changeDirection: platinumData.changeDirection,
        lastUpdated: platinumData.lastUpdated
      } : null,
      stats: {
        selectedProducts,
        totalLogs: recentLogs.length,
        lastExecution: ((_a = recentLogs[0]) == null ? void 0 : _a.executedAt) || null,
        autoScheduleEnabled: (shopSetting == null ? void 0 : shopSetting.autoScheduleEnabled) || false
      },
      recentLogs
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return json({
      goldPrice: null,
      platinumPrice: null,
      stats: { selectedProducts: 0, totalLogs: 0, lastExecution: null, autoScheduleEnabled: false },
      recentLogs: []
    });
  }
};
function Dashboard() {
  const { goldPrice, platinumPrice, stats, recentLogs } = useLoaderData();
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "金・プラチナ価格自動調整ダッシュボード",
      subtitle: "商品の価格を田中貴金属の金・プラチナ価格に連動して自動調整",
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "600", children: [
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "24px", background: "#fbbf24", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "24px", marginRight: "8px" }, children: "🥇" }),
                /* @__PURE__ */ jsx(Text, { variant: "headingLg", as: "h2", tone: "text-inverse", children: "田中貴金属 金価格" })
              ] }),
              goldPrice ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", tone: "text-inverse", children: goldPrice.retailPriceFormatted }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsxs(
                    Badge,
                    {
                      tone: goldPrice.changeDirection === "up" ? "critical" : goldPrice.changeDirection === "down" ? "success" : "info",
                      size: "large",
                      children: [
                        "小売 前日比: ",
                        goldPrice.change
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(Badge, { tone: "base", size: "large", children: [
                    "調整率: ",
                    goldPrice.percentage,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsxs(Badge, { tone: "base", size: "medium", children: [
                    "買取: ",
                    goldPrice.buyPriceFormatted || "取得失敗"
                  ] }),
                  /* @__PURE__ */ jsxs(Badge, { tone: "info", size: "medium", children: [
                    "買取 前日比: ",
                    goldPrice.buyChangePercent || "0.00%"
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsx(Text, { variant: "headingLg", tone: "text-inverse", children: "価格情報取得中..." })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "end", children: [
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "text-inverse", children: "最終更新" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "text-inverse", children: goldPrice ? new Date(goldPrice.lastUpdated).toLocaleString("ja-JP") : "--" })
            ] })
          ] }) }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "24px", background: "#94a3b8", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "24px", marginRight: "8px" }, children: "🥈" }),
                /* @__PURE__ */ jsx(Text, { variant: "headingLg", as: "h2", tone: "text-inverse", children: "田中貴金属 プラチナ価格" })
              ] }),
              platinumPrice ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", tone: "text-inverse", children: platinumPrice.retailPriceFormatted }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsxs(
                    Badge,
                    {
                      tone: platinumPrice.changeDirection === "up" ? "critical" : platinumPrice.changeDirection === "down" ? "success" : "info",
                      size: "large",
                      children: [
                        "小売 前日比: ",
                        platinumPrice.change
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(Badge, { tone: "base", size: "large", children: [
                    "調整率: ",
                    platinumPrice.percentage,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsxs(Badge, { tone: "base", size: "medium", children: [
                    "買取: ",
                    platinumPrice.buyPriceFormatted || "取得失敗"
                  ] }),
                  /* @__PURE__ */ jsxs(Badge, { tone: "info", size: "medium", children: [
                    "買取 前日比: ",
                    platinumPrice.buyChangePercent || "0.00%"
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsx(Text, { variant: "headingLg", tone: "text-inverse", children: "価格情報取得中..." })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "end", children: [
              /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "text-inverse", children: "最終更新" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "text-inverse", children: platinumPrice ? new Date(platinumPrice.lastUpdated).toLocaleString("ja-JP") : "--" })
            ] })
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: ProductIcon, tone: "info" }),
            /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: stats.selectedProducts }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "選択中の商品" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: stats.autoScheduleEnabled ? "success" : "warning" }),
            /* @__PURE__ */ jsx(Badge, { tone: stats.autoScheduleEnabled ? "success" : "warning", children: stats.autoScheduleEnabled ? "有効" : "無効" }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "自動スケジュール" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: NotificationIcon, tone: "base" }),
            /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: stats.totalLogs }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "最近の実行" })
          ] }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
              /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "クイックアクション" }),
              /* @__PURE__ */ jsx(InlineStack, { gap: "200", children: /* @__PURE__ */ jsx(Link$1, { to: "/app/settings", children: /* @__PURE__ */ jsx(Button, { icon: SettingsIcon, children: "設定" }) }) })
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { gap: "300", children: [
              /* @__PURE__ */ jsx(Link$1, { to: "/app/products", children: /* @__PURE__ */ jsx(Button, { variant: "primary", size: "large", children: "商品価格を調整" }) }),
              /* @__PURE__ */ jsx(Link$1, { to: "/app/logs", children: /* @__PURE__ */ jsx(Button, { children: "実行ログを確認" }) })
            ] }),
            stats.lastExecution && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Divider, {}),
              /* @__PURE__ */ jsx(BlockStack, { gap: "200", children: /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", tone: "subdued", children: [
                "最終実行: ",
                new Date(stats.lastExecution).toLocaleString("ja-JP")
              ] }) })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "最近の実行ログ" }),
            recentLogs.length === 0 ? /* @__PURE__ */ jsx(Box, { padding: "600", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "center", children: [
              /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "subdued" }),
              /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "まだ実行履歴がありません" })
            ] }) }) : /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              recentLogs.slice(0, 3).map((log, index) => /* @__PURE__ */ jsx(
                Box,
                {
                  padding: "400",
                  children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
                    /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
                      /* @__PURE__ */ jsx(Badge, { tone: log.success ? "success" : "critical", children: log.success ? "成功" : "失敗" }),
                      /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: new Date(log.executedAt).toLocaleDateString("ja-JP") })
                    ] }),
                    /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
                      /* @__PURE__ */ jsxs(Text, { variant: "bodySm", children: [
                        "商品: ",
                        log.totalProducts || 0,
                        "件"
                      ] }),
                      /* @__PURE__ */ jsxs(Text, { variant: "bodySm", children: [
                        "成功: ",
                        log.updatedCount || 0,
                        "件"
                      ] })
                    ] })
                  ] })
                },
                log.id
              )),
              recentLogs.length > 3 && /* @__PURE__ */ jsx(Link$1, { to: "/app/logs", children: /* @__PURE__ */ jsx(Button, { variant: "plain", fullWidth: true, children: "すべてのログを表示" }) })
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "24px", background: "#f8fafc" }, children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
          /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "Gold & Platinum Price Updater" }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "田中貴金属の金・プラチナ価格に連動した商品の自動価格調整システム" })
          ] }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Badge, { children: "Version 7" }),
            /* @__PURE__ */ jsx(Badge, { tone: "success", children: "稼働中" })
          ] })
        ] }) }) })
      ] })
    }
  );
}
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const [logs, stats] = await Promise.all([
    prisma$1.priceUpdateLog.findMany({
      where: { shopDomain: shop },
      orderBy: { executedAt: "desc" },
      take: 100
    }),
    prisma$1.priceUpdateLog.aggregate({
      where: { shopDomain: shop },
      _count: { id: true },
      _sum: {
        totalProducts: true,
        updatedCount: true,
        failedCount: true
      }
    })
  ]);
  return json({
    logs,
    stats: {
      totalExecutions: stats._count.id,
      totalProducts: stats._sum.totalProducts || 0,
      totalSuccess: stats._sum.updatedCount || 0,
      totalFailed: stats._sum.failedCount || 0
    }
  });
}
function Logs() {
  const { logs, stats } = useLoaderData();
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredLogs = logs.filter((log) => {
    var _a;
    const matchesQuery = filterQuery === "" || ((_a = log.errorMessage) == null ? void 0 : _a.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || statusFilter === "success" && log.success || statusFilter === "failed" && !log.success;
    const matchesType = typeFilter === "all" || log.executionType === typeFilter;
    return matchesQuery && matchesStatus && matchesType;
  });
  const tableRows = filteredLogs.map((log) => [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", children: new Date(log.executedAt).toLocaleDateString("ja-JP") }),
      /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: new Date(log.executedAt).toLocaleTimeString("ja-JP") })
    ] }, `time-${log.id}`),
    (() => {
      const type = log.executionType;
      const label = type === "cron" ? "自動実行" : type === "manual" ? "手動実行" : "Webhook";
      const tone = type === "cron" ? "info" : type === "manual" ? "warning" : "base";
      return /* @__PURE__ */ jsx(Badge, { tone, children: label }, `type-${log.id}`);
    })(),
    /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
      /* @__PURE__ */ jsx(
        Icon,
        {
          source: log.success ? CheckCircleIcon : AlertCircleIcon,
          tone: log.success ? "success" : "critical"
        }
      ),
      /* @__PURE__ */ jsx(Badge, { tone: log.success ? "success" : "critical", children: log.success ? "成功" : "失敗" })
    ] }, `status-${log.id}`),
    /* @__PURE__ */ jsx("div", { children: log.priceRatio !== null && log.priceRatio !== void 0 ? /* @__PURE__ */ jsxs(InlineStack, { gap: "100", blockAlign: "center", children: [
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: log.priceRatio >= 0 ? "critical" : "success", children: log.priceRatio >= 0 ? "📈" : "📉" }),
      /* @__PURE__ */ jsxs(Text, { children: [
        (log.priceRatio * 100).toFixed(2),
        "%"
      ] })
    ] }) : /* @__PURE__ */ jsx(Text, { tone: "subdued", children: "-" }) }, `ratio-${log.id}`),
    /* @__PURE__ */ jsxs(Text, { children: [
      log.minPricePct || "-",
      "%"
    ] }, `min-${log.id}`),
    /* @__PURE__ */ jsxs(Text, { children: [
      log.totalProducts || 0,
      "件"
    ] }, `products-${log.id}`),
    /* @__PURE__ */ jsxs(InlineStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Text, { tone: "success", children: log.updatedCount || 0 }),
      /* @__PURE__ */ jsx(Text, { tone: "subdued", children: "/" }),
      /* @__PURE__ */ jsx(Text, { tone: "critical", children: log.failedCount || 0 })
    ] }, `counts-${log.id}`),
    /* @__PURE__ */ jsx("div", { children: log.errorMessage ? /* @__PURE__ */ jsx("div", { style: { padding: "8px", background: "#fecaca", borderRadius: "50%" }, children: /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "critical", children: log.errorMessage.length > 50 ? log.errorMessage.substring(0, 50) + "..." : log.errorMessage }) }) : /* @__PURE__ */ jsx(Text, { tone: "subdued", children: "-" }) }, `error-${log.id}`)
  ]);
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "実行ログ",
      subtitle: `${logs.length}件の実行履歴を表示`,
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "info" }),
            /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: stats.totalExecutions }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "総実行回数" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: CheckCircleIcon, tone: "success" }),
            /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: stats.totalSuccess }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "成功更新数" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: AlertCircleIcon, tone: stats.totalFailed > 0 ? "critical" : "subdued" }),
            /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: stats.totalFailed }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: "失敗更新数" })
          ] }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "フィルター" }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
            /* @__PURE__ */ jsx("div", { style: { minWidth: "200px" }, children: /* @__PURE__ */ jsx(
              TextField,
              {
                label: "エラーメッセージ検索",
                value: filterQuery,
                onChange: setFilterQuery,
                placeholder: "エラー内容で検索...",
                clearButton: true,
                onClearButtonClick: () => setFilterQuery("")
              }
            ) }),
            /* @__PURE__ */ jsx("div", { style: { minWidth: "150px" }, children: /* @__PURE__ */ jsx(
              Select,
              {
                label: "実行結果",
                options: [
                  { label: "すべて", value: "all" },
                  { label: "成功のみ", value: "success" },
                  { label: "失敗のみ", value: "failed" }
                ],
                value: statusFilter,
                onChange: setStatusFilter
              }
            ) }),
            /* @__PURE__ */ jsx("div", { style: { minWidth: "150px" }, children: /* @__PURE__ */ jsx(
              Select,
              {
                label: "実行タイプ",
                options: [
                  { label: "すべて", value: "all" },
                  { label: "自動実行", value: "cron" },
                  { label: "手動実行", value: "manual" }
                ],
                value: typeFilter,
                onChange: setTypeFilter
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs(Text, { variant: "bodySm", tone: "subdued", children: [
            filteredLogs.length,
            "件 / ",
            logs.length,
            "件を表示"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: filteredLogs.length === 0 ? /* @__PURE__ */ jsx(Box, { padding: "800", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", align: "center", children: [
          /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "subdued" }),
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", tone: "subdued", children: logs.length === 0 ? "まだ実行ログがありません" : "フィルター条件に一致するログがありません" }),
          /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "subdued", children: logs.length === 0 ? "商品価格調整を実行すると、ここに履歴が表示されます。" : "フィルター条件を変更してください。" })
        ] }) }) : /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "text", "text", "text", "text", "text", "text", "text"],
            headings: [
              "実行日時",
              "種類",
              "結果",
              "価格変動率",
              "価格下限",
              "対象商品",
              "成功/失敗",
              "エラー詳細"
            ],
            rows: tableRows,
            pagination: {
              hasNext: false,
              hasPrevious: false
            }
          }
        ) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(
          Box,
          {
            padding: "400",
            children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "base" }),
                /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "ログの見方" })
              ] }),
              /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
                /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
                  /* @__PURE__ */ jsx(Text, { variant: "bodyMd", fontWeight: "semibold", children: "実行タイプ" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• 自動実行: スケジュールによる定期実行" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• 手動実行: UIからの手動実行" })
                ] }),
                /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
                  /* @__PURE__ */ jsx(Text, { variant: "bodyMd", fontWeight: "semibold", children: "価格変動率" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• 田中貴金属から取得した前日比" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• この変動率で商品価格を調整" })
                ] }),
                /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
                  /* @__PURE__ */ jsx(Text, { variant: "bodyMd", fontWeight: "semibold", children: "価格下限" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• 価格下落時の最低価格率" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", children: "• 例: 93% = 7%以上は下がらない" })
                ] })
              ] })
            ] })
          }
        ) })
      ] })
    }
  );
}
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Logs,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DhrRE1Li.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-CTN0itWq.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/styles-BDwA4lvJ.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/webhooks.customers.data_request": { "id": "routes/webhooks.customers.data_request", "parentId": "root", "path": "webhooks/customers/data_request", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.customers.data_request-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.customers.redact": { "id": "routes/webhooks.customers.redact", "parentId": "root", "path": "webhooks/customers/redact", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.customers.redact-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.nextengine.callback": { "id": "routes/api.nextengine.callback", "parentId": "root", "path": "api/nextengine/callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.nextengine.callback-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.shop.redact": { "id": "routes/webhooks.shop.redact", "parentId": "root", "path": "webhooks/shop/redact", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.shop.redact-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.test-email": { "id": "routes/api.test-email", "parentId": "root", "path": "api/test-email", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.test-email-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-YyjxCrtr.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/styles-BDwA4lvJ.js", "/assets/components-C9-D01ZZ.js", "/assets/Page-DvMnY4Uh.js", "/assets/FormLayout-9MUjKHGm.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/api.cron": { "id": "routes/api.cron", "parentId": "root", "path": "api/cron", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.cron-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.test": { "id": "routes/api.test", "parentId": "root", "path": "api/test", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.test-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-C6d-v1ok.js", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-Dhth9sU9.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/styles-BDwA4lvJ.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.additional-BPOnLFoD.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/Page-DvMnY4Uh.js", "/assets/Layout-BvDTjT3E.js", "/assets/banner-context-Bfu3e4If.js", "/assets/context-C9td0CMk.js"], "css": [] }, "routes/app.products": { "id": "routes/app.products", "parentId": "routes/app", "path": "products", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.products-DNNwq_w0.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/Page-DvMnY4Uh.js", "/assets/Layout-BvDTjT3E.js", "/assets/Banner-DRkmBrND.js", "/assets/Select-D-FzUXlB.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js", "/assets/banner-context-Bfu3e4If.js"], "css": [] }, "routes/app.settings": { "id": "routes/app.settings", "parentId": "routes/app", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.settings-CVBRsg5v.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/Page-DvMnY4Uh.js", "/assets/Layout-BvDTjT3E.js", "/assets/Banner-DRkmBrND.js", "/assets/CheckCircleIcon.svg-BdEOQivI.js", "/assets/Divider-DCXs5LYm.js", "/assets/FormLayout-9MUjKHGm.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/context-C9td0CMk.js", "/assets/banner-context-Bfu3e4If.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-BwFMzU7C.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/Page-DvMnY4Uh.js", "/assets/Layout-BvDTjT3E.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/Divider-DCXs5LYm.js", "/assets/context-C9td0CMk.js"], "css": [] }, "routes/app.logs": { "id": "routes/app.logs", "parentId": "routes/app", "path": "logs", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.logs-nbaoxDqu.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-C9-D01ZZ.js", "/assets/Page-DvMnY4Uh.js", "/assets/CheckCircleIcon.svg-BdEOQivI.js", "/assets/Layout-BvDTjT3E.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/Select-D-FzUXlB.js", "/assets/context-C9td0CMk.js"], "css": [] } }, "url": "/assets/manifest-27f49521.js", "version": "27f49521" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": true, "v3_singleFetch": false, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.customers.data_request": {
    id: "routes/webhooks.customers.data_request",
    parentId: "root",
    path: "webhooks/customers/data_request",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/webhooks.customers.redact": {
    id: "routes/webhooks.customers.redact",
    parentId: "root",
    path: "webhooks/customers/redact",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/api.nextengine.callback": {
    id: "routes/api.nextengine.callback",
    parentId: "root",
    path: "api/nextengine/callback",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/webhooks.shop.redact": {
    id: "routes/webhooks.shop.redact",
    parentId: "root",
    path: "webhooks/shop/redact",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.test-email": {
    id: "routes/api.test-email",
    parentId: "root",
    path: "api/test-email",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/api.cron": {
    id: "routes/api.cron",
    parentId: "root",
    path: "api/cron",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/api.test": {
    id: "routes/api.test",
    parentId: "root",
    path: "api/test",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route11
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.products": {
    id: "routes/app.products",
    parentId: "routes/app",
    path: "products",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/app.settings": {
    id: "routes/app.settings",
    parentId: "routes/app",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route17
  },
  "routes/app.logs": {
    id: "routes/app.logs",
    parentId: "routes/app",
    path: "logs",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
