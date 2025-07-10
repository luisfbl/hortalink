import type {User} from "@interfaces/User"
import RequestAPI from "./APIFunctions/RequestAPI"
import type {
    Cart,
    DetailedProduct,
    FullRating,
    IndividualRating,
    Product,
    ProductFilter,
    ProductFullTextSearch
} from "@interfaces/Product"
import type {Schedule, ScheduleApiBody} from "@interfaces/Schedule"
import type {Seller} from "@interfaces/Seller"
import type {UserResults} from "@components/pages/home/search/Search"
import type {Order, SellerOrder} from "@interfaces/Orders"
import type {ChatMessage, ChatPreview} from "@interfaces/Chat"
import Geolocation from "../stores/Geolocation"
import type {Notification} from "@interfaces/Notifications.ts";

class APIWrapper<F extends RequestAPIFrom> {
    private from: F

    constructor(from: F) {
        this.from = from
    }

    async getCurrentSession(session_id?: F extends RequestAPIFrom.Server ? string : never, extended = false): Promise<User> {
        switch(this.from) {
            case RequestAPIFrom.Client:
                return this.getCurrentSessionFromClient(extended)
            case RequestAPIFrom.Server:
                return this.getCurrentSessionFromServer(session_id, extended)
        }
    }

    private async getCurrentSessionFromClient(extended = false): Promise<User> {
        return await RequestAPI(this.from, `/v1/users/@me?extended=${extended}`, null, "include") as User
    }

    private async getCurrentSessionFromServer(session_id: string, extended = false): Promise<User> {
        return await RequestAPI(this.from, `/v1/users/@me?extended=${extended}`, null, "include", {
            'Cookie': `session_id=${session_id}`
        }) as User
    }

    public async getRecentProducts(page: number = 1): Promise<Product[]> {
        const searchParams = new URLSearchParams()

        searchParams.append("page", String(page))
        searchParams.append("per_page", String(10))

        return await RequestAPI(this.from, "/v1/users/@me/home/most_recent", searchParams, "include") as Product[]
    }

    public async getMoreOrderProducts(page: number = 1): Promise<Product[]> {
        const searchParams = new URLSearchParams()
        const position = Geolocation.position.get();

        searchParams.append("page", String(page))
        searchParams.append("per_page", String(10))

        if (position) {
            searchParams.append("latitude", position[0].toString())
            searchParams.append("longitude", position[1].toString())
        }

        const data = await RequestAPI(this.from, "/v1/users/@me/home/more_orders", searchParams, "include") as Product[]

        if (!position) {
            return this.changeProductsDistance(data)
        }
        
        return data
    }

    public async getProducts(filter: ProductFilter): Promise<Product[]> {
        const searchParams = new URLSearchParams()

        if(!filter.page) {
            filter.page = 1
        }

        if(!filter.per_page) {
            filter.per_page = 10
        }

        const keys = Object.keys(filter)

        for(const key of keys) {
            const value = filter[key]

            searchParams.append(key, value)
        }

        const data = await RequestAPI(this.from, "/v1/products", searchParams, "include") as Product[]

        if (filter.latitude && filter.longitude) {
            return data
        }
        
        return this.changeProductsDistance(data)
    }

    public async getSchedule(schedule_id: number): Promise<Schedule> {
        return await RequestAPI(
            this.from,
            `/v1/sellers/0/schedules/${schedule_id}`,
            undefined,
            "include"
        ) as Schedule;
    }

    public async searchUsers(query: string, page: number, per_page: number) {
        const searchParams = new URLSearchParams()

        searchParams.set("page", page.toString())
        searchParams.set("per_page", per_page.toString())
        searchParams.set("query", query)
        
        const data = await RequestAPI(this.from, "/v1/users", searchParams, "include") as UserResults[]

        return data
    }
    
