export default function Products(props: { children: JSX.Element | JSX.Element[] }) {
    return (
        <section className="products">
            {props.children}
        </section>
    )
}