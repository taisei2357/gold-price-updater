# 管理者アクセス戦略

## 🎯 推奨：3段階アプローチ

### **段階1：最小限アクセス（現在推奨）**
```javascript
// 匿名化された集計データのみ表示
{
  "totalShops": 150,
  "todayExecutions": 89,
  "errorRate": "2.3%",
  "avgProductsUpdated": 28,
  "systemHealth": "良好"
}

// ショップ名、商品名、価格は一切見えない
```

### **段階2：お客さん許可制**
```javascript
// お客さんの明示的同意がある場合のみアクセス
if (customer.agreedToSupportAccess && supportTicketId) {
  // 期間限定でそのお客さんのデータのみアクセス可能
  const logs = await getCustomerLogs(shopDomain, { 
    timeLimit: "24hours",
    purpose: "support",
    ticketId: supportTicketId 
  });
}
```

### **段階3：フルアクセス（慎重検討要）**
```javascript
// 完全なダッシュボード
// ただし厳重なセキュリティ対策が前提
```

## 🛡️ 段階1：安全な管理ダッシュボード実装

### **app/routes/admin.dashboard.jsx**
```javascript
export async function loader({ request }) {
  // 管理者認証（あなたのみアクセス可能）
  const adminKey = request.headers.get("Admin-Key");
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // 匿名化された統計のみ
  const stats = await prisma.$queryRaw`
    SELECT 
      COUNT(DISTINCT shop_domain) as total_shops,
      COUNT(*) as total_executions,
      AVG(updated_count) as avg_updates,
      SUM(CASE WHEN success = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
    FROM PriceUpdateLog 
    WHERE executed_at >= datetime('now', '-7 days')
  `;

  const recentErrors = await prisma.priceUpdateLog.findMany({
    where: { 
      success: false,
      executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    select: {
      // ショップ名は匿名化
      shopDomain: false,
      errorMessage: true,
      executedAt: true,
      id: true
    },
    take: 5
  });

  return json({
    stats: stats[0],
    recentErrors: recentErrors.map(err => ({
      ...err,
      shopDomain: `Shop-${err.id.slice(-4)}` // 匿名化
    })),
    systemStatus: "operational"
  });
}
```

### **UI表示例**
```
📊 Gold Price Auto - 管理ダッシュボード

🏪 アクティブショップ: 47店舗
📈 今日の実行: 23回
✅ 成功率: 98.2%
⚠️ 最近のエラー:
  - Shop-A123: 金価格取得失敗 (12:34)
  - Shop-B456: セッション期限切れ (11:22)

💡 個別ショップ情報は表示されません
```

## 🔐 段階2：許可制アクセス

### **お客さん側：サポート許可設定**
```javascript
// app/routes/app.support.jsx
export default function SupportSettings() {
  return (
    <Card>
      <h2>サポートアクセス設定</h2>
      <Checkbox 
        checked={allowSupportAccess}
        onChange={handleToggle}
        label="トラブル時にサポートチームがログ確認することを許可"
      />
      <Text subdued>
        許可した場合、サポートチケット作成時のみ、
        24時間限定でログアクセスが可能になります。
      </Text>
    </Card>
  );
}
```

### **管理者側：許可確認機能**
```javascript
// サポートチケット作成時のみアクセス可能
export async function getSupportData(shopDomain, ticketId) {
  const permission = await prisma.shopSetting.findUnique({
    where: { shopDomain },
    select: { allowSupportAccess: true }
  });

  if (!permission.allowSupportAccess) {
    throw new Error("お客さんの許可が必要です");
  }

  // 24時間限定アクセス
  const logs = await prisma.priceUpdateLog.findMany({
    where: { 
      shopDomain,
      executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  });

  // アクセスログを記録
  await prisma.adminAccessLog.create({
    data: {
      adminId: "takeshi@company.com",
      shopDomain,
      ticketId,
      accessedAt: new Date(),
      purpose: "customer_support"
    }
  });

  return logs;
}
```

## 📋 推奨実装順序

### **1. まず段階1を実装**
- [ ] 匿名化統計ダッシュボード
- [ ] システムヘルス監視
- [ ] エラー傾向分析

### **2. 必要に応じて段階2**
- [ ] お客さん許可システム
- [ ] 期間限定アクセス
- [ ] アクセスログ記録

### **3. 法的準備**
- [ ] プライバシーポリシー更新
- [ ] 利用規約に明記
- [ ] データ保護方針策定

## 🎯 結論：推奨アプローチ

**現時点では段階1がベスト**：
- トラブル対応可能
- プライバシー保護
- 法的リスク最小

**段階2は事業拡大時に検討**：
- お客さん数が多くなった時
- サポート工数が問題になった時

---

**重要**: どの段階でも、お客さんに透明性を保つことが信頼の鍵 🔑