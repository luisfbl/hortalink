import type { Product as ProductT } from "@interfaces/Product";
import Products from "@layouts/Products";
import { useEffect, useState } from "react";

import Product from "@components/Product";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import Geolocation from "@stores/Geolocation";

import PaginatedProducts from "@components/PaginatedProducts";

export default function RecentProducts() {
    const api = new APIWrapper(RequestAPIFrom.Client)
    const [products, setProducts] = useState<ProductT[]>([])
    const [page, setPage] = useState<number>(1)

    // Função de busca para passar corretamente o contexto 'this'
    const fetchMoreProducts = async (page: number) => {
        return await api.getRecentProducts(page)
    }

    useEffect(() => {
        async function run() {
            const data = await api.getRecentProducts(page)
            setProducts(data)
        }
        
        run()
    }, [])

    return (
        <PaginatedProducts
            products={products}
            setter={setProducts}
            FetchMore={fetchMoreProducts}
            slideSize={3}
        />
    )
}