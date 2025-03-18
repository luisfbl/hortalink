import SelectionStore, { Selection } from "@stores/pages/SelectionStore.ts";

import UserRatings from "@layouts/UserRatings";
import UserRating from "@components/UserRating";
import { useStore } from "@nanostores/react";
import type { IndividualRating } from "@interfaces/Product";

import Session from "@stores/Session";
import { useEffect, useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";

export default function UserRatingsSection() {
    const session = useStore(Session)
    const selection = useStore(SelectionStore.sectionSelection)
    const wrapper = new APIWrapper(RequestAPIFrom.Client)

    const [ratings, setRatings] = useState<IndividualRating[]>([])

    useEffect(() => {
        if(session) {
            async function run() {
                setRatings(await wrapper.getCustomerRatings(session.profile.id, 1))
            }
    
            run()
        }
    }, [])

    if(selection === Selection.Ratings) {
        return (
            <UserRatings>
                {
                    ratings.map(rating => {
                        return <UserRating rating={rating} key={`user-ratings-${rating.id}`}/>
                    })
                }
            </UserRatings>
        )
    } else {
        return <></>
    }
}