    public async search(query?: string, page: number = 1, per_page: number = 10, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<ProductFullTextSearch[]> {
        switch (this.from) {
            case RequestAPIFrom.Client:
                return await this.searchFromClient(query, page, per_page)
                break;
            case RequestAPIFrom.Server:
                return await this.searchFromServer(query || "", page, per_page, session_id)
        }
    }

    private async searchFromClient(query?: string, page: number = 1, per_page: number = 10) {
        const searchParams = new URLSearchParams()
    
        if(query) {
            searchParams.append("query", query)
        }
        searchParams.append("page", String(page))
        searchParams.append("per_page", String(per_page))
    
        const types = await RequestAPI(this.from, "/v1/resources/products", searchParams, "include") as ProductFullTextSearch[]
    
        return types
    }

    private async searchFromServer(query: string, page: number, per_page: number, session_id: string): Promise<ProductFullTextSearch[]> {
        const searchParams = new URLSearchParams()
    
        if(query.length) {
            searchParams.append("query", query)
        }
        searchParams.append("page", String(page))
        searchParams.append("per_page", String(per_page))
    
        const types = await RequestAPI(this.from, "/v1/resources/products", searchParams, undefined, {
            "Cookie": `session_id=${session_id}`
        }) as ProductFullTextSearch[]
    
        return types
    }

    public async getProduct(product_id: number, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<DetailedProduct> {
        switch(this.from) {
            case RequestAPIFrom.Server:
                return await this.getProductFromServer(product_id, session_id);
            
        }
    }

    private async getProductFromServer(product_id: number, session_id: string): Promise<DetailedProduct> {
        const data = await RequestAPI(this.from, `/v1/products/${product_id}`, null, "include", {
            "Cookie": `session_id=${session_id}`
        })

        return data as DetailedProduct
    }

    public async getProductRatings(seller_id: number, product_id: number, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<FullRating> {
        switch(this.from) {
            case RequestAPIFrom.Server:
                return await this.getProductRatingsFromServer(seller_id, product_id, session_id);   
        }
    }

    private async getProductRatingsFromServer(seller_id: number, product_id: number, session_id: string): Promise<FullRating> {
        const params = new URLSearchParams()

        params.append("page", "1")
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/products/${product_id}/ratings`, params, "include", {
            "Cookie": `session_id=${session_id}`
        }) as FullRating

        return data
    }

    public async getCustomerRatings(customer_id: number, page: number, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<IndividualRating[]> {
        switch(this.from) {
            case RequestAPIFrom.Server:
                return await this.getCustomerRatingsFromServer(customer_id, page, session_id);
            break;
            case RequestAPIFrom.Client:
                return await this.getCustomerRatingsFromClient(customer_id, page)
        }
    }

    private async getCustomerRatingsFromClient(customer_id: number, page: number,): Promise<IndividualRating[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/customers/${customer_id}/ratings`, params, "include") as IndividualRating[]

        return data
    }

    private async getCustomerRatingsFromServer(customer_id: number, page: number, session_id: string): Promise<IndividualRating[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/customers/${customer_id}/ratings`, params, "include", {
            "Cookie": `session_id=${session_id}`
        }) as IndividualRating[]

        return data
    }

    public async getSellerRatings(seller_id: number, page: number, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<IndividualRating[]> {
        switch(this.from) {
            case RequestAPIFrom.Server:
                return await this.getSellersRatingsFromServer(seller_id, page, session_id);
            break;
            case RequestAPIFrom.Client:
                return await this.getSellerRatingsFromClient(seller_id, page)
        }
    }

    private async getSellerRatingsFromClient(seller_id: number, page: number,): Promise<IndividualRating[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/ratings`, params, "include") as IndividualRating[]

        return data
    }

    private async getSellersRatingsFromServer(seller_id: number, page: number, session_id: string): Promise<IndividualRating[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/ratings`, params, "include", {
            "Cookie": `session_id=${session_id}`
        }) as IndividualRating[]

        return data
    }

    public async getSellerProducts(seller_id: number, page: number, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<Product[]> {
        switch(this.from) {
            case RequestAPIFrom.Server:
                return await this.getSellersProductsFromServer(seller_id, page, session_id);
            break;
            case RequestAPIFrom.Client:
                return await this.getSellerProductsFromClient(seller_id, page)
        }
    }

    private async getSellerProductsFromClient(seller_id: number, page: number,): Promise<Product[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/products`, params, "include") as Product[]

        return this.changeProductsDistance(data)
    }

