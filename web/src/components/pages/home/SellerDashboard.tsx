import { useState, useEffect } from 'react';
import type { SellerHomeStats } from '@interfaces/Home.ts';
import RequestAPI from "../../../API/APIFunctions/RequestAPI.ts";
import {RequestAPIFrom} from "@HortalinkAPIWrapper";

export default function SellerDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SellerHomeStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await RequestAPI(RequestAPIFrom.Client, '/v1/users/@me/home/seller_stats', null, "include");
                // @ts-ignore
                setStats(response);
            } catch (err) {
                setError('Erro ao se conectar com o servidor');
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="dashboard-loading">Carregando dashboard...</div>;
    }

    if (error || !stats) {
        return <div className="dashboard-error">{error || 'Ocorreu um erro ao carregar os dados'}</div>;
    }

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(parseFloat(value));
    };

    const getStatusClass = (status: number) => {
        if (status < 2) return 'status-pending';
        if (status === 2) return 'status-processing';
        return 'status-completed';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="seller-dashboard">
            <div className="stats-cards">
                <div className="stats-card revenue-card">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>Faturamento do Mês</h3>
                        <p className="card-value">{formatCurrency(stats.monthly_revenue)}</p>
                    </div>
                </div>
                
                <div className="stats-card orders-card">
                    <div className="card-icon">📦</div>
                    <div className="card-content">
                        <h3>Total de Pedidos</h3>
                        <p className="card-value">{stats.total_orders}</p>
                    </div>
                </div>
                
                <div className="stats-card pending-card">
                    <div className="card-icon">⏳</div>
                    <div className="card-content">
                        <h3>Pedidos Pendentes</h3>
                        <p className="card-value">{stats.pending_orders}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Produtos Mais Vendidos</h2>
                <div className="top-products">
                    {stats.top_products.length > 0 ? (
                        <div className="products-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Qtd. Vendida</th>
                                        <th>Faturamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.top_products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-cell">
                                                    <img src={`/cdn/products/${product.id}/${product.photo}.jpg?size=256`} alt={product.name} className="product-thumbnail" />
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td>{product.sold_quantity} unid.</td>
                                            <td>{formatCurrency(product.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">Nenhum produto vendido ainda.</p>
                    )}
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Pedidos Recentes</h2>
                <div className="recent-orders">
                    {stats.recent_orders.length > 0 ? (
                        <div className="orders-list">
                            {stats.recent_orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <div className="order-customer">
                                        {order.customer_avatar ? (
                                            <img src={`/cdn/avatars/${order.customer_id}/${order.customer_avatar}.png?size=256`} alt={order.customer_name} className="customer-avatar" />
                                        ) : (
                                            <div className="customer-avatar-placeholder">{order.customer_name.charAt(0)}</div>
                                        )}
                                        <span className="customer-name">{order.customer_name}</span>
                                    </div>
                                    <div className="order-details">
                                        <p className="product-name">{order.product_name}</p>
                                        <p className="order-amount">Quantidade: {order.amount}</p>
                                        <p className="order-date">Data: {formatDate(order.created_at)}</p>
                                    </div>
                                    <div className={`order-status ${getStatusClass(order.status)}`}>
                                        {order.status < 2 ? 'Pendente' : order.status === 2 ? 'Em Processamento' : 'Concluído'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">Nenhum pedido recente.</p>
                    )}
                </div>
            </div>
        </div>
    );
}