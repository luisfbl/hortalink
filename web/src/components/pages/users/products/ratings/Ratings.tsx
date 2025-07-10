import Stairs from "./Stairs";
import RatingsInfo from "./RatingsInfo";
import type { FullRating } from "@interfaces/Product";
import EmptyState from "@components/common/EmptyState";

export default function Ratings(props: { ratings: FullRating }) {
    const ratings = props.ratings

    return (
        <>
            <header>
                <h1>Avaliações</h1>
                <RatingsInfo {...props}></RatingsInfo>
            </header>
            <div className="line" />
            <section className="ratings">
                {
                    ratings && ratings?.ratings?.length === 0 ? (
                        <EmptyState 
                            message="Este produto ainda não possui avaliações" 
                            icon="⭐" 
                            className="empty-ratings" 
                        />
                    ) : (
                        ratings?.ratings?.map((rating, i) => (
                            <div className="rating" key={i}>
                                <div className="rating_title">
                                    <div>
                                        <h2>{rating.user.name}</h2>
                                        <p>{new Date(Date.now() - rating.created_at).toLocaleDateString("pt-br", { dateStyle: "short" })}</p>
                                    </div>                            
                                    <div className="stairs">
                                        <div className="content">
                                            <Stairs
                                                stars={rating.rating}
                                                star_src={"/assets/star.svg"}
                                                staroff_src={"/assets/star_off.svg"}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="rating_content">
                                    <p>{rating.content}</p>
                                </div>
                            </div>
                        ))
                    )
                }
            </section>
        </>
    )
}