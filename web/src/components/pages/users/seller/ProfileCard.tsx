import type { Seller } from "@interfaces/Seller"

export default function ProfileCard(props: { seller: Seller }) {
    const profile = props.seller.profile

    return (
        <div className="profile_card">
            <div className="img_container">
                <img
                    src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${profile.id}/${profile.avatar}.png?size=128`}
                    width={113}
                    height={113}
                    alt="Sua foto de perfil"
                />
            </div>
            <h2>{profile.name}</h2>
            <div className="stats">
                <div>
                    <p className="title">{props.seller.products?.length || 0}</p>
                    <p>Produtos</p>
                </div>
                <div>
                    <p className="title">{profile.followers || 0}</p>
                    <p>Avaliações</p>
                </div>
                <div>
                    <p className="title">{profile.orders_received || 0}</p>
                    <p>Pedidos</p>
                </div>
            </div>
        </div>
    )
}