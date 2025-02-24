import { RequestAPIFrom } from "../Wrapper";

async function automaticallyParseResponse(request: Response) {
    const type = request.headers.get("content-type")

    if(type && type === "application/json") {
        return await request.json()
    } else {
        return await request.text()
    }
}

function RequestAPI(from: RequestAPIFrom, path: string, searchParams?: URLSearchParams, credentials: RequestCredentials = "omit", headers?: HeadersInit, method: string = "GET", body?: BodyInit): Promise<unknown> {
    return new Promise(async (resolve, reject) => {
        let base_url: string;

        switch (from) {
            case RequestAPIFrom.Server: 
                base_url = import.meta.env.BACKEND_API_URL
            break;
            case RequestAPIFrom.Client:
                base_url = import.meta.env.PUBLIC_FRONTEND_API_URL
            break;
            default:
                console.warn("INVALID API REQUEST FROM VALUE - using frontend API URL as fallback.")
                base_url = import.meta.env.PUBLIC_FRONTEND_API_URL
        }
    
        const paramsString = searchParams ? searchParams.toString() : null
        const params = paramsString ? "?" + paramsString : ""
    
        const request = await fetch(`${base_url}${path}${params}`, {
            credentials: credentials,
            headers: headers,
            method: method,
            body: body
        })
    
        if(!request.ok) {
            console.log(request.status)
            const response = await automaticallyParseResponse(request)
            return reject(response)
        }
    
        const response = await automaticallyParseResponse(request)
    
        resolve(response)
    })    
}

export default RequestAPI