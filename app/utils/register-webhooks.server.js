const API_VERSION = "2025-01";

/**
 * Shopify Admin GraphQL APIを呼び出すヘルパー関数
 */
async function callAdminGraphQL(shop, accessToken, query, variables) {
  const response = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return await response.json();
}

/**
 * 必須のWebhookを登録する
 * @param {string} shop - ショップドメイン
 * @param {string} accessToken - アクセストークン
 * @param {string} appUrl - アプリのベースURL
 */
export async function registerMandatoryWebhooks(shop, accessToken, appUrl) {
  const endpoint = `${appUrl.replace(/\/$/, "")}/webhooks/app/uninstalled`;
  
  const mutation = `
    mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
      webhookSubscriptionCreate(
        topic: $topic,
        webhookSubscription: { 
          format: JSON, 
          endpoint: { callbackUrl: $callbackUrl } 
        }
      ) {
        webhookSubscription { 
          id 
          topic 
          callbackUrl
        }
        userErrors { 
          field 
          message 
        }
      }
    }
  `;

  try {
    const result = await callAdminGraphQL(shop, accessToken, mutation, {
      topic: "APP_UNINSTALLED",
      callbackUrl: endpoint,
    });

    const errors = result?.data?.webhookSubscriptionCreate?.userErrors ?? [];
    if (errors.length > 0) {
      console.error("Webhook registration errors:", errors);
      return { success: false, errors };
    }

    const webhook = result?.data?.webhookSubscriptionCreate?.webhookSubscription;
    console.log(`Successfully registered APP_UNINSTALLED webhook for ${shop}:`, webhook);
    
    return { success: true, webhook };
  } catch (error) {
    console.error("Failed to register webhook:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 既存のWebhookを確認する
 * @param {string} shop - ショップドメイン
 * @param {string} accessToken - アクセストークン
 */
export async function listWebhooks(shop, accessToken) {
  const query = `
    query GetWebhooks {
      webhookSubscriptions(first: 50) {
        edges {
          node {
            id
            topic
            callbackUrl
            format
          }
        }
      }
    }
  `;

  try {
    const result = await callAdminGraphQL(shop, accessToken, query, {});
    const webhooks = result?.data?.webhookSubscriptions?.edges?.map(edge => edge.node) ?? [];
    return { success: true, webhooks };
  } catch (error) {
    console.error("Failed to list webhooks:", error);
    return { success: false, error: error.message };
  }
}