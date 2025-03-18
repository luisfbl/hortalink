/**
 * Faz request para o endpoint de oauth, para obter informações da sessão.
 * FUNCIONA SOMENTE NO LADO DO CLIENTE
 */
function getSession(oauth_type: string, code: string, state: string) {
    return new Promise((resolve, reject) => {
        fetch(`${import.meta.env.PUBLIC_FRONTEND_API_URL}/v1/oauth/${oauth_type}/callback?code=${code}&state=${state}`, {
            credentials: "include"
        }).then(request => {
            const ok = request.ok
            request.json().then(data => {
                if(!ok) {
                    reject(data)
                } else {
                    resolve(data)
                }
            })
        }).catch(error => reject(error))
    }) 
}

export default getSession