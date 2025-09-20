export default function PrivacyPolicy() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>プライバシーポリシー - 金価格自動更新アプリ</title>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
              background-color: #f9f9f9;
            }
            
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            h1 {
              color: #2c3e50;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
              font-size: 28px;
            }
            
            h2 {
              color: #34495e;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 20px;
            }
            
            h3 {
              color: #7f8c8d;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            
            ul {
              padding-left: 20px;
            }
            
            li {
              margin-bottom: 8px;
            }
            
            .contact-info {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              border-left: 4px solid #3498db;
            }
            
            .effective-date {
              text-align: right;
              color: #666;
              font-size: 14px;
              margin-bottom: 30px;
            }
            
            .company-name {
              font-weight: bold;
              color: #2980b9;
            }
            
            .app-name {
              font-weight: bold;
              color: #e74c3c;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <h1>プライバシーポリシー</h1>
          <div className="effective-date">施行日：2025年9月20日</div>
          
          <p>
            <span className="company-name">アイリスヘルスケアテクノロジー株式会社</span>
            （以下「当社」といいます。）は、当社が提供するShopifyアプリ
            <span className="app-name">「金価格自動更新アプリ」</span>
            （以下「本アプリ」）における、個人情報を含む利用者情報（以下「ユーザー情報」）の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
          </p>

          <h2>1. 適用範囲</h2>
          <p>本ポリシーは、マーチャント（Shopifyストア運営者）および本アプリを通じて取得・生成されるユーザー情報の取扱いに適用されます。Shopifyプラットフォーム自体のデータ処理は、Shopify社のポリシーに従います。</p>

          <h2>2. 取得する情報</h2>
          <p>当社は、必要最小限の範囲で以下の情報を取得する場合があります。</p>
          <ul>
            <li><strong>ストア情報：</strong>ショップドメイン、ショップ名、ストア設定（本アプリの機能設定・通知先メール等）</li>
            <li><strong>商品・バリアント情報：</strong>商品／バリアントID、タイトル、価格、SKU、在庫数、コレクションなど</li>
            <li><strong>操作ログ：</strong>価格更新の実行結果・実行時刻、エラーログ、システム健全性に関する技術情報（IP、User-Agent、リクエスト識別子等）</li>
            <li><strong>連絡先：</strong>サポート対応や通知機能のために、管理者のメールアドレス等を任意に登録いただく場合があります</li>
          </ul>
          <p><strong>重要：</strong>本アプリは保護された顧客データ（Customer PII）にはアクセスしません。顧客氏名、住所、決済情報等は取得しません。</p>

          <h2>3. 取得方法</h2>
          <ul>
            <li>Shopify OAuthを通じて、マーチャントの承諾に基づき必要最小限のAPIスコープでデータにアクセスします（例：read_products / write_products）。</li>
            <li>マーチャントが本アプリの管理画面で入力・保存した情報（通知用メール等）を取得します。</li>
            <li>金相場等の外部公開情報は、個人を特定しない外部データソースから取得します。</li>
          </ul>

          <h2>4. 利用目的</h2>
          <p>当社は取得した情報を以下の目的で利用します。</p>
          <ul>
            <li>金・プラチナ等の相場変動に連動した商品価格の自動／手動更新の実行</li>
            <li>アプリの提供、維持、改善、障害対応、セキュリティ対策</li>
            <li>マーチャントへの通知（更新結果のサマリー、障害・メンテナンス情報等）</li>
            <li>法令遵守、利用規約違反対応、紛争対応</li>
          </ul>

          <h2>5. 第三者提供・委託</h2>
          <ul>
            <li>法令に基づく場合を除き、ユーザー情報を第三者に販売・共有しません。</li>
            <li>サーバー、データベース、メール配信、エラーログ収集等をクラウド事業者に委託する場合があります（例：ホスティング、データベース、メール送信基盤、監視サービス等）。委託先には適切な契約および安全管理措置を求めます。</li>
          </ul>

          <h2>6. 国外移転</h2>
          <p>インフラ提供事業者のサーバー所在地により、ユーザー情報が国外（日本以外）で保存・処理される場合があります。適用法令に従い、適切な保護措置を講じます。</p>

          <h2>7. セキュリティ</h2>
          <ul>
            <li>アクセス権限の最小化（最小権限のOAuthスコープ）</li>
            <li>通信の暗号化（HTTPS/TLS）</li>
            <li>ログの最小限収集と保護</li>
            <li>不正アクセス、情報漏えい等の予防・是正措置</li>
          </ul>

          <h2>8. 保存期間</h2>
          <ul>
            <li>アプリ提供に必要な期間、または法令で定める期間保存します。</li>
            <li>マーチャントがアプリをアンインストールした場合、設定情報等は一定期間（例：30日）以内に削除または匿名化します（請求・監査等の法令上必要な記録は除く）。</li>
          </ul>

          <h2>9. マーチャントの権利</h2>
          <ul>
            <li>保有個人データの開示・訂正・削除・利用停止等を、法令の範囲で請求できます。</li>
            <li>ご請求は「お問い合わせ」窓口までご連絡ください。ご本人または正当な代理人であることを確認の上、適切に対応します。</li>
          </ul>

          <h2>10. クッキー等について</h2>
          <ul>
            <li>本アプリの管理画面では、セッション管理やCSRF対策等、運用上必要なクッキー等を利用する場合があります。</li>
            <li>Shopifyが設定するクッキー等の取扱いは、Shopify社のポリシーに従います。</li>
          </ul>

          <h2>11. 法令遵守</h2>
          <p>当社は、個人情報の保護に関する法律（日本の個人情報保護法）その他関係法令・ガイドラインを遵守します。 EU/EEA等に所在する事業者による利用がある場合、GDPR等の適用ある法令に従い適切に取り扱います。</p>

          <h2>12. 本ポリシーの変更</h2>
          <p>本ポリシーは、法令やサービス内容の変更に応じて改定することがあります。重要な変更がある場合は、当社サイト等で告知します。</p>

          <h2>13. お問い合わせ窓口</h2>
          <div className="contact-info">
            <p>本ポリシーおよびユーザー情報の取扱いに関するご質問・ご請求は、以下までご連絡ください。</p>
            <ul>
              <li><strong>事業者名：</strong>アイリスヘルスケアテクノロジー株式会社</li>
              <li><strong>住所：</strong>〒322-0534 栃木県鹿沼市亀和田町925-20</li>
              <li><strong>担当部署：</strong>IT部</li>
              <li><strong>Eメール：</strong>t.takei@irisht.jp</li>
              <li><strong>電話番号：</strong>090-5797-9752</li>
              <li><strong>受付時間：</strong>平日10:00–17:00 JST</li>
            </ul>
          </div>

          <hr style={{marginTop: '40px', marginBottom: '20px', border: 'none', borderTop: '1px solid #eee'}} />
          <p style={{textAlign: 'center', color: '#666', fontSize: '14px'}}>
            © 2025 アイリスヘルスケアテクノロジー株式会社. All Rights Reserved.
          </p>
        </div>
      </body>
    </html>
  );
}