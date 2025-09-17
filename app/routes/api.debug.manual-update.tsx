import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "testManualUpdate") {
    const productId = formData.get("productId");
    const adjustmentRatio = parseFloat(formData.get("adjustmentRatio") || "0.05");
    
    console.log("🧪 Debug manual update test:", { productId, adjustmentRatio });
    
    try {
      // 商品情報を取得
      const productResponse = await admin.graphql(
        `#graphql
          query getProduct($id: ID!) {
            product(id: $id) {
              id
              title
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price
                  }
                }
              }
            }
          }`,
        { variables: { id: productId } }
      );

      const productData = await productResponse.json();
      const product = productData.data?.product;
      
      if (!product) {
        return json({ error: "Product not found" });
      }
      
      const variant = product.variants.edges[0]?.node;
      if (!variant) {
        return json({ error: "No variants found" });
      }
      
      const currentPrice = parseFloat(variant.price);
      const newPrice = Math.round(currentPrice * (1 + adjustmentRatio));
      
      console.log("🎯 Test update:", { currentPrice, newPrice });
      
      // 実際の価格更新
      const updateResponse = await admin.graphql(
        `#graphql
          mutation productVariantUpdate($input: ProductVariantInput!) {
            productVariantUpdate(input: $input) {
              productVariant {
                id
                price
              }
              userErrors {
                field
                message
              }
            }
          }`,
        {
          variables: {
            input: {
              id: variant.id,
              price: newPrice.toString()
            }
          }
        }
      );

      const updateData = await updateResponse.json();
      
      return json({
        success: true,
        product: product.title,
        variant: variant.title,
        originalPrice: currentPrice,
        newPrice,
        adjustmentRatio,
        graphqlResponse: updateData
      });
      
    } catch (error) {
      console.error("❌ Debug test failed:", error);
      return json({ error: error.message });
    }
  }
  
  return json({ error: "Invalid action" });
};