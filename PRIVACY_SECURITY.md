# プライバシー・セキュリティ対応

## 🔒 本番環境でのデータ管理

### **1. データベースアクセス制限**
```bash
# ❌ 危険：開発環境のみ
npx prisma studio  # 全ショップデータが見える

# ✅ 本番：アクセス制限
# - VPN経由のみアクセス可能
# - 特定IPからのみアクセス許可
# - 管理者認証必須
```

### **2. ショップ別データ分離**

#### **現在の実装（既に対応済み）**
```javascript
// 各ショップは自分のデータのみアクセス可能
const { session } = await authenticate.admin(request);
const shop = session.shop; // "customer-a.myshopify.com"

// ショップ別にデータを分離
await prisma.selectedProduct.findMany({
  where: { shopDomain: shop } // 自分のショップのみ
});

await prisma.shopSetting.findUnique({
  where: { shopDomain: shop } // 自分の設定のみ
});
```

### **3. ログ・トラブル対応の正しい方法**

#### **A. ショップ別ログ表示（既に実装済み）**
```
https://your-app.com/app/logs
↓
各ショップは自分のログのみ表示
- Customer A: 自分の実行履歴のみ
- Customer B: 自分の実行履歴のみ
```

#### **B. 管理者向けダッシュボード（要実装）**
```javascript
// app/routes/admin.dashboard.jsx
export async function loader({ request }) {
  // 管理者認証チェック
  if (!isAdmin(request)) throw new Response("Unauthorized", { status: 401 });
  
  // 集計データのみ表示（個人情報除外）
  const stats = await prisma.priceUpdateLog.groupBy({
    by: ['shopDomain'],
    _count: { id: true },
    _avg: { updatedCount: true }
  });
  
  return json({
    totalShops: stats.length,
    avgUpdates: stats._avg.updatedCount,
    // 個別ショップ名は非表示
    errorRate: calculateErrorRate(stats)
  });
}
```

#### **C. トラブル対応フロー**
```
1. ショップから問い合わせ
   ↓
2. ショップIDで該当ログを検索
   ↓
3. 管理者権限でそのショップのログのみ確認
   ↓
4. 問題解決・サポート提供
```

### **4. データ保護対策**

#### **個人情報の暗号化**
```javascript
// 機密データの暗号化
const encryptedEmail = encrypt(notificationEmail);
await prisma.shopSetting.create({
  data: {
    shopDomain,
    notificationEmail: encryptedEmail // 暗号化して保存
  }
});
```

#### **ログローテーション**
```javascript
// 古いログの自動削除（3ヶ月経過後）
await prisma.priceUpdateLog.deleteMany({
  where: {
    executedAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90日前
    }
  }
});
```

#### **アクセスログ記録**
```javascript
// 管理者アクセスを記録
await prisma.adminLog.create({
  data: {
    adminId: "admin@yourcompany.com",
    action: "view_shop_logs",
    shopDomain: targetShop,
    timestamp: new Date(),
    ipAddress: request.headers.get("x-forwarded-for")
  }
});
```

### **5. GDPR/プライバシー法対応**

#### **データ削除要求**
```javascript
// app/routes/api.gdpr.delete.tsx
export async function action({ request }) {
  const { shopDomain } = await request.json();
  
  // ショップのデータを完全削除
  await prisma.$transaction([
    prisma.selectedProduct.deleteMany({ where: { shopDomain } }),
    prisma.shopSetting.deleteMany({ where: { shopDomain } }),
    prisma.priceUpdateLog.deleteMany({ where: { shopDomain } }),
    prisma.session.deleteMany({ where: { shop: shopDomain } })
  ]);
  
  return json({ success: true, message: "データを完全削除しました" });
}
```

#### **データエクスポート**
```javascript
// ショップが自分のデータをダウンロード可能
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  
  const allData = {
    settings: await prisma.shopSetting.findMany({ where: { shopDomain: session.shop } }),
    products: await prisma.selectedProduct.findMany({ where: { shopDomain: session.shop } }),
    logs: await prisma.priceUpdateLog.findMany({ where: { shopDomain: session.shop } })
  };
  
  return new Response(JSON.stringify(allData), {
    headers: { "Content-Type": "application/json" }
  });
}
```

## 🛡️ セキュリティチェックリスト

- ✅ ショップ別データ分離（実装済み）
- ✅ セッション認証（実装済み）
- ⚠️ 管理者ダッシュボード（要実装）
- ⚠️ データ暗号化（要実装）  
- ⚠️ ログローテーション（要実装）
- ⚠️ GDPR対応API（要実装）

## 📞 正しいサポートフロー

```
Customer A に問題発生
↓
Customer A が /app/logs で自分のログ確認
↓
Customer A からサポートチケット
↓
サポート担当が Customer A のログのみ確認
↓
Customer A の許可の下で問題解決
```

**重要**: 他のお客さんのデータは絶対に見ない・見せない！