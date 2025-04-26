export default function ProductsColumn(props: { children: JSX.Element | JSX.Element[] }) {
    return (
        <section className="products">
            {props.children}
        </section>
    )
}