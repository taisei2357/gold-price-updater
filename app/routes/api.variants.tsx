import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const ids = url.searchParams.get("ids")?.split(",") || [];
  
  if (ids.length === 0) {
    return json({ variants: [] }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  }
  
  try {
    const queries = ids.map(id => 
      admin.graphql(`
        query getVariant($id: ID!) {
          productVariant(id: $id) {
            id
            price
            product {
              id
              title
            }
          }
        }
      `, { variables: { id } })
    );
    
    const results = await Promise.all(queries);
    const variants = [];
    
    for (const response of results) {
      const data = await response.json();
      if (data.data?.productVariant) {
        variants.push({
          id: data.data.productVariant.id,
          price: parseFloat(data.data.productVariant.price),
          productId: data.data.productVariant.product.id,
          productTitle: data.data.productVariant.product.title
        });
      }
    }
    
    return json({ variants }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
    
  } catch (error) {
    console.error("Error fetching variants:", error);
    return json({ error: error.message }, {
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  }
}