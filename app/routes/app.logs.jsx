// app/routes/app.logs.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const logs = await prisma.priceUpdateLog.findMany({
    where: { shopDomain: shop },
    orderBy: { executedAt: "desc" },
    take: 50,
  });

  return json({ logs });
}

export default function Logs() {
  const { logs } = useLoaderData();
  
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>自動価格調整ログ</h1>
      
      {logs.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
          まだ実行ログがありません
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#f7f7f7" }}>
                <th style={th}>実行日時</th>
                <th style={th}>種類</th>
                <th style={th}>状態</th>
                <th style={th}>金価格変動率</th>
                <th style={th}>下限%</th>
                <th style={th}>対象商品</th>
                <th style={th}>更新成功</th>
                <th style={th}>更新失敗</th>
                <th style={th}>エラー</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={td}>
                    {new Date(log.executedAt).toLocaleString("ja-JP")}
                  </td>
                  <td style={td}>
                    <span style={{ 
                      padding: "2px 6px", 
                      borderRadius: 4, 
                      fontSize: 12,
                      backgroundColor: log.executionType === "auto" ? "#e6f3ff" : "#fff3e6",
                      color: log.executionType === "auto" ? "#0066cc" : "#cc6600"
                    }}>
                      {log.executionType === "auto" ? "自動" : "手動"}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                      backgroundColor: log.success ? "#e6ffe6" : "#ffe6e6",
                      color: log.success ? "#006600" : "#cc0000"
                    }}>
                      {log.success ? "成功" : "失敗"}
                    </span>
                  </td>
                  <td style={td}>
                    {log.goldRatio !== null && log.goldRatio !== undefined 
                      ? `${(log.goldRatio * 100).toFixed(2)}%` 
                      : "-"}
                  </td>
                  <td style={td}>{log.minPricePct}%</td>
                  <td style={td}>{log.totalProducts || 0}</td>
                  <td style={td}>{log.updatedCount || 0}</td>
                  <td style={td}>{log.failedCount || 0}</td>
                  <td style={td}>
                    {log.errorMessage ? (
                      <span style={{ color: "#cc0000", fontSize: 12 }}>
                        {log.errorMessage.length > 50 
                          ? log.errorMessage.substring(0, 50) + "..." 
                          : log.errorMessage}
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>📊 ログの見方</h3>
        <ul style={{ margin: "8px 0 0 20px", fontSize: 14, color: "#666" }}>
          <li><strong>自動</strong>: スケジュールによる自動実行</li>
          <li><strong>手動</strong>: UIからの手動実行</li>
          <li><strong>金価格変動率</strong>: 田中貴金属から取得した前日比</li>
          <li><strong>下限%</strong>: 価格下落時の最低価格率</li>
        </ul>
      </div>
    </div>
  );
}

const th = { 
  border: "1px solid #ddd", 
  padding: "8px", 
  textAlign: "left", 
  fontWeight: 600,
  fontSize: 14,
  backgroundColor: "#f7f7f7"
};

const td = { 
  border: "1px solid #eee", 
  padding: "8px",
  fontSize: 14
};