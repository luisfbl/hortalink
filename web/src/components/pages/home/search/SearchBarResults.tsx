import { useEffect, useState } from "react";
import { filter, product_names, products_result, query, Screen, screen } from "./Search";
import { useStore } from "@nanostores/react";
import EmptyState from "@components/common/EmptyState";

export default function SearchBarResults() {
    const results = useStore(product_names)
    const [isOnSelect, setIsOnSelect] = useState<boolean>(false)

    function updateFilter(product_type: number) {
        const currentValue = filter.get() || { page: 1, per_page: 10 }
        const newValue = { ...currentValue, product_id: product_type }

        filter.set(newValue)
        screen.set(Screen.Results)
        setIsOnSelect(true)
    }

    function updateUsersQuery(usersquery: string) {
        query.set(usersquery)
        screen.set(Screen.Results)
        setIsOnSelect(true)
    }

    function removeProductId() {
        const currentValue = filter.get() || { page: 1, per_page: 10 }
        delete currentValue.product_id

        filter.set(currentValue)
    }

    useEffect(() => {
        const input = document.querySelector<HTMLInputElement>("#global__search")

        input.addEventListener("focus", () => {
            setIsOnSelect(false)
        })

        document.addEventListener("focusin", () => {
            if(!document.activeElement.classList.contains("results_option") && document.activeElement.id !== "global__search") {
                setIsOnSelect(true)
            }
        })

        product_names.listen((v) => {
            setIsOnSelect(false)

            if(!v?.length) {
                removeProductId()
            }
        }) // only SearchBar.astro will change this store, so, if it is changed, we can assume that a new search was made

        window.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase()

            if(key === "enter") {
                if (document.activeElement.classList.contains("results_option")) {
                    const element = document.activeElement as HTMLDivElement
                    updateFilter(Number(element.dataset.value as any))
                }
            }
        })
    }, [])

    return (
        <div className="results_selector" role="listbox" aria-expanded={true}>
            {
                !isOnSelect && results.map((result) => (
                    <div className="results_option" key={`search-result-${result.product_id}`} onClick={() => { result.onlySeller ? updateUsersQuery(result.product_name) : updateFilter(result.product_id) }} role="option" data-value={result.product_id} tabIndex={0}>
                        {result.product_name}
                        <br />
                        <span style={{ fontSize: "0.9em", color: "#AFAFAF" }}>{result.onlySeller ? 'Pesquisar em usuários' : 'Pesquisar em produtos'}</span>
                    </div>
                ))
            }
        </div>
    )
}