    private async getSellersProductsFromServer(seller_id: number, page: number, session_id: string): Promise<Product[]> {
        const params = new URLSearchParams()

        params.append("page", page.toString())
        params.append("per_page", "10")

        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/products`, params, "include", {
            "Cookie": `session_id=${session_id}`
        }) as Product[]

        return this.changeProductsDistance(data)
    }

    public async getCart(): Promise<Cart[]> {
        const data = await RequestAPI(this.from, `/v1/users/@me/cart`, undefined, "include") as Cart[]

        return data
    }
    
    public async addToCart(product_id: number, amount: number, withdrawn?: number): Promise<void> {
        await RequestAPI(
            this.from, 
            `/v1/users/@me/cart`, 
            undefined, 
            "include", 
            { "Content-Type": "application/json" },
            "POST", 
            JSON.stringify({ 
                seller_product_id: product_id, 
                amount, 
                withdrawn 
            })
        );
    }

    public async getSellerSchedules(seller_id: number, productId: number | null = null, session_id?: F extends RequestAPIFrom.Server ? string : never): Promise<Schedule[]> {
        switch (this.from) {
            case RequestAPIFrom.Server:
                return await this.getSellerSchedulesFromServer(seller_id, productId, session_id)
            case RequestAPIFrom.Client:
                return await this.getSellerSchedulesFromClient(seller_id, productId)
        }
    }

    private async getSellerSchedulesFromClient(seller_id: number, productId: number | null = null) {
        let path = `/v1/sellers/${seller_id}/schedules`

        if (productId != null) {
            path += `?product_id=${productId}`
        }

        return await RequestAPI(this.from, path, undefined, "include") as Schedule[]
    }

    private async getSellerSchedulesFromServer(seller_id: number, productId: number | null = null, session_id: string) {
        let path = `/v1/sellers/${seller_id}/schedules`

        if (productId != null) {
            path += `?product_id=${productId}`
        }

        return await RequestAPI(this.from, path, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as Schedule[]
    }

    public async getSeller(seller_id: number, session_id: F extends RequestAPIFrom.Server ? string : never): Promise<Seller> {
        switch (this.from) {
            case RequestAPIFrom.Server:
                return await this.getSellerFromServer(seller_id, session_id)
        }
    }

    private async getSellerFromServer(seller_id: number, session_id: string) {
        const data = await RequestAPI(this.from, `/v1/users/${seller_id}`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as Seller

        return data
    }

    async createProduct(seller_id: number, productData: FormData) {
        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/products`, undefined, "include", undefined, "POST", productData)
        
