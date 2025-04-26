export default function SelectionProducts(props: { children: JSX.Element | JSX.Element[] }) {
    return (
        <section className="selection_products">
            {props.children}
        </section>
    )
}