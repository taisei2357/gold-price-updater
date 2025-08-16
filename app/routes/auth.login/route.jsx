import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// ✅ loaderではloginを呼ばない（フォームを表示するだけ）
export const loader = async () => {
  return json({ errors: {}, polarisTranslations });
};

// ✅ actionでのみOAuth開始
export const action = async ({ request }) => {
  const formData = await request.formData();
  const rawShop = (formData.get("shop") || "").toString();

  // 正規化：空白除去・小文字化・myshopify.com付与
  const shop = normalizeShop(rawShop);
  if (!shop) {
    return json({ errors: { shop: "Shop domain is required" } }, { status: 400 });
  }

  // login()がRedirect Responseを返す想定。成功時はそのままreturn。
  try {
    // loginに渡すためにshopを差し替えて再構成
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
  // すでに完全ドメインならそのまま（サブドメイン判定だけ緩め）
  if (s.endsWith(".myshopify.com")) return s;
  // "luxrexor2" のような短縮入力に対応
  if (!s.includes(".")) return `${s}.myshopify.com`;
  // 余計な末尾を剥がして付け直す保険
  const base = s.split(".myshopify.com")[0].replace(/\.$/, "");
  return `${base}.myshopify.com`;
}

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const errors = (actionData?.errors || loaderData.errors || {});

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          {/* replaceで履歴汚れ防止 */}
          <Form method="post" replace>
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="example.myshopify.com"
                value={shop}
                onChange={(v) => setShop(v)}
                autoComplete="off"
                error={errors.shop}
              />
              <Button submit>Log in</Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
