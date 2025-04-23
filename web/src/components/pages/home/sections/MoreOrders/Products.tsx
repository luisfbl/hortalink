import type { Product as ProductT } from "@interfaces/Product";
import { useEffect, useState } from "react";

import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import Geolocation from "@stores/Geolocation";

import PaginatedProducts from "@components/PaginatedProducts";

export default function MoreOrderProducts() {
    const api = new APIWrapper(RequestAPIFrom.Client)
    const [products, setProducts] = useState<ProductT[]>([])
    const [page, setPage] = useState<number>(1)

    // Usar esta função para garantir o contexto 'this' correto
    const fetchMoreProducts = async (page: number) => {
        return await api.getMoreOrderProducts(page)
    }

    useEffect(() => {
        async function run() {
            const data = await api.getMoreOrderProducts(page)
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