import type { Product } from "@interfaces/Product";
import React, { memo } from "react";

import Image from "@components/Image";

const Star = memo(() => (
    <img
        src="/assets/star.svg"
        width={10}
        height={10}
        alt="Imagem de uma estrela"
    />
))


/*export default function Product(props: { product: Product }) {
    const productData = props.product

    return (
        <a className="product" href={`/sellers/${productData.seller_id}/products/${productData.id}`}>
            <div className="product_header">
                <h2>{productData.product.name}</h2>
                <div className="star">
                    <div className="star_content">
                        <Image
                            src="/assets/star.svg"
                            width={10}
                            height={10}
                            alt="Imagem de uma estrela"
                        />
                        <div>
                            ({productData.rating_quantity})
                        </div>
                    </div>
                </div>
            </div>
            <div className="product_image">
                {productData.photo && 
                <img 
                    src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${productData.id}/${productData.photo.replace("/", "⁄")}.jpg?size=256`}
                    width={109}
                    height={106}
                    alt={`Foto do produto "${productData.product.name}"`}
                />
                }
            </div>
            <div className="product_footer">
                <div className="distance">
                    <Image
                        src="/assets/location.svg"
                        alt="ícone de GPS, ao lado está sua distância para o produto."
                        width={10}
                        height={10}
                    />
                    <p>0,6km</p>
                </div>
                <p className="price"><span>R$ {productData.price}</span>/<span className="label">{productData.unit_quantity}{productData.unit}</span></p>
            </div>
        </a>
    )
}*/

export default function ProductColumn(props: { product: Product }) {
    const productData = props.product

    return (
        <a className="product" href={`/sellers/products/${productData.id}`}>
            { productData.photo &&
                <img 
                    src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${productData.id}/${productData.photo.replace("/", "⁄")}.jpg?size=256`}
                    width={98}
                    height={98}
                    alt={`Foto do produto "${productData.product.name}"`}
                />
            }
            <div className="product_data">
                <h2>{productData.product.name}</h2>
                <p>Distância: 0.00km</p>
                <p>Valor por un: {productData.price}</p>
                <div className="star">
                    <Image
                        src="/assets/star.svg"
                        width={15}
                        height={15}
                        alt="Imagem de uma estrela"
                    />
                    <div>
                        ({productData.rating_quantity})
                    </div>
                </div>
                <p className="price">R$ {productData.price}</p>
            </div>
            <div className="seller_name">
                <p>Vendido por: <span className="name">{productData.seller_id}</span></p>
            </div>
        </a>
    )
}