import SelectionStore, { Selection } from "@stores/pages/SelectionStore";

import UserRatings from "@layouts/UserRatings";
import { useStore } from "@nanostores/react";
import type { IndividualRating } from "@interfaces/Product";
import ResumedUserRating from "@components/ResumedUserRating";
import EmptyState from "@components/common/EmptyState";

export default function SellerRatingsSection(props: { ratings: IndividualRating[] }) {
    const selection = useStore(SelectionStore.sectionSelection)
    const { ratings } = props

    if(selection === Selection.Ratings) {
        return (
            <UserRatings>
                {ratings.length === 0 ? (
                    <EmptyState 
                        message="Este vendedor ainda não possui avaliações" 
                        icon="⭐" 
                        className="empty-ratings" 
                    />
                ) : (
                    ratings.map(rating => {
                        return <ResumedUserRating rating={rating} key={`seller-ratings-${rating.id}`} />
                    })
                )}
            </UserRatings>
        )
    }

    return <></>
}