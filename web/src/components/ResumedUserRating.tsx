import type { IndividualRating } from "@interfaces/Product";
import { useEffect } from "react";

export default function ResumedUserRating(props: { rating: IndividualRating }) {
    const productData = props.rating.product;
    const totalStars = 5;
    const solidStars = props.rating.rating;
    const ratingDate = new Date(props.rating.created_at * 1000).toLocaleDateString("pt-br", { dateStyle: "short" });

    return (
        <div className="user_rating">
            <div className="content resumed_rating">
                <div className="header">
                    <div>
                        <h2>{props.rating.product.name}</h2>
                        <p>{props.rating.user.name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="stairs">
                            {
                                Array(solidStars).fill(0).map((_, i) => (
                                    <img
                                        src="/assets/star.svg"
                                        width={18}
                                        height={18}
                                        alt="Star"
                                        key={`solidstar-${i}-${props.rating.id}`}
                                    />
                                ))
                            }
                            {
                                Array(totalStars - solidStars).fill(0).map((_, i) => (
                                    <img
                                        src="/assets/star_off.svg"
                                        width={18}
                                        height={18}
                                        alt="Empty star"
                                        key={`offstar-${i}-${props.rating.id}`}
                                    />
                                ))
                            }
                        </div>
                        <p>{ratingDate}</p>
                    </div>
                </div>
                <p className="rating_text">
                    "{props.rating.content.length > 60 ? props.rating.content.slice(0, 60) + "..." : props.rating.content}"
                </p>
            </div>
        </div>
    )
}