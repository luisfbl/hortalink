import { atom } from "nanostores";

enum Selection {
    Orders = 1,
    Ratings = 2,
    Products = 3,
    Schedule = 4
}

export default {
    sectionSelection: atom<Selection>(Selection.Ratings)
}

export {
    Selection
}