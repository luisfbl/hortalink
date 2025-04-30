import type { Seller } from "@interfaces/Seller";
import { useStore } from "@nanostores/react";
import SelectionStore, { Selection } from "@stores/pages/SelectionStore";
import Products from "@layouts/Products";
import Product from "@components/Product";
import "@styles/layouts/products.scss"

export default function SellerProductsSection(props: { seller: Seller }) {
    const selected = useStore(SelectionStore.sectionSelection)
    const products = props.seller.products

    if(selected === Selection.Products) {
        return (    
            <section className="seller_products_section">
                <Products>
                    {
                        products.map(product => {
                            return <Product product={product} key={`seller-product-${product.id}`} />
                        })
                    }
                </Products>
            </section>
        )
    } else {
        return (
            <></>
        )
    }
}