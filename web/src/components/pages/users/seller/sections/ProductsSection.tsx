import type { Seller } from "@interfaces/Seller";
import { useStore } from "@nanostores/react";
import SelectionStore, { Selection } from "@stores/pages/SelectionStore";
import Products from "@layouts/Products";
import Product from "@components/Product";
import EmptyState from "@components/common/EmptyState";
import "@styles/layouts/products.scss"

export default function SellerProductsSection(props: { seller: Seller }) {
    const selected = useStore(SelectionStore.sectionSelection)
    const products = props.seller.products

    if(selected === Selection.Products) {
        return (    
            <section className="seller_products_section">
                {products.length === 0 ? (
                    <EmptyState 
                        message="Este vendedor ainda não possui produtos" 
                        icon="🛍️" 
                        className="empty-products" 
                    />
                ) : (
                    <Products>
                        {
                            products.map(product => {
                                return <Product product={product} key={`seller-product-${product.id}`} />
                            })
                        }
                    </Products>
                )}
            </section>
        )
    } else {
        return (
            <></>
        )
    }
}