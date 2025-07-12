const { request, gql } = require("graphql-request");
const BASE = "https://api.spocket.co/graphql";

async function fetchProducts(config) {
  const { token } = config;
  const query = gql`
    query ($after: String) {
      products(first: 50, after: $after) {
        edges {
          node {
            id
            title
            description
            pricing { price }
            inventory { total }
            images { url }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
  let all = [];
  let after = null;
  do {
    const resp = await request(
      BASE,
      query,
      { after },
      { Authorization: `Bearer ${token}` }
    );
    const edges = resp.products.edges;
    edges.forEach(e => {
      all.push({
        id: e.node.id,
        title: e.node.title,
        description: e.node.description,
        price: e.node.pricing.price,
        stock: e.node.inventory.total,
        imageUrl: e.node.images[0]?.url || ""
      });
    });
    after = resp.products.pageInfo.hasNextPage ? resp.products.pageInfo.endCursor : null;
  } while (after);
  return all;
}

module.exports = { fetchProducts };