        return data
    }

    async editProduct(seller_id: number, product_id, productData: FormData) {
        const data = await RequestAPI(this.from, `/v1/sellers/${seller_id}/products/${product_id}`, undefined, "include", undefined, "PATCH", productData)
        
        return data
    }

    async getOrder(orderId: string, session_id: string) {
        const data = await RequestAPI(this.from, `/v1/users/@me/orders/${orderId}`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        })
        
        return data
    }

    async getOrdersFromClient(): Promise<SellerOrder[]> {
        const data = await RequestAPI(this.from, `/v1/users/@me/orders`, undefined, "include") as SellerOrder[]
        
        return data
    }

    async getOrdersFromServer(session_id: string): Promise<SellerOrder[]> {
        const data = await RequestAPI(this.from, `/v1/users/@me/orders`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as SellerOrder[]

        return data
    }

    async markOrderAsPickedUp(orderId: number, pickupDate: string): Promise<void> {
        await RequestAPI(
            this.from,
            `/v1/users/@me/orders/${orderId}`,
            null,
            "include",
            { "Content-Type": "application/json" },
            "PATCH",
            JSON.stringify({
                picked_up: true,
                pickup_date: pickupDate
            })
        );
    }

    async deleteOrder(orderId: number) {
        const data = await RequestAPI(this.from, `/v1/users/@me/orders/${orderId}`, undefined, "include", undefined, "DELETE") as unknown
        
        return data
    }

    private async getChatsFromClient() {
        const data = await RequestAPI(this.from, `/v1/users/@me/chats`, undefined, "include") as ChatPreview[]

        return data
    }
    
    private async getChatsFromServer(session_id: string) {
        const data = await RequestAPI(this.from, `/v1/users/@me/chats`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as ChatPreview[]

        return data
    }

    public async getChats(session_id: F extends RequestAPIFrom.Server ? string : undefined) {
        switch (this.from) {
            case RequestAPIFrom.Client:
                return await this.getChatsFromClient()
            case RequestAPIFrom.Server:
                return await this.getChatsFromServer(session_id)
        }
    }

    public async getChatMessagesFromClient(chat_id: number, page: number, per_page: number) {
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("per_page", per_page.toString())

        return await RequestAPI(this.from, `/v1/users/@me/chats/${chat_id}/messages`, params, "include") as ChatMessage[]
    }

    public async getChatMessagesFromServer(chat_id: number, page: number, per_page: number, session_id: string) {
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("per_page", per_page.toString())

        return await RequestAPI(this.from, `/v1/users/@me/chats/${chat_id}/messages`, params, "include", {
            "Cookie": `session_id=${session_id}`
        }) as ChatMessage[]
    }

    public async getChatMessages(chat_id: number, page: number, per_page: number, session_id: F extends RequestAPIFrom.Server ? string : undefined) {
        switch (this.from) {
            case RequestAPIFrom.Client:
                return await this.getChatMessagesFromClient(chat_id, page, per_page)
            case RequestAPIFrom.Server:
                return await this.getChatMessagesFromServer(chat_id, page, per_page, session_id)
        }
    }

    public async createChatMessageFromClient(chat_id: number, content: string) {
        return await RequestAPI(this.from, `/v1/users/@me/chats/${chat_id}/messages`, null, "include", {
            "Content-Type": "application/json"
        }, "POST", JSON.stringify({ content })) as ChatMessage[]
    }

    public async createChatMessageFromServer(chat_id: number, content: string, session_id: string) {
        return await RequestAPI(this.from, `/v1/users/@me/chats/${chat_id}/messages`, null, "include", {
            "Cookie": `session_id=${session_id}`,
            "Content-Type": "application/json"
        }, "POST", JSON.stringify({ content })) as ChatMessage[]
    }

    public async createChatMessage(chat_id: number, content: string, session_id: F extends RequestAPIFrom.Server ? string : undefined) {
        switch (this.from) {
            case RequestAPIFrom.Client:
                return await this.createChatMessageFromClient(chat_id, content)
            case RequestAPIFrom.Server:
                return await this.createChatMessageFromServer(chat_id, content, session_id)
        }
    }

    public async createSchedule(sellerId: number, schedule: ScheduleApiBody & { location: { longitude: number, latitude: number } }) {
        return await RequestAPI(this.from, `/v1/sellers/${sellerId}/schedules`, null, "include", {
            "Content-Type": "application/json",
        }, "POST", JSON.stringify(schedule))
    }

    public async editSchedule(sellerId: number, schedule_id: number, schedule: Partial<ScheduleApiBody & { location: { longitude: number, latitude: number }}>) {
        return await RequestAPI(this.from, `/v1/sellers/${sellerId}/schedules/${schedule_id}`, null, "include", {
            "Content-Type": "application/json",
        }, "PATCH", JSON.stringify(schedule))
    }

    public async getProductsDistance(productsId: number[], latitude: number, longitude: number) {
        const params = new URLSearchParams()
        params.append("products_id", JSON.stringify(productsId))
        params.append("latitude", latitude.toString())
        params.append("longitude", longitude.toString())
        
        try {
            const result = await RequestAPI(this.from, `/v1/products/dist`, params, "include");
            console.log("Resposta da API de distâncias:", result);
            return result;
        } catch (error) {
            console.error("Erro ao obter distâncias:", error);
            throw error;
        }
    }

    public async getHomeInfo(session_id: string) {
        return await RequestAPI(this.from, `/v1/users/@me/home`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as Home
    }

    public async getNotifications(session_id: string) {
        return await RequestAPI(this.from, `/v1/users/@me/notifications`, undefined, "include", {
            "Cookie": `session_id=${session_id}`
        }) as Notification[]
    }
    
    public async updateUserProfile(formData: FormData): Promise<void> {
        return await RequestAPI(
            this.from,
            `/v1/users/@me`,
            undefined,
            "include",
            undefined,
            "PATCH",
            formData
        ) as void;
    }

    public async updateCartProduct(orderId: number, data: { withdrawn?: number, amount?: number, picked_up?: boolean, pickup_date?: string }): Promise<void> {
        await RequestAPI(
            this.from,
            `/v1/users/@me/cart/${orderId}`,
            null,
            "include",
            { "Content-Type": "application/json" },
            "PATCH",
            JSON.stringify(data)
        );
    }

    public async reserveCartProduct(orderId: number): Promise<void> {
        await RequestAPI(
            this.from,
            `/v1/users/@me/cart/${orderId}/reserve`,
            null,
            "include",
            undefined,
            "POST"
        );
    }

    private async changeProductsDistance(
        products: Product[]
    ): Promise<Product[]> {
        const position = Geolocation.position.get();
        if (!products.length || position == null) {
            return products;
        }

        const productsId = products.map(product => product.id);
        const distanceData = await this.getProductsDistance(productsId, position[0], position[1]);

        // Converter array de distâncias para objeto key-value
        const distanceMap = distanceData.reduce((acc, item) => {
            acc[item.id] = item.dist;
            return acc;
        }, {});

        return products.map(product => ({
            ...product,
            dist: distanceMap[product.id] || null
        }));
    }
}


enum RequestAPIFrom {
    Server = 1,
    Client = 2
}

export {
    RequestAPIFrom
}

export default APIWrapper