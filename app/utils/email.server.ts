// app/utils/email.server.ts - メール送信ユーティリティ（HTTP API版）

// SendGrid HTTP APIでメール送信
async function sendViaSendGrid(to: string, subject: string, html: string, text: string) {
  const API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.NOTIFICATION_EMAIL_FROM || 't.takei@irisht.jp';
  
  if (!API_KEY) {
    throw new Error('SendGrid API Key が設定されていません');
  }
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: 'アイリスヘルスケアテクノロジー' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('SendGrid API エラー詳細:', errorBody);
    throw new Error(`SendGrid API error: ${response.status} - ${errorBody}`);
  }

  return { messageId: response.headers.get('x-message-id') || 'sendgrid-sent' };
}

// Resend APIでメール送信（シンプルで人気）
async function sendViaResend(to: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html,
      text,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return { messageId: result.id };
}

export interface PriceUpdateEmailData {
  shopDomain: string;
  updatedCount: number;
  failedCount: number;
  goldRatio?: string;
  platinumRatio?: string;
  timestamp: string;
  details?: any[];
}

// 複数メールアドレスを解析
function parseEmailAddresses(emailString: string): string[] {
  if (!emailString) return [];
  
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));
}

// 価格更新完了メールを送信（複数アドレス対応）
export async function sendPriceUpdateNotification(
  toEmails: string, 
  data: PriceUpdateEmailData
): Promise<{ success: boolean; messageId?: string; error?: string; sentCount?: number }> {
  
  if (!toEmails) {
    return { success: false, error: 'メールアドレスが設定されていません' };
  }

  const emailList = parseEmailAddresses(toEmails);
  
  if (emailList.length === 0) {
    return { success: false, error: '有効なメールアドレスが見つかりません' };
  }

  console.log(`📧 ${emailList.length}件のメールアドレスに送信: ${emailList.join(', ')}`);
  
  let successCount = 0;
  let errors: string[] = [];
  let lastMessageId = '';

  try {
    
    const subject = `[${data.shopDomain}] 価格自動更新完了 - ${data.updatedCount}件更新`;
    
    // メール本文（HTML + テキスト）
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">🔄 価格自動更新が完了しました</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 更新結果</h3>
          <ul>
            <li><strong>ショップ:</strong> ${data.shopDomain}</li>
            <li><strong>実行時刻:</strong> ${new Date(data.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</li>
            <li><strong>更新成功:</strong> ${data.updatedCount}件</li>
            <li><strong>更新失敗:</strong> ${data.failedCount}件</li>
          </ul>
        </div>

        ${data.goldRatio || data.platinumRatio ? `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>💰 価格変動情報</h3>
          <ul>
            ${data.goldRatio ? `<li><strong>🥇 金:</strong> ${data.goldRatio}</li>` : ''}
            ${data.platinumRatio ? `<li><strong>🥈 プラチナ:</strong> ${data.platinumRatio}</li>` : ''}
          </ul>
        </div>` : ''}

        ${data.failedCount > 0 ? `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c62828;">⚠️ 注意事項</h3>
          <p>${data.failedCount}件の商品で価格更新に失敗しました。管理画面でログを確認してください。</p>
        </div>` : ''}

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
- 実行時刻: ${new Date(data.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
- 更新成功: ${data.updatedCount}件
- 更新失敗: ${data.failedCount}件

${data.goldRatio ? `🥇 金: ${data.goldRatio}\n` : ''}${data.platinumRatio ? `🥈 プラチナ: ${data.platinumRatio}\n` : ''}
${data.failedCount > 0 ? `\n⚠️ ${data.failedCount}件の商品で更新に失敗しました。管理画面でログを確認してください。\n` : ''}
詳細な結果は管理画面の「ログ」ページでご確認ください。
    `;

    // メール送信（優先順位: SendGrid > Resend > コンソール出力）
    let result;
    
    // 各メールアドレスに順次送信
    for (const email of emailList) {
      try {
        let result;
        
        // SendGridを優先使用
        try {
          result = await sendViaSendGrid(email, subject, htmlContent, textContent);
          console.log(`✅ SendGrid経由でメール送信成功: ${email}`);
        } catch (error) {
          console.log(`⚠️ SendGrid送信失敗 (${email}), Resendを試行:`, (error as Error).message);
          
          if (process.env.RESEND_API_KEY) {
            result = await sendViaResend(email, subject, htmlContent, textContent);
          } else {
            // フォールバック（コンソール出力のみ）
            console.log(`📧 [フォールバックモード] メール通知: ${email}`);
            console.log(`件名: ${subject}`);
            result = { messageId: 'console-fallback' };
          }
        }
        
        successCount++;
        lastMessageId = result.messageId;
        
        // SendGrid API制限対策（1秒間隔）
        if (emailList.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (emailError) {
        const errorMsg = `${email}: ${(emailError as Error).message}`;
        console.error(`📧 メール送信エラー: ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const allSuccess = successCount === emailList.length;
    const result = {
      success: allSuccess,
      messageId: lastMessageId,
      sentCount: successCount,
      ...(errors.length > 0 && { error: `一部送信失敗: ${errors.join(', ')}` })
    };
    
    console.log(`📧 メール送信完了: ${successCount}/${emailList.length}件成功`);
    
    return result;

  } catch (error) {
    console.error('📧 メール送信エラー:', error);
    return { 
      success: false, 
      error: `メール送信に失敗しました: ${(error as Error).message}` 
    };
  }
}

// 手動テスト用のメール送信
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!toEmail) {
    return { success: false, error: 'メールアドレスが設定されていません' };
  }

  const testData: PriceUpdateEmailData = {
    shopDomain: 'test-shop.myshopify.com',
    updatedCount: 3,
    failedCount: 0,
    goldRatio: '+0.50%',
    platinumRatio: '-0.25%',
    timestamp: new Date().toISOString(),
  };

  return await sendPriceUpdateNotification(toEmail, testData);
}