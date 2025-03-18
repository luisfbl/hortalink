import React, { useState, useRef, useEffect } from "react";
import type { User } from "@interfaces/User";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";

export default function SettingsForm(props: { user: User }) {
    const { user } = props;
    const [name, setName] = useState(user?.profile?.name || "");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const api = new APIWrapper(RequestAPIFrom.Client);

    useEffect(() => {
        if (user?.profile?.avatar) {
            setPreviewImage(`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${user.profile.id}/${user.profile.avatar}.png?size=128`);
        }
    }, [user]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(false);
        setErrorMessage("");

        // Validate passwords if changing
        if (newPassword) {
            if (!currentPassword) {
                setErrorMessage("Por favor, forneça sua senha atual");
                return;
            }

            if (newPassword.length < 8) {
                setErrorMessage("A nova senha deve ter pelo menos 8 caracteres");
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage("As senhas não coincidem");
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);

            if (currentPassword && newPassword) {
                formData.append("current_password", currentPassword);
                formData.append("new_password", newPassword);
            }

            if (imageFile) {
                formData.append("avatar", imageFile);
            }

            // API call would go here
            // await api.updateUserProfile(formData);

            // For now, simulate success
            setTimeout(() => {
                setSaveSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }, 500);

        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage("Erro ao atualizar perfil. Tente novamente.");
        }
    };

    return (
        <form className="settings_form" onSubmit={handleSubmit}>
            <section className="profile_section">
                <div className="profile_image" onClick={handleImageClick}>
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt="Foto de perfil"
                            width={120}
                            height={120}
                        />
                    ) : (
                        <div className="default_image">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="edit_overlay">
                        <img
                            src="/assets/pencil.svg"
                            alt="Editar"
                        />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="file_input"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                />
            </section>

            <section className="form_section">
                <h2>Informações pessoais</h2>
                <div className="input_group">
                    <label htmlFor="name">Nome</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="input_group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </section>

            <section className="form_section">
                <h2>Alterar senha</h2>
                <div className="input_group">
                    <label htmlFor="current_password">Senha atual</label>
                    <input
                        type="password"
                        id="current_password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="input_group">
                    <label htmlFor="new_password">Nova senha</label>
                    <input
                        type="password"
                        id="new_password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="input_group">
                    <label htmlFor="confirm_password">Confirmar senha</label>
                    <input
                        type="password"
                        id="confirm_password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </section>

            <section className="form_section">
                <h2>Preferências de notificação</h2>
                <div className="toggle_group">
                    <div className="toggle_label">
                        <label htmlFor="email_notifications">Notificações por email</label>
                        <p className="description">Receba atualizações sobre seus pedidos e produtos favoritos</p>
                    </div>
                    <div className="toggle_switch">
                        <input type="checkbox" id="email_notifications" defaultChecked />
                        <label htmlFor="email_notifications" className="toggle"></label>
                    </div>
                </div>

                <div className="toggle_group">
                    <div className="toggle_label">
                        <label htmlFor="push_notifications">Notificações push</label>
                        <p className="description">Receba notificações em tempo real</p>
                    </div>
                    <div className="toggle_switch">
                        <input type="checkbox" id="push_notifications" defaultChecked />
                        <label htmlFor="push_notifications" className="toggle"></label>
                    </div>
                </div>
            </section>

            <section className="form_section actions">
                {errorMessage && <p className="error_message">{errorMessage}</p>}
                {saveSuccess && <p className="success_message">Configurações salvas com sucesso!</p>}
                <button type="submit" className="save_button">Salvar alterações</button>

                <a href="/users/@me" className="cancel_button">Fechar</a>

                <button type="button" className="logout_button">
                    Sair da conta
                </button>
            </section>
        </form>
    );
}