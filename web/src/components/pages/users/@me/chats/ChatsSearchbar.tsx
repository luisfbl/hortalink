import { useEffect, useState } from "react";
import { SearchBarInputRef } from "./Chats";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { UserResults } from "@components/pages/home/search/Search";

export default function ChatsSearchbar(currentUserId: number) {
    const [searchResults, setSearchResults] = useState<UserResults[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [query, setQuery] = useState("");

    const wrapper = new APIWrapper(RequestAPIFrom.Client);

    async function searchUsers(searchQuery: string) {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await wrapper.searchUsers(searchQuery, 1, 10);
            const filteredResults = currentUserId ? 
                results.filter(user => user.id !== currentUserId) : 
                results;
            setSearchResults(filteredResults);
            setShowResults(true);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleInputChange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const value = target.value;
            setQuery(value);

            if (timeout) {
                clearTimeout(timeout);
            }

            if (!value) {
                setSearchResults([]);
                setShowResults(false);
                return;
            }

            timeout = setTimeout(() => searchUsers(value), 600);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && query.length >= 3) {
                e.preventDefault();
                searchUsers(query);
            }
        };

        const input = SearchBarInputRef.current;
        if (input) {
            input.addEventListener("input", handleInputChange);
            input.addEventListener("keydown", handleKeyDown);
            input.addEventListener("focus", () => {
                if (query.length >= 3 && searchResults.length > 0) {
                    setShowResults(true);
                }
            });
        }

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".searchbar_container")) {
                setShowResults(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            if (input) {
                input.removeEventListener("input", handleInputChange);
                input.removeEventListener("keydown", handleKeyDown);
            }
            document.removeEventListener("click", handleClickOutside);
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [query, searchResults]);

    const handleSearchClick = () => {
        if (query.length >= 3) {
            searchUsers(query);
        }
    };

    const handleUserSelect = async (userId: number) => {
        setShowResults(false);
        
        try {
            const response = await wrapper.createChat(userId);
            
            if (!response || !response.chat_id) {
                throw new Error("Resposta inválida da API de criação de chat");
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            window.location.href = `/users/@me/chats/${response.chat_id}`;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            if (errorMessage.includes("Cannot create chat with yourself")) {
                alert("Você não pode iniciar uma conversa consigo mesmo!");
            } else {
                alert(`Erro ao iniciar conversa: ${errorMessage}`);
            }

            window.location.href = `/users/@me/chats`;
        }
    };

    return (
        <div className="searchbar_container">
            <div className="input">
                <input type="text" placeholder="Procurar usuários..." ref={SearchBarInputRef} />
                <div className="search_icon" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
                    <img
                        src="/assets/search.svg"
                        alt="Ícone de lupa. Clique para buscar ou digite que a pesquisa é feita automaticamente."
                        width="19"
                        height="19"
                    />
                </div>
            </div>
            
            {showResults && (
                <div className="search_results" role="listbox" aria-expanded={true}>
                    {isSearching ? (
                        <div className="search_loading">Procurando...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <div 
                                key={`user-${user.id}`}
                                className="search_result_item"
                                onClick={() => handleUserSelect(user.id)}
                                role="option"
                                tabIndex={0}
                            >
                                {user.avatar ? (
                                    <img
                                        className="user_avatar"
                                        src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${user.id}/${user.avatar}.png?size=128`}
                                        width={52}
                                        height={52}
                                    />
                                ) : (
                                    <img
                                        className="user_avatar"
                                        src="/assets/default-picture.svg"
                                        width={52}
                                        height={52}
                                    />
                                )}

                                <div className="user_info">
                                    <span className="user_name">{user.name}</span>
                                    <span className="user_stats">
                                        {user.followers} seguidores • {user.orders_received} pedidos
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : query.length >= 3 ? (
                        <div className="no_results">Nenhum usuário encontrado</div>
                    ) : (
                        <div className="min_chars">Digite pelo menos 3 caracteres</div>
                    )}
                </div>
            )}
        </div>
    )
}