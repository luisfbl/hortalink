import type { Product } from "@interfaces/Product";
import Image from "@components/Image";
import formatDistance from "@utils/formatDistance.ts";

function ItemDist(props: { dist: number }) {
    return <>{props.dist ? formatDistance(props.dist): "N/A"}</>
}

export default function Product(props: { product: Product }) {
    const productData = props.product

    return (
        <a className="product" href={`/sellers/${productData.seller_id}/products/${productData.id}`}>
            <div className="product_header">
                <h2>{productData.product.name}</h2>
                <div className="star">
                    <div className="star_content">
                        <img
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
                    <p>
                        <ItemDist dist={productData.dist}/>
                    </p>
                </div>
                <p className="price"><span>R$ {productData.price}</span>/<span className="label">{productData.unit_quantity}{productData.unit}</span></p>
            </div>
        </a>
    )
}