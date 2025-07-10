import "@styles/components/paginated_products.scss";

import type { Product } from "@interfaces/Product";
import Products from "@layouts/Products";
import ProductComponent from "@components/Product";
import React, { useState, useEffect, useRef } from "react";

import Image from "@components/Image";
import EmptyState from "@components/common/EmptyState";

export default function PaginatedProducts(props: {
    products: Product[],
    setter: React.Dispatch<React.SetStateAction<Product[]>>,
    FetchMore: (page: number) => Promise<Product[]>,
    slideSize?: number
}) {

    const original_SLIDE_SIZE = props.slideSize
    const [SLIDE_SIZE, set_SLIDE_SIZE] = useState(props.slideSize)

    const prevRef = useRef<HTMLImageElement>()
    const nextRef = useRef<HTMLImageElement>()

    const [start_pos, set_start_pos] = useState(0)
    
    let page = 1 // not state


    async function Prev() {
        if(start_pos >= 1) {
            set_start_pos(Math.max(0, start_pos - SLIDE_SIZE))
        }
    }

    async function Next() {
        const length = props.products.length - 1

        let grow = SLIDE_SIZE

        if(start_pos >= length) {
            return;
        }

        if(start_pos + grow > length) {
            page += 1
            const added = await FetchMore()

            grow = Math.min(added, SLIDE_SIZE)
        }

        if(!grow) {
            return
        }

        if(SLIDE_SIZE == 2 && length == 2) {
            grow = 1
        }

        const newValue = start_pos + grow
        set_start_pos(newValue)
    }

    useEffect(() => {
        function checkResponsitivy() {
            if(window.innerWidth <= 520 && window.innerWidth >= 330) {
                set_SLIDE_SIZE(2)
            } else if(window.innerWidth <= 330) {
                set_SLIDE_SIZE(1)
            } else if(window.innerWidth > 520) {
                set_SLIDE_SIZE(original_SLIDE_SIZE)
            }
        }

        window.addEventListener("resize", () => {
            checkResponsitivy()
        })

        checkResponsitivy()
    }, [])

    async function FetchMore() {
        const newDataFetched = await props.FetchMore(page)
    
        const currentData = [ ...props.products ] // copy
        const currentDataAsObject: Record<string, Product> = {}

        for(const data of currentData) {
            currentDataAsObject[String(data.id)] = data
        }

        let added = 0

        for(const data of newDataFetched) {
            if(!currentDataAsObject[String(data.id)]) {
                added += 1
                currentData.push(data)
            } // evita duplicatas
            // uso de objeto para acesso instantaneo e evitar pesquisas em arrays que são custosas.
        }
        
        props.setter(currentData)

        return added
    }

    if (props.products.length === 0) {
        return (
            <EmptyState 
                message="Nenhum produto encontrado" 
                icon="🛍️" 
                className="empty-products" 
            />
        );
    }

    return (
        <div className="paginated_products">
            <span style={{ transform: "rotate(180deg)" }} onClick={() => Prev()}>
                <Image
                    src="/assets/arrow.svg"
                    alt="Seta para a esquerda, para voltar os itens."
                    width={11}
                    height={26}
                />
            </span>
            <Products>
                {
                    props.products.slice(start_pos, start_pos + SLIDE_SIZE).map((product, i) => (
                        <ProductComponent product={product} key={`paginated-${product.id}`} />
                    ))
                }
            </Products>
            <span onClick={() => Next()}>
                <Image
                    src="/assets/arrow.svg"
                    alt="Seta para a esquerda, para voltar os itens."
                    width={11}
                    height={26}
                />
            </span>
        </div>
    )
}