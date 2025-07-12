import type {Session} from "@interfaces/Session.ts";

export default function ProfileCard({ profile }: Session) {
    return (
        <div className="profile_card">
            <div className="img_container">
                {profile.avatar ? (
                    <img
                        src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${profile.id}/${profile.avatar}.png?size=128`}
                        width={113}
                        height={113}
                        alt="Sua foto de perfil"
                    />
                ) : (
                    <img
                        src="/assets/default-picture.svg"
                        width={113}
                        height={113}
                        alt="Foto de perfil padrão"
                    />
                )}
            </div>
            <h2>{profile.name}</h2>
            <div className="stats">
                {
                    profile.is_seller ?
                        <div>
                            <p className="title">{profile.orders_made || 0}</p>
                            <p>Pedidos</p>
                        </div>
                        :
                        <div>
                            <p className="title">{profile.orders_received || 0}</p>
                            <p>Pedidos</p>
                        </div>
                }

                {
                    profile.is_seller ?
                        <div>
                            <p className="title">{profile.followers || 0}</p>
                            <p>Seguidores</p>
                        </div>
                            :
                        <div>
                            <p className="title">{profile.following || 0}</p>
                            <p>Seguindo</p>
                        </div>
                }
            </div>
        </div>
    )
}