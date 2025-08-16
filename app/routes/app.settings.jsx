// app/routes/app.settings.jsx
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
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
    },
  });

  return json({ setting });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const form = await request.formData();
  const autoUpdateEnabled = form.get("autoUpdateEnabled") === "on";
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

  return redirect(".");
}

export default function Settings() {
  const { setting } = useLoaderData();
  
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>自動価格調整 設定</h1>

      <Form method="post" style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label>
          <input 
            type="checkbox" 
            name="autoUpdateEnabled" 
            defaultChecked={setting.autoUpdateEnabled} 
          />
          <span style={{ marginLeft: 8 }}>自動更新を有効化</span>
        </label>

        <label>
          自動更新時刻（JST）
          <select
            style={{ marginLeft: 8, width: 120 }}
            name="autoUpdateHour"
            defaultValue={setting.autoUpdateHour || 10}
          >
            {[...Array(24)].map((_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}:00
              </option>
            ))}
          </select>
          <small style={{ marginLeft: 8, color: "#666" }}>
            平日のみ実行（祝日はスキップ）
          </small>
        </label>

        <label>
          価格下限（%）
          <input
            style={{ marginLeft: 8, width: 100 }}
            type="number" 
            name="minPricePct" 
            min={1} 
            max={100}
            defaultValue={setting.minPricePct}
          />
          <small style={{ marginLeft: 8, color: "#666" }}>
            現在価格の{setting.minPricePct}%を下限とする
          </small>
        </label>

        <label>
          通知メール（任意）
          <input
            style={{ marginLeft: 8, width: 280 }}
            type="email" 
            name="notificationEmail" 
            defaultValue={setting.notificationEmail || ""}
            placeholder="you@example.com"
          />
        </label>

        <button 
          type="submit" 
          style={{ 
            width: 160, 
            padding: 8, 
            border: "1px solid #ccc", 
            borderRadius: 6,
            backgroundColor: "#007ace",
            color: "white",
            cursor: "pointer"
          }}
        >
          保存
        </button>
      </Form>

      <div style={{ marginTop: 24, padding: 12, backgroundColor: "#f0f8ff", borderRadius: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>📅 自動実行スケジュール</h3>
        <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
          平日（月〜金）の設定時刻（日本時間）に自動実行されます。<br/>
          祝日は自動的にスキップされます。<br/>
          現在の設定: <strong>{String(setting.autoUpdateHour || 10).padStart(2, '0')}:00</strong>
        </p>
      </div>
    </div>
  );
}