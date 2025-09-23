import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sendTestEmail } from '../utils/email.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || 't.takei@irisht.jp';
    
    console.log('=== Email Debug Test ===');
    console.log('Target email:', email);
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('NOTIFICATION_EMAIL_FROM:', process.env.NOTIFICATION_EMAIL_FROM);
    
    // テストメール送信を試行し、詳細結果を取得
    const result = await sendTestEmail(email);
    
    console.log('SendGrid test result:', result);
    
    return json({
      success: result.success,
      error: result.error,
      messageId: result.messageId,
      email,
      fromAddress: process.env.NOTIFICATION_EMAIL_FROM || 't.takei@irisht.jp',
      environment: {
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.NOTIFICATION_EMAIL_FROM,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Debug email error:', error);
    return json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};