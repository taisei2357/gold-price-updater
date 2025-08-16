import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import {AppProvider} from "@shopify/polaris";
import ja from "@shopify/polaris/locales/ja.json";

// Polaris の CSS をリンクで読み込む（Remix v2 の ?url 方式）
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [
  {rel: "stylesheet", href: polarisStyles},
];

export default function App() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* ✅ Polaris を全体に供給（i18n 必須） */}
        <AppProvider i18n={ja}>
          <Outlet />
        </AppProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}