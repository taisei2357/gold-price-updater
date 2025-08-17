import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, Link as Link$1, useRouteError, Await, useFetcher } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect, defer } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, PureComponent, useCallback, useMemo, forwardRef, Component, memo, useId, useImperativeHandle, createElement, isValidElement, Children, createRef, useReducer, Suspense } from "react";
import { themes, breakpointsAliases, themeNameDefault, createThemeClassName, themeDefault, getMediaConditions, themeNames } from "@shopify/polaris-tokens";
import { createHmac, timingSafeEqual } from "crypto";
import { SelectIcon, ChevronDownIcon, ChevronUpIcon, AlertCircleIcon, XCircleIcon, SearchIcon, MenuHorizontalIcon, MinusIcon, InfoIcon, AlertDiamondIcon, AlertTriangleIcon, CheckIcon, XIcon, ArrowLeftIcon, SortDescendingIcon, SortAscendingIcon, ChevronLeftIcon, ChevronRightIcon, ProductIcon, CheckCircleIcon, SettingsIcon, NotificationIcon, ClockIcon } from "@shopify/polaris-icons";
import { createPortal } from "react-dom";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
import { NavMenu, TitleBar } from "@shopify/app-bridge-react";
import isEqual from "react-fast-compare";
import { Transition, CSSTransition, TransitionGroup } from "react-transition-group";
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}
const prisma = global.prismaGlobal ?? new PrismaClient();
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
  sessionStorage: new PrismaSessionStorage(prisma),
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
var styles$M = {
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
    className: classNames(createThemeClassName(themeName), styles$M.themeContainer, className)
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
  addListener: noop$4,
  removeListener: noop$4,
  matches: false,
  onchange: noop$4,
  addEventListener: noop$4,
  removeEventListener: noop$4,
  dispatchEvent: (_) => true
};
function noop$4() {
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
var styles$L = {
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
var styles$K = {
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
var styles$J = {
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
const Text$1 = ({
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
  const className = classNames(styles$J.root, variant && styles$J[variant], fontWeight && styles$J[fontWeight], (alignment || truncate) && styles$J.block, alignment && styles$J[alignment], breakWord && styles$J.break, tone && styles$J[tone], numeric && styles$J.numeric, truncate && styles$J.truncate, visuallyHidden && styles$J.visuallyHidden, textDecorationLine && styles$J[textDecorationLine]);
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
  const className = classNames(styles$K.Icon, tone && styles$K[variationName("tone", tone)]);
  const {
    mdDown
  } = useBreakpoints();
  const SourceComponent = source;
  const contentMarkup = {
    function: /* @__PURE__ */ React.createElement(SourceComponent, Object.assign({
      className: styles$K.Svg,
      focusable: "false",
      "aria-hidden": "true"
      // On Mobile we're scaling the viewBox to 18x18 to make the icons bigger
      // Also, we're setting the viewport origin to 1x1 to center the icon
      // We use this syntax so we don't override the existing viewBox value if we don't need to.
    }, mdDown ? {
      viewBox: "1 1 18 18"
    } : {})),
    placeholder: /* @__PURE__ */ React.createElement("div", {
      className: styles$K.Placeholder
    }),
    external: /* @__PURE__ */ React.createElement("img", {
      className: styles$K.Img,
      src: `data:image/svg+xml;utf8,${source}`,
      alt: "",
      "aria-hidden": "true"
    })
  };
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, accessibilityLabel && /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel), contentMarkup[sourceType]);
}
var styles$I = {
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
  const className = classNames(styles$I.Spinner, size && styles$I[variationName("size", size)]);
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
  const accessibilityLabelMarkup = (isAfterInitialMount || !hasFocusableParent) && /* @__PURE__ */ React.createElement(Text$1, {
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
  const className = classNames(styles$L.Button, styles$L.pressable, styles$L[variationName("variant", variant)], styles$L[variationName("size", size)], styles$L[variationName("textAlign", textAlign)], fullWidth && styles$L.fullWidth, disclosure && styles$L.disclosure, icon && children && styles$L.iconWithText, icon && children == null && styles$L.iconOnly, isDisabled && styles$L.disabled, loading && styles$L.loading, pressed && !disabled && !url && styles$L.pressed, removeUnderline && styles$L.removeUnderline, tone && styles$L[variationName("tone", tone)]);
  const disclosureMarkup = disclosure ? /* @__PURE__ */ React.createElement("span", {
    className: loading ? styles$L.hidden : styles$L.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: loading ? "placeholder" : getDisclosureIconSource(disclosure, ChevronUpIcon, ChevronDownIcon)
  })) : null;
  const iconSource = isIconSource(icon) ? /* @__PURE__ */ React.createElement(Icon, {
    source: loading ? "placeholder" : icon
  }) : icon;
  const iconMarkup = iconSource ? /* @__PURE__ */ React.createElement("span", {
    className: loading ? styles$L.hidden : styles$L.Icon
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
  const childMarkup = children ? /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: textVariant,
    fontWeight: textFontWeight,
    key: disabled ? "text-disabled" : "text"
  }, children) : null;
  const spinnerSVGMarkup = loading ? /* @__PURE__ */ React.createElement("span", {
    className: styles$L.Spinner
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
var styles$H = {
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
    className: styles$H.ShadowBevel,
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
var styles$G = {
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
  const className = classNames(styles$G.Box, visuallyHidden && styles$G.visuallyHidden, printHidden && styles$G.printHidden, as === "ul" && styles$G.listReset);
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
var styles$F = {
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
    className: styles$F.InlineStack,
    style
  }, children);
};
var styles$E = {
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
  const className = classNames(styles$E.BlockStack, (as === "ul" || as === "ol") && styles$E.listReset, as === "fieldset" && styles$E.fieldsetReset);
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
const FilterActionsContext = /* @__PURE__ */ createContext(false);
function FilterActionsProvider({
  children,
  filterActions
}) {
  return /* @__PURE__ */ React.createElement(FilterActionsContext.Provider, {
    value: filterActions
  }, children);
}
var styles$D = {
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
var styles$C = {
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
var styles$B = {
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
  const className = classNames(styles$B.Pip, tone && styles$B[variationName("tone", tone)], progress && styles$B[variationName("progress", progress)]);
  const accessibilityLabel = accessibilityLabelOverride ? accessibilityLabelOverride : getDefaultAccessibilityLabel(i18n, progress, tone);
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  const className = classNames(styles$C.Badge, tone && styles$C[variationName("tone", tone)], size && size !== DEFAULT_SIZE && styles$C[variationName("size", size)], withinFilter && styles$C.withinFilter);
  const accessibilityLabel = toneAndProgressLabelOverride ? toneAndProgressLabelOverride : getDefaultAccessibilityLabel(i18n, progress, tone);
  let accessibilityMarkup = Boolean(accessibilityLabel) && /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    visuallyHidden: true
  }, accessibilityLabel);
  if (progress && !icon) {
    accessibilityMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$C.Icon
    }, /* @__PURE__ */ React.createElement(Icon, {
      accessibilityLabel,
      source: progressIconMap[progress]
    }));
  }
  return /* @__PURE__ */ React.createElement("span", {
    className
  }, accessibilityMarkup, icon && /* @__PURE__ */ React.createElement("span", {
    className: styles$C.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: icon
  })), children && /* @__PURE__ */ React.createElement(Text$1, {
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
var styles$A = {
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
  onPortalCreated = noop$3
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
function noop$3() {
}
var styles$z = {
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
var styles$y = {
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
var styles$x = {
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
  const finalClassName = classNames(className, styles$x.Scrollable, vertical && styles$x.vertical, horizontal && styles$x.horizontal, shadow && topShadow && styles$x.hasTopShadow, shadow && bottomShadow && styles$x.hasBottomShadow, scrollbarWidth && styles$x[variationName("scrollbarWidth", scrollbarWidth)], scrollbarGutter && styles$x[variationName("scrollbarGutter", scrollbarGutter.replace(" ", ""))]);
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
    const className = classNames(styles$y.PositionedOverlay, fixed && styles$y.fixed, preventInteraction && styles$y.preventInteraction, propClassNames);
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
    const containerClassName = classNames(styles$z.TooltipOverlay, measuring && styles$z.measuring, !measuring && styles$z.measured, instant && styles$z.instant, positioning === "above" && styles$z.positionedAbove);
    const contentClassName = classNames(styles$z.Content, width && styles$z[width]);
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
      className: styles$z.Tail,
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
    onClose: noop$2,
    preventInteraction: dismissOnMouseOut,
    width,
    padding,
    borderRadius,
    zIndexOverride,
    instant: !shouldAnimate
  }, /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodyMd"
  }, content))) : null;
  const wrapperClassNames = classNames(activatorWrapper === "div" && styles$A.TooltipContainer, hasUnderline && styles$A.HasUnderline);
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
function noop$2() {
}
function Item$4({
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
  const className = classNames(styles$D.Item, disabled && styles$D.disabled, destructive && styles$D.destructive, active && styles$D.active, variant === "default" && styles$D.default, variant === "indented" && styles$D.indented, variant === "menu" && styles$D.menu);
  let prefixMarkup = null;
  if (prefix) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$D.Prefix
    }, prefix);
  } else if (icon) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      className: styles$D.Prefix
    }, /* @__PURE__ */ React.createElement(Icon, {
      source: icon
    }));
  } else if (image) {
    prefixMarkup = /* @__PURE__ */ React.createElement("span", {
      role: "presentation",
      className: styles$D.Prefix,
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
  const contentMarkup = helpText ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, null, contentText), /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodySm",
    tone: active || disabled ? void 0 : "subdued"
  }, helpText)) : /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodyMd",
    fontWeight: active ? "semibold" : "regular"
  }, contentText);
  const badgeMarkup = badge && /* @__PURE__ */ React.createElement("span", {
    className: styles$D.Suffix
  }, /* @__PURE__ */ React.createElement(Badge, {
    tone: badge.tone
  }, badge.content));
  const suffixMarkup = suffix && /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement("span", {
    className: styles$D.Suffix
  }, suffix));
  const textMarkup = /* @__PURE__ */ React.createElement("span", {
    className: styles$D.Text
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  const text = /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
    const itemMarkup = /* @__PURE__ */ React.createElement(Item$4, Object.assign({
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
    }, /* @__PURE__ */ React.createElement(Text$1, {
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
var styles$w = {
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
var styles$v = {
  "hidden": "Polaris-Labelled--hidden",
  "LabelWrapper": "Polaris-Labelled__LabelWrapper",
  "disabled": "Polaris-Labelled--disabled",
  "HelpText": "Polaris-Labelled__HelpText",
  "readOnly": "Polaris-Labelled--readOnly",
  "Error": "Polaris-Labelled__Error",
  "Action": "Polaris-Labelled__Action"
};
var styles$u = {
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
    className: styles$u.InlineError
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$u.Icon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: AlertCircleIcon
  })), /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodyMd"
  }, message));
}
function errorTextID(id) {
  return `${id}Error`;
}
var styles$t = {
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
  const className = classNames(styles$t.Label, hidden && styles$t.hidden);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, /* @__PURE__ */ React.createElement("label", {
    id: labelID(id),
    htmlFor: id,
    className: classNames(styles$t.Text, requiredIndicator && styles$t.RequiredIndicator)
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  const className = classNames(labelHidden && styles$v.hidden, disabled && styles$v.disabled, readOnly && styles$v.readOnly);
  const actionMarkup = action2 ? /* @__PURE__ */ React.createElement("div", {
    className: styles$v.Action
  }, buttonFrom(action2, {
    variant: "plain"
  })) : null;
  const helpTextMarkup = helpText ? /* @__PURE__ */ React.createElement("div", {
    className: styles$v.HelpText,
    id: helpTextID$1(id),
    "aria-disabled": disabled
  }, /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    tone: "subdued",
    variant: "bodyMd",
    breakWord: true
  }, helpText)) : null;
  const errorMarkup = error && typeof error !== "boolean" && /* @__PURE__ */ React.createElement("div", {
    className: styles$v.Error
  }, /* @__PURE__ */ React.createElement(InlineError, {
    message: error,
    fieldID: id
  }));
  const labelMarkup = label ? /* @__PURE__ */ React.createElement("div", {
    className: styles$v.LabelWrapper
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
var styles$s = {
  "Connected": "Polaris-Connected",
  "Item": "Polaris-Connected__Item",
  "Item-primary": "Polaris-Connected__Item--primary",
  "Item-focused": "Polaris-Connected__Item--focused"
};
function Item$3({
  children,
  position
}) {
  const {
    value: focused,
    setTrue: forceTrueFocused,
    setFalse: forceFalseFocused
  } = useToggle(false);
  const className = classNames(styles$s.Item, focused && styles$s["Item-focused"], position === "primary" ? styles$s["Item-primary"] : styles$s["Item-connection"]);
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
  const leftConnectionMarkup = left ? /* @__PURE__ */ React.createElement(Item$3, {
    position: "left"
  }, left) : null;
  const rightConnectionMarkup = right ? /* @__PURE__ */ React.createElement(Item$3, {
    position: "right"
  }, right) : null;
  return /* @__PURE__ */ React.createElement("div", {
    className: styles$s.Connected
  }, leftConnectionMarkup, /* @__PURE__ */ React.createElement(Item$3, {
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
    className: styles$w.Spinner,
    onClick,
    "aria-hidden": true,
    ref
  }, /* @__PURE__ */ React.createElement("div", {
    role: "button",
    className: styles$w.Segment,
    tabIndex: -1,
    onClick: handleStep(1),
    onMouseDown: handleMouseDown(handleStep(1)),
    onMouseUp,
    onBlur
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$w.SpinnerIcon
  }, /* @__PURE__ */ React.createElement(Icon, {
    source: ChevronUpIcon
  }))), /* @__PURE__ */ React.createElement("div", {
    role: "button",
    className: styles$w.Segment,
    tabIndex: -1,
    onClick: handleStep(-1),
    onMouseDown: handleMouseDown(handleStep(-1)),
    onMouseUp,
    onBlur
  }, /* @__PURE__ */ React.createElement("div", {
    className: styles$w.SpinnerIcon
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
    className: styles$w.DummyInput,
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
    className: styles$w.Resizer
  }, /* @__PURE__ */ React.createElement(EventListener, {
    event: "resize",
    handler: handleHeightCheck
  }), /* @__PURE__ */ React.createElement("div", {
    ref: contentNode,
    className: styles$w.DummyInput,
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
  const className = classNames(styles$w.TextField, Boolean(normalizedValue) && styles$w.hasValue, disabled && styles$w.disabled, readOnly && styles$w.readOnly, error && styles$w.error, tone && styles$w[variationName("tone", tone)], multiline && styles$w.multiline, focus && !disabled && styles$w.focus, variant !== "inherit" && styles$w[variant], size === "slim" && styles$w.slim);
  const inputType = type === "currency" ? "text" : type;
  const isNumericType = type === "number" || type === "integer";
  const iconPrefix = /* @__PURE__ */ React.isValidElement(prefix) && prefix.type === Icon;
  const prefixMarkup = prefix ? /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$w.Prefix, iconPrefix && styles$w.PrefixIcon),
    id: `${id}-Prefix`,
    ref: prefixRef
  }, /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodyMd"
  }, prefix)) : null;
  const suffixMarkup = suffix ? /* @__PURE__ */ React.createElement("div", {
    className: styles$w.Suffix,
    id: `${id}-Suffix`,
    ref: suffixRef
  }, /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    variant: "bodyMd"
  }, suffix)) : null;
  const loadingMarkup = loading ? /* @__PURE__ */ React.createElement("div", {
    className: styles$w.Loading,
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
    const characterCountClassName = classNames(styles$w.CharacterCount, multiline && styles$w.AlignFieldBottom);
    const characterCountText = !maxLength ? characterCount : `${characterCount}/${maxLength}`;
    characterCountMarkup = /* @__PURE__ */ React.createElement("div", {
      id: `${id}-CharacterCounter`,
      className: characterCountClassName,
      "aria-label": characterCountLabel,
      "aria-live": focus ? "polite" : "off",
      "aria-atomic": "true",
      onClick: handleClickChild
    }, /* @__PURE__ */ React.createElement(Text$1, {
      as: "span",
      variant: "bodyMd"
    }, characterCountText));
  }
  const clearButtonVisible = normalizedValue !== "";
  const clearButtonMarkup = clearButton && clearButtonVisible ? /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: styles$w.ClearButton,
    onClick: handleClearButtonPress,
    disabled
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  const inputClassName = classNames(styles$w.Input, align && styles$w[variationName("Input-align", align)], suffix && styles$w["Input-suffixed"], clearButton && styles$w["Input-hasClearButton"], monospaced && styles$w.monospaced, suggestion && styles$w.suggestion, autoSize && styles$w["Input-autoSize"]);
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
    className: styles$w.VerticalContent,
    id: `${id}-VerticalContent`,
    ref: verticalContentRef,
    onClick: handleClickChild
  }, verticalContent, input) : null;
  const inputMarkup = verticalContent ? inputWithVerticalContentMarkup : input;
  const backdropMarkup = /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$w.Backdrop, connectedLeft && styles$w["Backdrop-connectedLeft"], connectedRight && styles$w["Backdrop-connectedRight"])
  });
  const inputAndSuffixMarkup = autoSize ? /* @__PURE__ */ React.createElement("div", {
    className: styles$w.InputAndSuffixWrapper
  }, /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$w.AutoSizeWrapper, suffix && styles$w.AutoSizeWrapperWithSuffix),
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
ActionList.Item = Item$4;
var styles$r = {
  "ActionMenu": "Polaris-ActionMenu"
};
var styles$q = {
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
var styles$p = {
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
    className: styles$p.Section
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
  const className = classNames(styles$p.Pane, fixed && styles$p["Pane-fixed"], subdued && styles$p["Pane-subdued"], captureOverscroll && styles$p["Pane-captureOverscroll"]);
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
      const className = classNames(styles$p.Popover, measuring && styles$p.measuring, (fullWidth || isCovering) && styles$p.fullWidth, hideOnPrint && styles$p["PopoverOverlay-hideOnPrint"], positioning && styles$p[variationName("positioned", positioning)]);
      const contentStyles = measuring ? void 0 : {
        height: desiredHeight
      };
      const contentClassNames = classNames(styles$p.Content, fullHeight && styles$p["Content-fullHeight"], fluidContent && styles$p["Content-fluidContent"]);
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
        className: styles$p.FocusTracker,
        tabIndex: 0,
        onFocus: this.handleFocusFirstItem
      }), /* @__PURE__ */ React.createElement("div", {
        className: styles$p.ContentContainer
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
        className: styles$p.FocusTracker,
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
    const className = classNames(styles$p.PopoverOverlay, transitionStatus === TransitionStatus.Entering && styles$p["PopoverOverlay-entering"], transitionStatus === TransitionStatus.Entered && styles$p["PopoverOverlay-open"], transitionStatus === TransitionStatus.Exiting && styles$p["PopoverOverlay-exiting"], preferredPosition === "cover" && styles$p["PopoverOverlay-noAnimation"]);
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
    className: styles$q.RollupActivator
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
var styles$o = {
  "ActionsLayoutOuter": "Polaris-ActionMenu-Actions__ActionsLayoutOuter",
  "ActionsLayout": "Polaris-ActionMenu-Actions__ActionsLayout",
  "ActionsLayout--measuring": "Polaris-ActionMenu-Actions--actionsLayoutMeasuring",
  "ActionsLayoutMeasurer": "Polaris-ActionMenu-Actions__ActionsLayoutMeasurer"
};
function getVisibleAndHiddenActionsIndices(actions = [], groups = [], disclosureWidth, actionsWidths, containerWidth) {
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
var styles$n = {
  "Details": "Polaris-ActionMenu-MenuGroup__Details"
};
var styles$m = {
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
    className: classNames(styles$m.SecondaryAction, tone === "critical" && styles$m.critical)
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
    className: styles$n.Details
  }, details));
}
const ACTION_SPACING = 8;
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
    className: styles$o.ActionsLayoutMeasurer,
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
    } = getVisibleAndHiddenActionsIndices(actions, groups, disclosureWidth, actionsWidths, containerWidth);
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
    } = getVisibleAndHiddenActionsIndices(actionsOrDefault, groupsOrDefault, disclosureWidth2, actionsWidths2, containerWidth2);
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
    className: styles$o.ActionsLayoutOuter
  }, actionsMeasurer, /* @__PURE__ */ React.createElement("div", {
    className: classNames(styles$o.ActionsLayout, !hasMeasured && styles$o["ActionsLayout--measuring"])
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
  const actionMenuClassNames = classNames(styles$r.ActionMenu, rollup && styles$r.rollup);
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
var styles$l = {
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
var styles$k = {
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
  const className = classNames(styles$k.Choice, labelHidden && styles$k.labelHidden, disabled && styles$k.disabled, tone && styles$k[variationName("tone", tone)], labelClassName);
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
      className: styles$k.Control
    }, children), /* @__PURE__ */ React.createElement("span", {
      className: styles$k.Label
    }, /* @__PURE__ */ React.createElement(Text$1, {
      as: "span",
      variant: "bodyMd"
    }, label)))
  );
  const helpTextMarkup = helpText ? /* @__PURE__ */ React.createElement("div", {
    className: styles$k.HelpText,
    id: helpTextID(id)
  }, /* @__PURE__ */ React.createElement(Text$1, {
    as: "span",
    tone: disabled ? void 0 : "subdued"
  }, helpText)) : null;
  const errorMarkup = error && typeof error !== "boolean" && /* @__PURE__ */ React.createElement("div", {
    className: styles$k.Error
  }, /* @__PURE__ */ React.createElement(InlineError, {
    message: error,
    fieldID: id
  }));
  const descriptionMarkup = helpTextMarkup || errorMarkup ? /* @__PURE__ */ React.createElement("div", {
    className: styles$k.Descriptions
  }, errorMarkup, helpTextMarkup) : null;
  return descriptionMarkup ? /* @__PURE__ */ React.createElement("div", null, labelMarkup, descriptionMarkup) : labelMarkup;
}
function helpTextID(id) {
  return `${id}HelpText`;
}
const Checkbox = /* @__PURE__ */ forwardRef(function Checkbox2({
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
  const wrapperClassName = classNames(styles$l.Checkbox, error && styles$l.error);
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
    className: classNames(checked && styles$l.checked),
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
  const inputClassName = classNames(styles$l.Input, isIndeterminate && styles$l["Input-indeterminate"], tone && styles$l[variationName("tone", tone)]);
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
    labelClassName: classNames(styles$l.ChoiceLabel, labelClassName),
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
    onChange: noop$1,
    onClick: handleOnClick,
    onFocus,
    "aria-invalid": error != null,
    "aria-controls": ariaControls,
    "aria-describedby": ariaDescribedBy,
    role: isWithinListbox ? "presentation" : "checkbox"
  }, indeterminateAttributes)), /* @__PURE__ */ React.createElement("span", {
    className: styles$l.Backdrop,
    onClick: stopPropagation,
    onKeyUp: stopPropagation
  }), /* @__PURE__ */ React.createElement("span", {
    className: classNames(styles$l.Icon, !isIndeterminate && styles$l.animated)
  }, isIndeterminate ? /* @__PURE__ */ React.createElement(Icon, {
    source: MinusIcon
  }) : iconSource)));
});
function noop$1() {
}
function stopPropagation(event) {
  event.stopPropagation();
}
var styles$j = {
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
  const className = classNames(styles$j.Backdrop, belowNavigation && styles$j.belowNavigation, transparent && styles$j.transparent);
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
var styles$i = {
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
var styles$h = {
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
function Item$2({
  button
}) {
  const {
    value: focused,
    setTrue: forceTrueFocused,
    setFalse: forceFalseFocused
  } = useToggle(false);
  const className = classNames(styles$h.Item, focused && styles$h["Item-focused"], button.props.variant === "plain" && styles$h["Item-plain"]);
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
  const className = classNames(styles$h.ButtonGroup, gap && styles$h[gap], variant && styles$h[variationName("variant", variant)], fullWidth && styles$h.fullWidth, noWrap && styles$h.noWrap);
  const contents = elementChildren(children).map((child, index) => /* @__PURE__ */ React.createElement(Item$2, {
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
  const className = classNames(styles$i.Banner, shouldShowFocus && styles$i.keyFocused, withinContentContainer ? styles$i.withinContentContainer : styles$i.withinPage);
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
    bannerTitle: title ? /* @__PURE__ */ React.createElement(Text$1, {
      as: "h2",
      variant: "headingSm",
      breakWord: true
    }, title) : null,
    bannerIcon: hideIcon ? null : /* @__PURE__ */ React.createElement("span", {
      className: styles$i[bannerColors.icon]
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
        className: styles$i[isInlineIconBanner ? "icon-secondary" : bannerColors.icon]
      }, /* @__PURE__ */ React.createElement(Icon, {
        source: XIcon
      })),
      onClick: onDismiss,
      accessibilityLabel: i18n.translate("Polaris.Banner.dismissButton")
    }) : null
  };
  const childrenMarkup = children ? /* @__PURE__ */ React.createElement(Text$1, {
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
    className: styles$i.DismissIcon
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
var styles$g = {
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
    className: styles$g.Bleed,
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
var styles$f = {
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
    className: styles$f.InlineGrid,
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
var styles$e = {
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
function Cell({
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
  const className = classNames(styles$e.Cell, styles$e[`Cell-${variationName("verticalAlign", verticalAlign)}`], firstColumn && styles$e["Cell-firstColumn"], truncate && styles$e["Cell-truncated"], header && styles$e["Cell-header"], total && styles$e["Cell-total"], totalInFooter && styles$e["Cell-total-footer"], numeric && styles$e["Cell-numeric"], sortable && styles$e["Cell-sortable"], sorted && styles$e["Cell-sorted"], stickyHeadingCell && styles$e.StickyHeaderCell, hovered && styles$e["Cell-hovered"], lastFixedFirstColumn && inFixedNthColumn && fixedCellVisible && styles$e["Cell-separate"], nthColumn && inFixedNthColumn && stickyHeadingCell && styles$e.FixedFirstColumn);
  const headerClassName = classNames(header && styles$e.Heading, header && contentType === "text" && styles$e["Heading-left"]);
  const iconClassName = classNames(sortable && styles$e.Icon);
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
    className: styles$e.TooltipContent
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
var styles$d = {
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
  const previousHandler = onPrevious || noop;
  const previousButtonEvents = previousKeys && (previousURL || onPrevious) && hasPrevious && previousKeys.map((key) => /* @__PURE__ */ React.createElement(KeypressListener, {
    key,
    keyCode: key,
    handler: previousURL ? handleCallback(clickPaginationLink("previousURL", node)) : handleCallback(previousHandler)
  }));
  const nextHandler = onNext || noop;
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
    }, /* @__PURE__ */ React.createElement(Text$1, {
      as: "span",
      variant: "bodySm",
      fontWeight: "medium"
    }, label)) : null;
    return /* @__PURE__ */ React.createElement("nav", {
      "aria-label": navLabel,
      ref: node,
      className: classNames(styles$d.Pagination, styles$d.table)
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
      className: styles$d.TablePaginationActions,
      "data-buttongroup-variant": "segmented"
    }, /* @__PURE__ */ React.createElement("div", null, constructedPrevious), labelMarkup2, /* @__PURE__ */ React.createElement("div", null, constructedNext)))));
  }
  const labelTextMarkup = hasNext && hasPrevious ? /* @__PURE__ */ React.createElement("span", null, label) : /* @__PURE__ */ React.createElement(Text$1, {
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
    className: styles$d.Pagination
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
function noop() {
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
    const className = classNames(styles$e.Pip, column.isVisible && styles$e["Pip-visible"]);
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
    className: styles$e.Navigation,
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
        return [/* @__PURE__ */ React.createElement(Cell, Object.assign({
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
        })), /* @__PURE__ */ React.createElement(Cell, Object.assign({
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
      return /* @__PURE__ */ React.createElement(Cell, Object.assign({
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
      return /* @__PURE__ */ React.createElement(Cell, {
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
      const className = classNames(styles$e.TableRow, hoverable && styles$e.hoverable);
      return /* @__PURE__ */ React.createElement("tr", {
        key: `row-${index}`,
        className,
        onMouseEnter: this.handleHover(index),
        onMouseLeave: this.handleHover()
      }, row.map((content, cellIndex) => {
        const hovered = index === this.state.rowHovered;
        const id = `cell-${cellIndex}-row-${index}`;
        const colSpan = this.getColSpan(row.length, headings.length, columnContentTypes.length, cellIndex);
        return /* @__PURE__ */ React.createElement(Cell, {
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
    const className = classNames(styles$e.DataTable, condensed && styles$e.condensed, totals && styles$e.ShowTotals, showTotalsInFooter && styles$e.ShowTotalsInFooter, hasZebraStripingOnData && styles$e.ZebraStripingOnData, hasZebraStripingOnData && rowCountIsEven && styles$e.RowCountIsEven);
    const wrapperClassName = classNames(styles$e.TableWrapper, condensed && styles$e.condensed, increasedTableDensity && styles$e.IncreasedTableDensity, stickyHeader && styles$e.StickyHeaderEnabled);
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
      className: classNames(styles$e.FixedFirstColumn, !isScrolledFarthestLeft && styles$e.separate),
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
      className: styles$e.Footer
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
      className: styles$e.StickyHeaderWrapper,
      role: "presentation"
    }, /* @__PURE__ */ React.createElement(Sticky, {
      boundingElement: this.dataTable.current,
      onStickyChange: (isSticky) => {
        this.changeHeadingFocus();
        this.stickyHeaderActive = isSticky;
      }
    }, (isSticky) => {
      const stickyHeaderInnerClassNames = classNames(styles$e.StickyHeaderInner, isSticky && styles$e["StickyHeaderInner-isSticky"]);
      const stickyHeaderTableClassNames = classNames(styles$e.StickyHeaderTable, !isScrolledFarthestLeft && styles$e.separate);
      return /* @__PURE__ */ React.createElement("div", {
        className: stickyHeaderInnerClassNames
      }, /* @__PURE__ */ React.createElement("div", null, navigationMarkup("sticky")), /* @__PURE__ */ React.createElement("table", {
        className: stickyHeaderTableClassNames,
        ref: this.stickyTable
      }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", {
        className: styles$e.StickyTableHeadingsRow
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
      className: styles$e.ScrollContainer,
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
      className: styles$e.Table,
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
var styles$c = {
  "Divider": "Polaris-Divider"
};
const Divider = ({
  borderColor = "border-secondary",
  borderWidth = "025"
}) => {
  const borderColorValue = borderColor === "transparent" ? borderColor : `var(--p-color-${borderColor})`;
  return /* @__PURE__ */ React.createElement("hr", {
    className: styles$c.Divider,
    style: {
      borderBlockStart: `var(--p-border-width-${borderWidth}) solid ${borderColorValue}`
    }
  });
};
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
var styles$b = {
  "Item": "Polaris-FormLayout__Item",
  "grouped": "Polaris-FormLayout--grouped",
  "condensed": "Polaris-FormLayout--condensed"
};
function Item$1({
  children,
  condensed = false
}) {
  const className = classNames(styles$b.Item, condensed ? styles$b.condensed : styles$b.grouped);
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
    titleElement = /* @__PURE__ */ React.createElement(Text$1, {
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
function useMediaQuery() {
  const mediaQuery = useContext(MediaQueryContext);
  if (!mediaQuery) {
    throw new Error("No mediaQuery was provided. Your application must be wrapped in an <AppProvider> component. See https://polaris.shopify.com/components/app-provider for implementation instructions.");
  }
  return mediaQuery;
}
var styles$a = {
  "Body": "Polaris-Modal__Body",
  "NoScrollBody": "Polaris-Modal__NoScrollBody",
  "IFrame": "Polaris-Modal__IFrame"
};
var styles$9 = {
  "Section": "Polaris-Modal-Section",
  "titleHidden": "Polaris-Modal-Section--titleHidden"
};
function Section$1({
  children,
  flush = false,
  subdued = false,
  titleHidden = false
}) {
  const className = classNames(styles$9.Section, titleHidden && styles$9.titleHidden);
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
var styles$8 = {
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
  const classes = classNames(styles$8.Modal, size && styles$8[variationName("size", size)], limitHeight && styles$8.limitHeight);
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
  }, toastMessages ? toastMessages.map((toastMessage) => /* @__PURE__ */ React.createElement(Text$1, {
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
    className: styles$8.Container,
    "data-polaris-layer": true,
    "data-polaris-overlay": true,
    ref: containerNode
  }, /* @__PURE__ */ React.createElement(TrapFocus, null, /* @__PURE__ */ React.createElement("div", {
    role: "dialog",
    "aria-modal": true,
    "aria-label": labelledBy,
    "aria-labelledby": labelledBy,
    tabIndex: -1,
    className: styles$8.Dialog
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
  appear: classNames(styles$8.animateFadeUp, styles$8.entering),
  appearActive: classNames(styles$8.animateFadeUp, styles$8.entered),
  enter: classNames(styles$8.animateFadeUp, styles$8.entering),
  enterActive: classNames(styles$8.animateFadeUp, styles$8.entered),
  exit: classNames(styles$8.animateFadeUp, styles$8.exiting),
  exitActive: classNames(styles$8.animateFadeUp, styles$8.exited)
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
      className: styles$a.NoScrollBody
    }, /* @__PURE__ */ React.createElement(Box, {
      width: "100%",
      overflowX: "hidden",
      overflowY: "hidden"
    }, body)) : /* @__PURE__ */ React.createElement(Scrollable, {
      shadow: true,
      className: styles$a.Body,
      onScrolledToBottom
    }, body);
    const bodyMarkup = src ? /* @__PURE__ */ React.createElement("iframe", {
      name: iFrameName,
      title: iframeTitle,
      src,
      className: styles$a.IFrame,
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
  const descriptionMarkup = typeof description === "string" ? /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
  }, /* @__PURE__ */ React.createElement(Text$1, {
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
const action$6 = async ({ request }) => {
  const raw = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = createHmac("sha256", process.env.SHOPIFY_API_SECRET).update(raw, "utf8").digest("base64");
  const valid = hmac.length === digest.length && timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
  if (!valid) return new Response("unauthorized", { status: 401 });
  console.log("Customer data request received:", JSON.parse(raw));
  return new Response("ok", { status: 200 });
};
const loader$9 = () => new Response(null, { status: 405 });
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
const action$5 = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
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
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
const action$4 = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  try {
    await prisma.$transaction([
      // セッションデータ削除
      prisma.session.deleteMany({ where: { shop } }),
      // 商品選択データ削除
      prisma.selectedProduct.deleteMany({ where: { shopDomain: shop } }),
      // ショップ設定削除
      prisma.shopSetting.deleteMany({ where: { shopDomain: shop } })
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
  action: action$4
}, Symbol.toStringTag, { value: "Module" }));
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  loader: loader$9
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
const loader$8 = async () => {
  return json({ errors: {}, polarisTranslations });
};
const action$3 = async ({ request }) => {
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
    /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h2", children: "Log in" }),
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
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: Auth,
  links: links$1,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function action$2() {
  return json({
    status: "success",
    message: "API endpoint is working",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
async function loader$7() {
  return json({
    status: "ready",
    message: "Test endpoint is ready",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
        /* @__PURE__ */ jsxs(Text$1, { as: "p", variant: "bodyMd", children: [
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
        /* @__PURE__ */ jsxs(Text$1, { as: "p", variant: "bodyMd", children: [
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
        /* @__PURE__ */ jsx(Text$1, { as: "h2", variant: "headingMd", children: "Resources" }),
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
  return /* @__PURE__ */ jsx(
    Box,
    {
      as: "span",
      padding: "025",
      paddingInlineStart: "100",
      paddingInlineEnd: "100",
      background: "bg-surface-active",
      borderWidth: "025",
      borderColor: "border",
      borderRadius: "100",
      children: /* @__PURE__ */ jsx("code", { children })
    }
  );
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdditionalPage
}, Symbol.toStringTag, { value: "Module" }));
let _cache = null;
const TTL_MS = 10 * 60 * 1e3;
async function fetchGoldPriceDataTanaka() {
  if (_cache && Date.now() - _cache.at < TTL_MS) return _cache.data;
  try {
    const url = "https://gold.tanaka.co.jp/commodity/souba/index.php";
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();
    const priceMatch = html.match(/店頭小売価格[^：]*：[^0-9]*([0-9,]+)[^0-9]*円/i) || html.match(/小売価格[^：]*：[^0-9]*([0-9,]+)[^0-9]*円/i) || html.match(/金[^0-9]*([0-9,]+)[^0-9]*円/i) || html.match(/(\d{1,2},\d{3})\s*円/i);
    const retailPriceStr = priceMatch ? priceMatch[1].replace(/,/g, "") : null;
    const retailPrice = retailPriceStr ? parseInt(retailPriceStr) : null;
    const changeMatch = html.match(/前日比[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i) || html.match(/変動[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i);
    const changeYen = changeMatch ? Number(changeMatch[1]) : null;
    console.log("Gold price extraction:", {
      priceMatch: priceMatch == null ? void 0 : priceMatch[0],
      retailPrice,
      changeMatch: changeMatch == null ? void 0 : changeMatch[0],
      changeYen
    });
    const changeRatio = changeYen !== null && retailPrice !== null ? changeYen / retailPrice : null;
    const changePercent = changeRatio !== null ? `${(changeRatio * 100).toFixed(2)}%` : "0.00%";
    let changeDirection = "flat";
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = "up";
      else if (changeRatio < 0) changeDirection = "down";
    }
    const data = {
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : "取得失敗",
      changeRatio,
      changePercent: changeRatio !== null ? changeRatio >= 0 ? `+${changePercent}` : changePercent : "0.00%",
      changeDirection,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    _cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error("田中貴金属価格取得エラー:", error);
    _cache = { at: Date.now(), data: null };
    return null;
  }
}
async function fetchGoldChangeRatioTanaka() {
  const data = await fetchGoldPriceDataTanaka();
  return (data == null ? void 0 : data.changeRatio) || null;
}
function roundInt(n) {
  return Math.round(n);
}
function calcFinalPrice(current, ratio, minPct) {
  const calc = current * (1 + ratio);
  const floor = current * (minPct / 100);
  return String(roundInt(Math.max(calc, floor)));
}
async function runBulkUpdateBySpec(admin, shop) {
  var _a, _b, _c, _d, _e, _f;
  const ratio = await fetchGoldChangeRatioTanaka();
  if (ratio === null) {
    return { ok: false, disabled: true, reason: "金価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }
  const setting = await prisma.shopSetting.findUnique({ where: { shopDomain: shop } });
  const minPct = (setting == null ? void 0 : setting.minPricePct) ?? 93;
  const targets = await prisma.selectedProduct.findMany({
    where: { shopDomain: shop },
    select: { productId: true }
  });
  if (!targets.length) {
    return { ok: true, goldRatio: ratio, minPct, updated: 0, failed: 0, details: [], message: "対象なし" };
  }
  const entries = [];
  for (const t of targets) {
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
          variants(first: 50) {
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
      const newPrice = calcFinalPrice(current, ratio, minPct);
      if (parseFloat(newPrice) !== current) {
        entries.push({
          productId: t.productId,
          variantId: variant.id,
          newPrice,
          oldPrice: current
        });
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!entries.length) {
    return { ok: true, goldRatio: ratio, minPct, updated: 0, failed: 0, details: [], message: "価格変更不要" };
  }
  const byProduct = /* @__PURE__ */ new Map();
  for (const e of entries) {
    const arr = byProduct.get(e.productId) ?? [];
    arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice });
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
    const errs = ((_c = (_b = r == null ? void 0 : r.data) == null ? void 0 : _b.productVariantsBulkUpdate) == null ? void 0 : _c.userErrors) ?? [];
    if (errs.length) {
      failed += variants.length;
      for (const variant of variants) {
        details.push({
          success: false,
          productId,
          variantId: variant.id,
          error: ((_d = errs[0]) == null ? void 0 : _d.message) || "不明なエラー"
        });
      }
    } else {
      const updatedVariants = ((_f = (_e = r == null ? void 0 : r.data) == null ? void 0 : _e.productVariantsBulkUpdate) == null ? void 0 : _f.productVariants) ?? [];
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
  return {
    ok: true,
    goldRatio: ratio,
    minPct,
    updated,
    failed,
    details
  };
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
  return Math.ceil(finalPrice / 10) * 10;
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
async function fetchGoldPrice() {
  try {
    const goldData = await fetchGoldPriceDataTanaka();
    if (!goldData || goldData.changeRatio === null) return null;
    return {
      ratio: goldData.changeRatio,
      percentage: (goldData.changeRatio * 100).toFixed(2),
      change: goldData.changePercent,
      retailPrice: goldData.retailPrice,
      retailPriceFormatted: goldData.retailPriceFormatted,
      changeDirection: goldData.changeDirection,
      lastUpdated: goldData.lastUpdated
    };
  } catch (error) {
    console.error("金価格取得エラー:", error);
    return null;
  }
}
const loader$3 = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const [goldPrice, selectedProducts, shopSetting] = await Promise.all([
    fetchGoldPrice(),
    prisma.selectedProduct.findMany({
      where: {
        shopDomain: session.shop,
        selected: true
      },
      select: { productId: true }
    }),
    prisma.shopSetting.findUnique({
      where: { shopDomain: session.shop }
    })
  ]);
  const selectedProductIds = selectedProducts.map((p) => p.productId);
  const productsPromise = fetchAllProducts(admin);
  return defer({
    products: productsPromise,
    // Promise を渡す
    goldPrice,
    selectedProductIds,
    shopSetting
  });
};
const action$1 = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  if (action2 === "saveSelection") {
    const ids = formData.getAll("productId").map(String);
    const uniqueIds = Array.from(new Set(ids));
    await prisma.selectedProduct.deleteMany({
      where: { shopDomain: session.shop }
    });
    if (uniqueIds.length > 0) {
      await prisma.selectedProduct.createMany({
        data: uniqueIds.map((productId) => ({
          shopDomain: session.shop,
          productId,
          selected: true
        }))
      });
    }
    return json({ success: true, message: `${uniqueIds.length}件の商品を選択しました` });
  }
  if (action2 === "updatePrices") {
    JSON.parse(formData.get("selectedProducts"));
    parseFloat(formData.get("minPriceRate"));
    try {
      const result = await runBulkUpdateBySpec(admin, session.shop);
      if (!result.ok) {
        return json({
          error: result.reason,
          disabled: result.disabled,
          updateResults: []
        });
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
  return json({ error: "不正なアクション" });
};
function ProductsContent({ products, goldPrice, selectedProductIds, shopSetting }) {
  var _a, _b;
  const fetcher = useFetcher();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [minPriceRate, setMinPriceRate] = useState((shopSetting == null ? void 0 : shopSetting.minPricePct) || 93);
  const [showPreview, setShowPreview] = useState(false);
  const [pricePreview, setPricePreview] = useState([]);
  useEffect(() => {
    if (selectedProductIds && selectedProductIds.length > 0) {
      const persistedSelected = products.filter((p) => selectedProductIds.includes(p.id));
      setSelectedProducts(persistedSelected);
    }
  }, [products, selectedProductIds]);
  const filteredProducts = filterProducts(products, searchValue, filterType);
  const handleSelectProduct = useCallback((productId, isSelected) => {
    const product = products.find((p) => p.id === productId);
    if (isSelected) {
      setSelectedProducts((prev) => [...prev, product]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }, [products]);
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedProducts(filteredProducts);
    } else {
      setSelectedProducts([]);
    }
  }, [filteredProducts]);
  const saveSelection = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach((product) => {
      formData.append("productId", product.id);
    });
    fetcher.submit(formData, { method: "post" });
  }, [selectedProducts, fetcher]);
  const generatePricePreview = useCallback(() => {
    if (selectedProducts.length === 0 || !goldPrice) return;
    const preview = selectedProducts.map((product) => ({
      ...product,
      variants: product.variants.edges.map((edge) => {
        const variant = edge.node;
        const currentPrice = parseFloat(variant.price);
        const newPrice = calculateNewPrice(currentPrice, goldPrice.ratio, minPriceRate / 100);
        return {
          ...variant,
          currentPrice,
          newPrice,
          priceChange: newPrice - currentPrice,
          changed: newPrice !== currentPrice
        };
      })
    }));
    setPricePreview(preview);
    setShowPreview(true);
  }, [selectedProducts, goldPrice, minPriceRate]);
  const executePriceUpdate = useCallback(() => {
    if (!goldPrice) return;
    const updateData = selectedProducts.map((product) => ({
      ...product,
      variants: product.variants.edges.map((edge) => edge.node)
    }));
    fetcher.submit(
      {
        action: "updatePrices",
        selectedProducts: JSON.stringify(updateData),
        minPriceRate: minPriceRate.toString()
      },
      { method: "post" }
    );
    setShowPreview(false);
  }, [selectedProducts, goldPrice, minPriceRate, fetcher]);
  const tableRows = filteredProducts.map((product) => {
    var _a2;
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    const variants = product.variants.edges;
    const priceRange = variants.length > 1 ? `¥${Math.min(...variants.map((v) => parseFloat(v.node.price)))} - ¥${Math.max(...variants.map((v) => parseFloat(v.node.price)))}` : `¥${((_a2 = variants[0]) == null ? void 0 : _a2.node.price) || 0}`;
    return [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          checked: isSelected,
          onChange: (checked) => handleSelectProduct(product.id, checked)
        }
      ),
      product.title,
      /* @__PURE__ */ jsx(Badge, { status: product.status === "ACTIVE" ? "success" : "critical", children: product.status }),
      priceRange,
      variants.length
    ];
  });
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "商品価格自動調整",
      subtitle: `${filteredProducts.length}件の商品（全${products.length}件）`,
      primaryAction: {
        content: "価格調整プレビュー",
        onAction: generatePricePreview,
        disabled: selectedProducts.length === 0 || !goldPrice,
        loading: fetcher.state === "submitting"
      },
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsxs(Layout.Section, { children: [
          goldPrice && /* @__PURE__ */ jsxs("div", { style: {
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            borderRadius: "16px",
            padding: "24px",
            color: "white",
            position: "relative",
            overflow: "hidden",
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "120px",
              height: "120px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%"
            } }),
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
              /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
                /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(Text, { variant: "headingLg", as: "h2", tone: "text-inverse", children: "田中貴金属 金価格" }),
                  /* @__PURE__ */ jsx(Badge, { tone: goldPrice.changeDirection === "up" ? "critical" : goldPrice.changeDirection === "down" ? "success" : "info", children: goldPrice.changeDirection === "up" ? "上昇" : goldPrice.changeDirection === "down" ? "下落" : "変動なし" })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "text-inverse", children: "店頭小売価格（税込）" }),
                    /* @__PURE__ */ jsx(Text, { variant: "headingXl", as: "p", tone: "text-inverse", children: goldPrice.retailPriceFormatted })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "text-inverse", children: "前日比" }),
                    /* @__PURE__ */ jsx(Text, { variant: "headingLg", as: "p", tone: "text-inverse", children: goldPrice.change })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: {
                  padding: "16px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)"
                }, children: /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", tone: "text-inverse", children: [
                  /* @__PURE__ */ jsxs("strong", { children: [
                    "価格調整率: ",
                    goldPrice.percentage,
                    "%"
                  ] }),
                  " — この変動率で商品価格を自動調整"
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "end", children: [
                /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "text-inverse", children: "最終更新" }),
                /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "text-inverse", children: new Date(goldPrice.lastUpdated).toLocaleString("ja-JP") })
              ] })
            ] })
          ] }),
          !goldPrice && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: "金価格情報の取得に失敗しました。価格調整機能をご利用いただけません。" })
        ] }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: {
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "20px"
        }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: "商品検索・選択" }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
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
          /* @__PURE__ */ jsx("div", { style: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }, children: /* @__PURE__ */ jsx(
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
          ) }),
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
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: saveSelection,
                disabled: fetcher.state === "submitting",
                variant: "primary",
                size: "large",
                children: "選択を保存"
              }
            )
          ] }),
          selectedProductIds && selectedProductIds.length > 0 && /* @__PURE__ */ jsx("div", { style: {
            background: "#e0f2fe",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #0ea5e9"
          }, children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: ProductIcon, tone: "info" }),
            /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", children: [
              "現在 ",
              /* @__PURE__ */ jsxs("strong", { children: [
                selectedProductIds.length,
                "件"
              ] }),
              " の商品が自動更新対象として保存されています"
            ] })
          ] }) }),
          ((_a = fetcher.data) == null ? void 0 : _a.message) && /* @__PURE__ */ jsx("div", { style: {
            background: "#dcfce7",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #10b981"
          }, children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: CheckCircleIcon, tone: "success" }),
            /* @__PURE__ */ jsx(Text, { variant: "bodyMd", tone: "success", children: fetcher.data.message })
          ] }) })
        ] }) }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "text", "text", "text", "numeric"],
            headings: ["選択", "商品名", "ステータス", "価格", "バリエーション"],
            rows: tableRows,
            pagination: {
              hasNext: false,
              hasPrevious: false
            }
          }
        ) }) }),
        /* @__PURE__ */ jsx(
          Modal,
          {
            open: showPreview,
            onClose: () => setShowPreview(false),
            title: "価格調整プレビュー",
            primaryAction: {
              content: "価格を更新",
              onAction: executePriceUpdate,
              loading: fetcher.state === "submitting"
            },
            secondaryActions: [
              {
                content: "キャンセル",
                onAction: () => setShowPreview(false)
              }
            ],
            large: true,
            children: /* @__PURE__ */ jsx(Modal.Section, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: pricePreview.map((product) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsx("h4", { children: product.title }),
              product.variants.map((variant) => /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
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
        ((_b = fetcher.data) == null ? void 0 : _b.updateResults) && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx("h3", { children: "価格更新結果" }),
          fetcher.data.summary && /* @__PURE__ */ jsx(Card, { background: "bg-surface-secondary", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              "合計: ",
              /* @__PURE__ */ jsx("strong", { children: fetcher.data.summary.total }),
              "件"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "成功: ",
              /* @__PURE__ */ jsx("strong", { style: { color: "green" }, children: fetcher.data.summary.success }),
              "件"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "失敗: ",
              /* @__PURE__ */ jsx("strong", { style: { color: "red" }, children: fetcher.data.summary.failed }),
              "件"
            ] })
          ] }) }),
          fetcher.data.error && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: fetcher.data.error }),
          fetcher.data.message && /* @__PURE__ */ jsx(Banner, { tone: "info", children: fetcher.data.message }),
          fetcher.data.updateResults.map((result, index) => {
            var _a2, _b2;
            return /* @__PURE__ */ jsx(
              Banner,
              {
                tone: result.success ? "success" : "critical",
                children: result.success ? `${result.product} - ${result.variant}: ¥${(_a2 = result.oldPrice) == null ? void 0 : _a2.toLocaleString()} → ¥${(_b2 = result.newPrice) == null ? void 0 : _b2.toLocaleString()}` : `${result.product} - ${result.variant}: ${result.error}`
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
  const { goldPrice, selectedProductIds, shopSetting } = data;
  return /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx(Page, { title: "商品価格自動調整", subtitle: "読み込み中...", children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsx(Layout.Section, { children: goldPrice && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
            /* @__PURE__ */ jsx("h3", { children: "田中貴金属 金価格情報" }),
            /* @__PURE__ */ jsx(Badge, { tone: goldPrice.changeDirection === "up" ? "attention" : goldPrice.changeDirection === "down" ? "success" : "info", children: goldPrice.changeDirection === "up" ? "上昇" : goldPrice.changeDirection === "down" ? "下落" : "変動なし" })
          ] }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { style: { color: "#6B7280", fontSize: "14px" }, children: "店頭小売価格（税込）" }),
              /* @__PURE__ */ jsx("p", { style: { fontSize: "18px", fontWeight: "bold" }, children: goldPrice.retailPriceFormatted })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { style: { color: "#6B7280", fontSize: "14px" }, children: "前日比" }),
              /* @__PURE__ */ jsx("p", { style: { fontSize: "18px", fontWeight: "bold", color: goldPrice.changeDirection === "up" ? "#DC2626" : goldPrice.changeDirection === "down" ? "#059669" : "#6B7280" }, children: goldPrice.change })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "8px" }, children: /* @__PURE__ */ jsxs("p", { style: { margin: 0 }, children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "価格調整率: ",
              goldPrice.percentage,
              "%"
            ] }),
            "（この変動率で商品価格を自動調整します）"
          ] }) }),
          /* @__PURE__ */ jsxs("p", { style: { color: "#6B7280", fontSize: "12px", margin: 0 }, children: [
            "最終更新: ",
            new Date(goldPrice.lastUpdated).toLocaleString("ja-JP")
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "60px 20px" }, children: [
          /* @__PURE__ */ jsx(Spinner$1, { size: "large" }),
          /* @__PURE__ */ jsx("p", { style: { marginTop: "20px", color: "#6B7280" }, children: "商品データを読み込んでいます..." })
        ] }) }) }) })
      ] }) }),
      children: /* @__PURE__ */ jsx(Await, { resolve: data.products, children: (products) => /* @__PURE__ */ jsx(
        ProductsContent,
        {
          products,
          goldPrice,
          selectedProductIds,
          shopSetting
        }
      ) })
    }
  );
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Products,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const setting = await prisma.shopSetting.upsert({
    where: { shopDomain: shop },
    update: {},
    create: {
      shopDomain: shop,
      minPricePct: 93,
      autoUpdateEnabled: false,
      autoUpdateHour: 10
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
  const autoUpdateHour = Math.max(0, Math.min(23, Number(form.get("autoUpdateHour") || 10)));
  const notificationEmail = String(form.get("notificationEmail") || "");
  await prisma.shopSetting.upsert({
    where: { shopDomain: shop },
    update: {
      autoUpdateEnabled,
      minPricePct,
      autoUpdateHour,
      notificationEmail: notificationEmail || null
    },
    create: {
      shopDomain: shop,
      autoUpdateEnabled,
      minPricePct,
      autoUpdateHour,
      notificationEmail: notificationEmail || null
    }
  });
  return json({
    success: true,
    message: "設定が正常に保存されました",
    setting: {
      autoUpdateEnabled,
      minPricePct,
      autoUpdateHour,
      notificationEmail: notificationEmail || null
    }
  });
}
function Settings() {
  const { setting } = useLoaderData();
  const fetcher = useFetcher();
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(setting.autoUpdateEnabled);
  const [minPricePct, setMinPricePct] = useState(setting.minPricePct.toString());
  const [autoUpdateHour, setAutoUpdateHour] = useState(setting.autoUpdateHour.toString());
  const [notificationEmail, setNotificationEmail] = useState(setting.notificationEmail || "");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  useEffect(() => {
    var _a;
    if ((_a = fetcher.data) == null ? void 0 : _a.success) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3e3);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);
  const hourOptions = [...Array(24)].map((_, i) => ({
    label: `${String(i).padStart(2, "0")}:00`,
    value: i.toString()
  }));
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("autoUpdateEnabled", autoUpdateEnabled.toString());
    formData.append("minPricePct", minPricePct);
    formData.append("autoUpdateHour", autoUpdateHour);
    formData.append("notificationEmail", notificationEmail);
    fetcher.submit(formData, { method: "post" });
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
          /* @__PURE__ */ jsx(Text$1, { children: "設定が正常に保存されました" })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "300", align: "start", children: [
            /* @__PURE__ */ jsx(Icon, { source: SettingsIcon, tone: "base" }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h2", children: "自動更新設定" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "田中貴金属の価格変動に基づいて商品価格を自動調整します" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsxs(FormLayout, { children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                label: "自動更新を有効化",
                helpText: "有効にすると設定時刻に自動で価格調整が実行されます",
                checked: autoUpdateEnabled,
                onChange: setAutoUpdateEnabled
              }
            ),
            /* @__PURE__ */ jsxs(InlineStack, { gap: "400", align: "start", children: [
              /* @__PURE__ */ jsx("div", { style: { minWidth: "200px" }, children: /* @__PURE__ */ jsx(
                Select,
                {
                  label: "自動更新時刻（JST）",
                  options: hourOptions,
                  value: autoUpdateHour,
                  onChange: setAutoUpdateHour,
                  disabled: !autoUpdateEnabled
                }
              ) }),
              /* @__PURE__ */ jsx("div", { style: { paddingTop: "24px" }, children: /* @__PURE__ */ jsx(Badge, { tone: autoUpdateEnabled ? "info" : "warning", children: autoUpdateEnabled ? "有効" : "無効" }) })
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
              /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h2", children: "通知設定" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "価格更新の実行結果やエラーを通知します" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsx(FormLayout, { children: /* @__PURE__ */ jsx(
            TextField,
            {
              label: "通知メールアドレス（任意）",
              type: "email",
              value: notificationEmail,
              onChange: setNotificationEmail,
              placeholder: "you@example.com",
              helpText: "設定すると自動更新の結果がメールで通知されます"
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "300", align: "start", children: [
            /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "base" }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h2", children: "実行スケジュール" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "自動更新の実行タイミングについて" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "実行曜日" }),
                /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "平日（月〜金曜日）" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "実行時刻" }),
                /* @__PURE__ */ jsxs(Text$1, { variant: "bodySm", tone: "subdued", children: [
                  String(setting.autoUpdateHour || 10).padStart(2, "0"),
                  ":00（日本時間）"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", as: "p", fontWeight: "semibold", children: "祝日対応" }),
                /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "自動的にスキップ" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Banner, { tone: "info", children: /* @__PURE__ */ jsx(Text$1, { children: "自動更新は平日の設定時刻に実行され、日本の祝日は自動的にスキップされます。 価格変動がない場合や取得エラー時は更新をスキップします。" }) })
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
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Settings,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  var _a;
  const { session } = await authenticate.admin(request);
  try {
    const goldData = await fetchGoldPriceDataTanaka();
    const [selectedProducts, recentLogs, shopSetting] = await Promise.all([
      prisma.selectedProduct.count({
        where: { shopDomain: session.shop, selected: true }
      }),
      prisma.priceUpdateLog.findMany({
        where: { shopDomain: session.shop },
        orderBy: { executedAt: "desc" },
        take: 5
      }),
      prisma.shopSetting.findUnique({
        where: { shopDomain: session.shop }
      })
    ]);
    return json({
      goldPrice: goldData ? {
        ratio: goldData.changeRatio,
        percentage: (goldData.changeRatio * 100).toFixed(2),
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
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
      stats: { selectedProducts: 0, totalLogs: 0, lastExecution: null, autoScheduleEnabled: false },
      recentLogs: []
    });
  }
};
function Dashboard() {
  const { goldPrice, stats, recentLogs } = useLoaderData();
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "金価格自動調整ダッシュボード",
      subtitle: "K18商品の価格を田中貴金属の金価格に連動して自動調整",
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "600", children: [
        /* @__PURE__ */ jsxs("div", { style: {
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          borderRadius: "16px",
          padding: "32px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%"
          } }),
          /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%"
          } }),
          /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "24px", marginRight: "8px" }, children: "📈" }),
                /* @__PURE__ */ jsx(Text$1, { variant: "headingLg", as: "h2", tone: "text-inverse", children: "田中貴金属 金価格" })
              ] }),
              goldPrice ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", tone: "text-inverse", children: goldPrice.retailPriceFormatted }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      tone: goldPrice.changeDirection === "up" ? "critical" : goldPrice.changeDirection === "down" ? "success" : "info",
                      size: "large",
                      children: goldPrice.change
                    }
                  ),
                  /* @__PURE__ */ jsxs(Text$1, { variant: "bodyLg", tone: "text-inverse", children: [
                    "前日比 • 調整率: ",
                    goldPrice.percentage,
                    "%"
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsx(Text$1, { variant: "headingLg", tone: "text-inverse", children: "価格情報取得中..." })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "end", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "text-inverse", children: "最終更新" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "text-inverse", children: goldPrice ? new Date(goldPrice.lastUpdated).toLocaleString("ja-JP") : "--" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: "#e0f2fe",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: ProductIcon, tone: "info" }) }),
            /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", children: stats.selectedProducts }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "選択中の商品" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: stats.autoScheduleEnabled ? "#dcfce7" : "#fef3c7",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: stats.autoScheduleEnabled ? "success" : "warning" }) }),
            /* @__PURE__ */ jsx(Badge, { tone: stats.autoScheduleEnabled ? "success" : "warning", children: stats.autoScheduleEnabled ? "有効" : "無効" }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "自動スケジュール" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: "#fce7f3",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: NotificationIcon, tone: "base" }) }),
            /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", children: stats.totalLogs }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "最近の実行" })
          ] }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h3", children: "クイックアクション" }),
              /* @__PURE__ */ jsx(InlineStack, { gap: "200", children: /* @__PURE__ */ jsx(Link$1, { to: "/app/settings", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(Button, { icon: SettingsIcon, children: "設定" }) }) })
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { gap: "300", children: [
              /* @__PURE__ */ jsx(Link$1, { to: "/app/products", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(Button, { variant: "primary", size: "large", children: "商品価格を調整" }) }),
              /* @__PURE__ */ jsx(Link$1, { to: "/app/logs", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(Button, { children: "実行ログを確認" }) })
            ] }),
            stats.lastExecution && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Divider, {}),
              /* @__PURE__ */ jsx(BlockStack, { gap: "200", children: /* @__PURE__ */ jsxs(Text$1, { variant: "bodyMd", tone: "subdued", children: [
                "最終実行: ",
                new Date(stats.lastExecution).toLocaleString("ja-JP")
              ] }) })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h3", children: "最近の実行ログ" }),
            recentLogs.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "40px 20px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", align: "center", children: [
              /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "subdued" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "まだ実行履歴がありません" })
            ] }) }) : /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
              recentLogs.slice(0, 3).map((log, index) => /* @__PURE__ */ jsx("div", { style: {
                padding: "16px",
                background: "#f9fafb",
                borderRadius: "8px",
                borderLeft: `4px solid ${log.success ? "#10b981" : "#ef4444"}`
              }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
                /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(Badge, { tone: log.success ? "success" : "critical", children: log.success ? "成功" : "失敗" }),
                  /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: new Date(log.executedAt).toLocaleDateString("ja-JP") })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
                  /* @__PURE__ */ jsxs(Text$1, { variant: "bodySm", children: [
                    "商品: ",
                    log.totalProducts || 0,
                    "件"
                  ] }),
                  /* @__PURE__ */ jsxs(Text$1, { variant: "bodySm", children: [
                    "成功: ",
                    log.updatedCount || 0,
                    "件"
                  ] })
                ] })
              ] }) }, log.id)),
              recentLogs.length > 3 && /* @__PURE__ */ jsx(Link$1, { to: "/app/logs", style: { textDecoration: "none" }, children: /* @__PURE__ */ jsx(Button, { variant: "plain", fullWidth: true, children: "すべてのログを表示" }) })
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: {
          padding: "24px",
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          borderRadius: "12px"
        }, children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "center", children: [
          /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h3", children: "Gold Price Updater" }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "田中貴金属の金価格に連動したK18商品の自動価格調整システム" })
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
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const [logs, stats] = await Promise.all([
    prisma.priceUpdateLog.findMany({
      where: { shopDomain: shop },
      orderBy: { executedAt: "desc" },
      take: 100
    }),
    prisma.priceUpdateLog.aggregate({
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
      /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", as: "p", children: new Date(log.executedAt).toLocaleDateString("ja-JP") }),
      /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: new Date(log.executedAt).toLocaleTimeString("ja-JP") })
    ] }, `time-${log.id}`),
    /* @__PURE__ */ jsx(Badge, { tone: log.executionType === "auto" ? "info" : "warning", children: log.executionType === "auto" ? "自動実行" : "手動実行" }, `type-${log.id}`),
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
    /* @__PURE__ */ jsx("div", { children: log.goldRatio !== null && log.goldRatio !== void 0 ? /* @__PURE__ */ jsxs(InlineStack, { gap: "100", blockAlign: "center", children: [
      /* @__PURE__ */ jsx("span", { style: {
        fontSize: "16px",
        color: log.goldRatio >= 0 ? "#dc2626" : "#059669"
      }, children: log.goldRatio >= 0 ? "📈" : "📉" }),
      /* @__PURE__ */ jsxs(Text$1, { children: [
        (log.goldRatio * 100).toFixed(2),
        "%"
      ] })
    ] }) : /* @__PURE__ */ jsx(Text$1, { tone: "subdued", children: "-" }) }, `ratio-${log.id}`),
    /* @__PURE__ */ jsxs(Text$1, { children: [
      log.minPricePct || "-",
      "%"
    ] }, `min-${log.id}`),
    /* @__PURE__ */ jsxs(Text$1, { children: [
      log.totalProducts || 0,
      "件"
    ] }, `products-${log.id}`),
    /* @__PURE__ */ jsxs(InlineStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Text$1, { tone: "success", children: log.updatedCount || 0 }),
      /* @__PURE__ */ jsx(Text$1, { tone: "subdued", children: "/" }),
      /* @__PURE__ */ jsx(Text$1, { tone: "critical", children: log.failedCount || 0 })
    ] }, `counts-${log.id}`),
    /* @__PURE__ */ jsx("div", { children: log.errorMessage ? /* @__PURE__ */ jsx(Box, { padding: "200", background: "bg-critical-subdued", borderRadius: "100", children: /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "critical", children: log.errorMessage.length > 50 ? log.errorMessage.substring(0, 50) + "..." : log.errorMessage }) }) : /* @__PURE__ */ jsx(Text$1, { tone: "subdued", children: "-" }) }, `error-${log.id}`)
  ]);
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "実行ログ",
      subtitle: `${logs.length}件の実行履歴を表示`,
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: "#e0f2fe",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "info" }) }),
            /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", children: stats.totalExecutions }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "総実行回数" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: "#dcfce7",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: CheckCircleIcon, tone: "success" }) }),
            /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", children: stats.totalSuccess }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "成功更新数" })
          ] }) }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: { padding: "20px", textAlign: "center" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", align: "center", children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "48px",
              height: "48px",
              background: stats.totalFailed > 0 ? "#fecaca" : "#f3f4f6",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsx(Icon, { source: AlertCircleIcon, tone: stats.totalFailed > 0 ? "critical" : "subdued" }) }),
            /* @__PURE__ */ jsx(Text$1, { variant: "heading2xl", as: "p", children: stats.totalFailed }),
            /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: "失敗更新数" })
          ] }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h3", children: "フィルター" }),
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
                  { label: "自動実行", value: "auto" },
                  { label: "手動実行", value: "manual" }
                ],
                value: typeFilter,
                onChange: setTypeFilter
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs(Text$1, { variant: "bodySm", tone: "subdued", children: [
            filteredLogs.length,
            "件 / ",
            logs.length,
            "件を表示"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: filteredLogs.length === 0 ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "60px 20px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", align: "center", children: [
          /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "subdued" }),
          /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", tone: "subdued", children: logs.length === 0 ? "まだ実行ログがありません" : "フィルター条件に一致するログがありません" }),
          /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", tone: "subdued", children: logs.length === 0 ? "商品価格調整を実行すると、ここに履歴が表示されます。" : "フィルター条件を変更してください。" })
        ] }) }) : /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "text", "text", "text", "text", "text", "text", "text"],
            headings: [
              "実行日時",
              "種類",
              "結果",
              "金価格変動率",
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
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { style: {
          padding: "20px",
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          borderRadius: "12px"
        }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
          /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: ClockIcon, tone: "base" }),
            /* @__PURE__ */ jsx(Text$1, { variant: "headingMd", as: "h3", children: "ログの見方" })
          ] }),
          /* @__PURE__ */ jsxs(InlineStack, { gap: "600", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", fontWeight: "semibold", children: "実行タイプ" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• 自動実行: スケジュールによる定期実行" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• 手動実行: UIからの手動実行" })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", fontWeight: "semibold", children: "金価格変動率" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• 田中貴金属から取得した前日比" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• この変動率で商品価格を調整" })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
              /* @__PURE__ */ jsx(Text$1, { variant: "bodyMd", fontWeight: "semibold", children: "価格下限" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• 価格下落時の最低価格率" }),
              /* @__PURE__ */ jsx(Text$1, { variant: "bodySm", tone: "subdued", children: "• 例: 93% = 7%以上は下がらない" })
            ] })
          ] })
        ] }) }) })
      ] })
    }
  );
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Logs,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-cCrLS3HR.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BwlOh0sD.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/styles-BDwA4lvJ.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/webhooks.customers.data_request": { "id": "routes/webhooks.customers.data_request", "parentId": "root", "path": "webhooks/customers/data_request", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.customers.data_request-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.customers.redact": { "id": "routes/webhooks.customers.redact", "parentId": "root", "path": "webhooks/customers/redact", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.customers.redact-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.shop.redact": { "id": "routes/webhooks.shop.redact", "parentId": "root", "path": "webhooks/shop/redact", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.shop.redact-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Ce5mZqPr.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/styles-BDwA4lvJ.js", "/assets/components-CE-OXjA9.js", "/assets/Page-CUdf0xBo.js", "/assets/FormLayout-UJivAdCW.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/api.test": { "id": "routes/api.test", "parentId": "root", "path": "api/test", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.test-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-C6d-v1ok.js", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-CAtiM_lO.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/styles-BDwA4lvJ.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.additional-D3-LF-Qi.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/Page-CUdf0xBo.js", "/assets/Layout-CN1seCzE.js", "/assets/banner-context-Bfu3e4If.js", "/assets/context-C9td0CMk.js"], "css": [] }, "routes/app.products": { "id": "routes/app.products", "parentId": "routes/app", "path": "products", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.products-C9S7AShW.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/Page-CUdf0xBo.js", "/assets/Layout-CN1seCzE.js", "/assets/Banner-D_Rcuybh.js", "/assets/Select-DHDjkFid.js", "/assets/ProductIcon.svg-i01w094n.js", "/assets/DataTable-dk25Vxus.js", "/assets/context-C9td0CMk.js", "/assets/context-Dqc0DVKX.js", "/assets/banner-context-Bfu3e4If.js"], "css": [] }, "routes/app.settings": { "id": "routes/app.settings", "parentId": "routes/app", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.settings-BNSVjd4w.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/Page-CUdf0xBo.js", "/assets/Layout-CN1seCzE.js", "/assets/Banner-D_Rcuybh.js", "/assets/Select-DHDjkFid.js", "/assets/Divider-DCXs5LYm.js", "/assets/FormLayout-UJivAdCW.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/context-C9td0CMk.js", "/assets/banner-context-Bfu3e4If.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-DsNZ2v4T.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/Page-CUdf0xBo.js", "/assets/Layout-CN1seCzE.js", "/assets/ProductIcon.svg-i01w094n.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/Divider-DCXs5LYm.js", "/assets/context-C9td0CMk.js"], "css": [] }, "routes/app.logs": { "id": "routes/app.logs", "parentId": "routes/app", "path": "logs", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.logs-DKfoiLp7.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-CE-OXjA9.js", "/assets/Page-CUdf0xBo.js", "/assets/Select-DHDjkFid.js", "/assets/Layout-CN1seCzE.js", "/assets/ClockIcon.svg-Dq65wAvQ.js", "/assets/DataTable-dk25Vxus.js", "/assets/context-C9td0CMk.js"], "css": [] } }, "url": "/assets/manifest-7e2ff594.js", "version": "7e2ff594" };
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
  "routes/webhooks.shop.redact": {
    id: "routes/webhooks.shop.redact",
    parentId: "root",
    path: "webhooks/shop/redact",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.test": {
    id: "routes/api.test",
    parentId: "root",
    path: "api/test",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route8
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app.products": {
    id: "routes/app.products",
    parentId: "routes/app",
    path: "products",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app.settings": {
    id: "routes/app.settings",
    parentId: "routes/app",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.logs": {
    id: "routes/app.logs",
    parentId: "routes/app",
    path: "logs",
    index: void 0,
    caseSensitive: void 0,
    module: route15
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
