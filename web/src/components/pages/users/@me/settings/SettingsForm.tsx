import React, { useState, useRef, useEffect } from "react";
import type { User } from "@interfaces/User";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";

export default function SettingsForm(props: { user: User }) {
    const { user } = props;
    const [name, setName] = useState(user?.profile?.name || "");
    const [email, setEmail] = useState(user?.profile?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [emailNotifications, setEmailNotifications] = useState(user?.profile?.email_notifications ?? true);
    const [imageError, setImageError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

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

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewImage(null);
        setImageError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const resizeImage = (file: File, maxSize: number = 400): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                // Set canvas size to square
                canvas.width = maxSize;
                canvas.height = maxSize;
                
                // Fill with white background
                ctx!.fillStyle = '#ffffff';
                ctx!.fillRect(0, 0, maxSize, maxSize);
                
                // Center the image
                const x = (maxSize - width) / 2;
                const y = (maxSize - height) / 2;
                
                ctx!.drawImage(img, x, y, width, height);
                
                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob!], file.name, {
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    resolve(resizedFile);
                }, 'image/png', 0.9);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError("");
        
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
                setImageError("Por favor, selecione uma imagem JPEG ou PNG");
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setImageError("A imagem deve ter no máximo 5MB");
                return;
            }
            
            try {
                // Resize image
                const resizedFile = await resizeImage(file, 400);
                setImageFile(resizedFile);
                
                // Create preview
                const reader = new FileReader();
                reader.onload = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(resizedFile);
            } catch (error) {
                setImageError("Erro ao processar a imagem");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(false);
        setErrorMessage("");

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
                formData.append("image", imageFile);
            }

            formData.append("email_notifications", emailNotifications.toString());

            await api.updateUserProfile(formData);
            setSaveSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setImageError("");
            
            // Reset image file but keep preview if uploaded successfully
            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage("Erro ao atualizar perfil. Tente novamente.");
        }
    };

    const handleDeleteAccount = async () => {
        if (user?.profile?.has_password) {
            if (!deletePassword) {
                setErrorMessage("Por favor, digite sua senha para confirmar a exclusão");
                return;
            }
        }

        try {
            const requestBody = user?.profile?.has_password 
                ? { password: deletePassword }
                : { oauth_confirmation: true };

            const response = await fetch(`${import.meta.env.PUBLIC_FRONTEND_API_URL}/v1/auth/account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir conta');
            }

            try {
                await fetch(`${import.meta.env.PUBLIC_FRONTEND_API_URL}/v1/auth/logout`, {
                    method: 'GET',
                    credentials: 'include'
                });
            } catch (logoutError) {
                console.error('Error during logout after account deletion:', logoutError);
            }
            window.location.href = "/";
            
        } catch (error) {
            console.error("Error deleting account:", error);
            setErrorMessage("Erro ao excluir conta. Tente novamente.");
        }

        setShowDeleteModal(false);
        setDeletePassword("");
    };

    return (
        <form className="settings_form" onSubmit={handleSubmit}>
            <section className="profile_section">
                <div className="profile_image_container">
                    <div className="profile_image" onClick={handleImageClick}>
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Foto de perfil"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                            />
                        ) : (
                            <img
                                src="/assets/default-picture.svg"
                                alt="Foto de perfil padrão"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                            />
                        )}
                        <div className="edit_overlay">
                            <img
                                src="/assets/pencil.svg"
                                alt="Editar"
                            />
                        </div>
                    </div>
                    {imageError && <p className="image_error">{imageError}</p>}
                    <p className="image_hint">Clique para alterar foto de perfil</p>
                    {(previewImage || user?.profile?.avatar) && (
                        <button 
                            type="button" 
                            className="remove_image_button"
                            onClick={handleRemoveImage}
                        >
                            Remover foto
                        </button>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="file_input"
                    accept="image/jpeg,image/jpg,image/png"
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

            {user?.profile?.has_password && (
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
            )}

            <section className="form_section">
                <h2>Preferências de notificação</h2>
                <div className="toggle_group">
                    <div className="toggle_label">
                        <label htmlFor="email_notifications">Notificações por email</label>
                        <p className="description">Receba atualizações sobre seus pedidos e produtos favoritos</p>
                    </div>
                    <div className="toggle_switch">
                        <input 
                            type="checkbox" 
                            id="email_notifications" 
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                        <label htmlFor="email_notifications" className="toggle"></label>
                    </div>
                </div>
            </section>

            <section className="form_section actions">
                {errorMessage && <p className="error_message">{errorMessage}</p>}
                {saveSuccess && <p className="success_message">Configurações salvas com sucesso!</p>}
                <button type="submit" className="save_button">Salvar alterações</button>

                <a href="/users/@me" className="cancel_button">Fechar</a>

                <button 
                    type="button" 
                    className="logout_button"
                    onClick={async () => {
                        try {
                            await fetch(`${import.meta.env.PUBLIC_FRONTEND_API_URL}/v1/auth/logout`, {
                                method: 'GET',
                                credentials: 'include'
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                        window.location.href = "/";
                    }}
                >
                    Sair da conta
                </button>

                <button 
                    type="button" 
                    className="delete_account_button"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Excluir conta
                </button>
            </section>

            {showDeleteModal && (
                <div className="modal_overlay">
                    <div className="modal_content">
                        <h3>Confirmar exclusão de conta</h3>
                        <p>Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</p>
                        
                        {user?.profile?.has_password ? (
                            <>
                                <p>Digite sua senha para confirmar:</p>
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="password_input"
                                />
                            </>
                        ) : (
                            <p><strong>Confirme que você deseja excluir permanentemente sua conta.</strong></p>
                        )}
                        
                        <div className="modal_actions">
                            <button 
                                type="button" 
                                className="cancel_modal_button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword("");
                                    setErrorMessage("");
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="confirm_delete_button"
                                onClick={handleDeleteAccount}
                            >
                                Excluir conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}