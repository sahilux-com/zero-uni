import ProductPage, { type Size } from "@/components/product-page";
import stock from "@/data/sizes.json";

// The stock list is read at build time, so every size button is in the first HTML
// with its final state. Nothing arrives later to move the size grid.
export default function Home() {
  const sizes: Size[] = [...stock]
    .sort((a, b) => a.display_order - b.display_order)
    .map((row) => ({
      sku: row.sku,
      men: String(row.size_us_men),
      women: String(row.size_us_women),
      status: row.in_stock ? (row.stock_status as Size["status"]) : "sold_out",
    }));

  const first = stock[0];

  return (
    <ProductPage
      name={first.product_name}
      colorway={first.colorway}
      price={first.price}
      sizes={sizes}
    />
  );
}
