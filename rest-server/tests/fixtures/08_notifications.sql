-- Insert test notifications for each user in the fixtures
-- Each user gets 3 notifications of different types

-- Notification type definitions:
-- 1: New product available
-- 2: Order status update
-- 3: Price change alert
-- 4: Seller schedule change
-- 5: New rating on product
-- 6: Promotional offer
-- 7: System notification
-- 8: New follower
-- 9: Stock availability

INSERT INTO "notifications" (user_id, title, type, content, created_at, "read")
VALUES
    -- User 1: breno bastos dos santos (customer)
    (1, 'Nova alface orgânica disponível', 1,
     '{"product_id": 10, "seller_name": "iago lobo", "message": "Um novo produto foi adicionado por um vendedor que você segue"}',
     NOW() - INTERVAL '3 days', true),

    (1, 'Seu pedido foi confirmado', 2,
     '{"order_id": 1001, "status": "confirmed", "message": "Seu pedido de pepino foi confirmado e está sendo preparado"}',
     NOW() - INTERVAL '1 day', false),

    (1, 'Oferta especial em hortaliças', 6,
     '{"discount": 15, "expires_in": "48h", "message": "Aproveite 15% de desconto em folhosas selecionadas"}',
     NOW() - INTERVAL '12 hours', false),

    -- User 2: iago lobo (seller)
    (2, 'Novo seguidor', 8,
     '{"follower_id": 1, "follower_name": "breno bastos dos santos", "message": "Você tem um novo seguidor"}',
     NOW() - INTERVAL '5 days', true),

    (2, 'Nova avaliação recebida', 5,
     '{"product_id": 1, "rating": 5, "customer_name": "breno bastos dos santos", "message": "Seu alface recebeu uma nova avaliação de 5 estrelas"}',
     NOW() - INTERVAL '2 days', true),

    (2, 'Estoque baixo', 9,
     '{"product_id": 3, "current_stock": 5, "message": "Seu estoque de pepino está acabando"}',
     NOW() - INTERVAL '6 hours', false),

    -- User 3: artur cardoso (seller)
    (3, 'Nova avaliação recebida', 5,
     '{"product_id": 5, "rating": 4, "customer_name": "gabriel neves", "message": "Seu brócolis recebeu uma nova avaliação de 4 estrelas"}',
     NOW() - INTERVAL '7 days', true),

    (3, 'Pedido em andamento', 2,
     '{"order_id": 1002, "status": "in_progress", "message": "Um cliente retirou seu pedido de mostarda"}',
     NOW() - INTERVAL '3 days', true),

    (3, 'Atualização do sistema', 7,
     '{"version": "2.1.0", "message": "Nova funcionalidade de programação de colheitas disponível"}',
     NOW() - INTERVAL '1 day', false),

    -- User 4: thiago nazário (seller)
    (4, 'Atualização da plataforma', 7,
     '{"maintenance": "scheduled", "message": "O sistema estará em manutenção neste domingo, das 02h às 04h"}',
     NOW() - INTERVAL '6 days', true),

    (4, 'Novo seguidor', 8,
     '{"follower_id": 16, "follower_name": "ivan pereira", "message": "Você tem um novo seguidor"}',
     NOW() - INTERVAL '4 days', true),

    (4, 'Recomendação de cultivo', 7,
     '{"product_id": 14, "message": "O clima está favorável para o cultivo de cebolinha na sua região"}',
     NOW() - INTERVAL '1 day', false),

    -- User 5: cláudio carmo (seller)
    (5, 'Pedido concluído', 2,
     '{"order_id": 1003, "status": "completed", "message": "Pedido de rabanete entregue com sucesso"}',
     NOW() - INTERVAL '8 days', true),

    (5, 'Nova funcionalidade disponível', 7,
     '{"feature": "analytics", "message": "Agora você pode acompanhar as estatísticas de venda de seus produtos"}',
     NOW() - INTERVAL '3 days', true),

    (5, 'Ajuste de preço sugerido', 3,
     '{"product_id": 8, "current_price": 1.50, "suggested_price": 1.75, "message": "Os preços de rabanete estão subindo no mercado"}',
     NOW() - INTERVAL '1 day', false),

    -- User 6: gabriel neves (customer)
    (6, 'Produtos recomendados para você', 1,
     '{"product_id": 17, "seller_name": "leonardo santos", "message": "Baseado nos seus interesses, você pode gostar de couve manteiga"}',
     NOW() - INTERVAL '5 days', true),

    (6, 'Status do pedido atualizado', 2,
     '{"order_id": 1004, "status": "ready", "message": "Seu pedido de pimenta está pronto para retirada"}',
     NOW() - INTERVAL '2 days', true),

    (6, 'Promoção relâmpago', 6,
     '{"product_id": 22, "discount": 20, "message": "Taioba com 20% de desconto apenas hoje!"}',
     NOW() - INTERVAL '8 hours', false),

    -- User 7: nicolas fraga (customer)
    (7, 'Novos produtos orgânicos', 1,
     '{"product_id": 13, "seller_name": "juliana martins", "message": "Bertalha orgânica recém-colhida disponível"}',
     NOW() - INTERVAL '9 days', true),

    (7, 'Alteração na agenda de entrega', 4,
     '{"seller_id": 9, "seller_name": "bruna salles", "message": "O horário de atendimento na feira foi alterado"}',
     NOW() - INTERVAL '4 days', true),

    (7, 'Promoção de outono', 6,
     '{"category_id": 3, "discount": 10, "message": "Todas as folhosas com 10% de desconto nesta semana"}',
     NOW() - INTERVAL '1 day', false),

    -- User 8: elisandra cruz (customer)
    (8, 'Um vendedor que você segue adicionou novos produtos', 1,
     '{"seller_id": 5, "seller_name": "cláudio carmo", "message": "Novos tipos de almeirão disponíveis"}',
     NOW() - INTERVAL '7 days', true),

    (8, 'Lembrete de pedido', 2,
     '{"order_id": 1005, "scheduled_date": "2024-03-15", "message": "Seu pedido de chicória será entregue amanhã"}',
     NOW() - INTERVAL '3 days', true),

    (8, 'Alteração nos preços', 3,
     '{"product_id": 19, "old_price": 3.00, "new_price": 2.75, "message": "Mostarda com preço reduzido"}',
     NOW() - INTERVAL '2 days', false),

    -- User 9: bruna salles (seller)
    (9, 'Novo pedido recebido', 2,
     '{"order_id": 1006, "customer_name": "elisandra cruz", "message": "Você recebeu um novo pedido de bertalha"}',
     NOW() - INTERVAL '6 days', true),

    (9, 'Atualização do sistema de pagamentos', 7,
     '{"system": "payments", "message": "Novas opções de pagamento disponíveis na plataforma"}',
     NOW() - INTERVAL '3 days', true),

    (9, 'Estoque crítico', 9,
     '{"product_id": 3, "current_stock": 2, "message": "Seu estoque de pimentão está quase esgotado"}',
     NOW() - INTERVAL '1 day', false),

    -- User 10: franciane saraiva (seller)
    (10, 'Novo seguidor', 8,
     '{"follower_id": 13, "follower_name": "fernanda lima", "message": "Você tem um novo seguidor"}',
     NOW() - INTERVAL '8 days', true),

    (10, 'Sugestão de cultivo sazonal', 7,
     '{"season": "outono", "suggested_products": ["alface", "couve", "espinafre"], "message": "Veja as hortaliças recomendadas para esta estação"}',
     NOW() - INTERVAL '4 days', true),

    (10, 'Convite para feira especial', 7,
     '{"event_date": "2024-04-15", "location": "Parque Municipal", "message": "Você foi selecionado para participar da Feira de Produtores Orgânicos"}',
     NOW() - INTERVAL '2 days', false),

    -- User 11: ana beatriz (customer)
    (11, 'Novos produtos na sua região', 1,
     '{"seller_id": 15, "seller_name": "helena costa", "message": "Couve-chinesa fresca disponível perto de você"}',
     NOW() - INTERVAL '5 days', true),

    (11, 'Confirmação de pedido', 2,
     '{"order_id": 1007, "total": 12.50, "message": "Seu pedido de bertalha foi confirmado"}',
     NOW() - INTERVAL '2 days', true),

    (11, 'Dica de consumo sustentável', 7,
     '{"product_id": 15, "message": "Aproveite os talos da couve em receitas nutritivas e evite desperdício"}',
     NOW() - INTERVAL '1 day', false),

    -- User 12: carlos eduardo (seller)
    (12, 'Nova avaliação de produto', 5,
     '{"product_id": 14, "rating": 5, "customer_name": "fernanda lima", "message": "Sua cebolinha recebeu uma avaliação de 5 estrelas"}',
     NOW() - INTERVAL '7 days', true),

    (12, 'Pedido cancelado', 2,
     '{"order_id": 1008, "customer_name": "nelson ferreira", "message": "Um cliente cancelou o pedido de cebolinha"}',
     NOW() - INTERVAL '3 days', true),

    (12, 'Melhore sua visibilidade', 7,
     '{"tip": "photos", "message": "Adicione mais fotos de qualidade aos seus produtos para aumentar as vendas"}',
     NOW() - INTERVAL '1 day', false),

    -- User 13: fernanda lima (customer)
    (13, 'Oferta exclusiva para você', 6,
     '{"product_id": 12, "discount": 15, "message": "15% de desconto em almeirão especialmente para você"}',
     NOW() - INTERVAL '6 days', true),

    (13, 'Pedido a caminho', 2,
     '{"order_id": 1009, "estimated_delivery": "30 minutos", "message": "Seu pedido de cebolinha está a caminho"}',
     NOW() - INTERVAL '2 days', true),

    (13, 'Receita da semana', 7,
     '{"recipe": "Salada verde nutritiva", "ingredients": ["rúcula", "alface", "cebolinha"], "message": "Experimente esta receita saudável com produtos da sua última compra"}',
     NOW() - INTERVAL '1 day', false),

    -- User 14: guilherme silva (seller)
    (14, 'Tendência de mercado', 7,
     '{"trend": "organic", "message": "A procura por produtos orgânicos aumentou 30% no último mês"}',
     NOW() - INTERVAL '9 days', true),

    (14, 'Novo seguidor', 8,
     '{"follower_id": 19, "follower_name": "mariana oliveira", "message": "Você tem um novo seguidor"}',
     NOW() - INTERVAL '4 days', true),

    (14, 'Otimize suas entregas', 7,
     '{"suggestion": "route_planning", "message": "Use nosso novo recurso de planejamento de rotas para entregas mais eficientes"}',
     NOW() - INTERVAL '2 days', false),

    -- User 15: helena costa (seller)
    (15, 'Pedido concluído com sucesso', 2,
     '{"order_id": 1010, "customer_name": "ana beatriz", "message": "Pedido de couve-chinesa entregue com sucesso"}',
     NOW() - INTERVAL '8 days', true),

    (15, 'Nova certificação disponível', 7,
     '{"certification": "Selo Verde", "message": "Você está elegível para solicitar o Selo Verde para seus produtos"}',
     NOW() - INTERVAL '5 days', true),

    (15, 'Sugestão de preço competitivo', 3,
     '{"product_id": 18, "market_avg": 3.50, "current_price": 3.25, "message": "Seu preço para couve-chinesa está competitivo no mercado atual"}',
     NOW() - INTERVAL '1 day', false),

    -- User 16: ivan pereira (customer)
    (16, 'Novos produtores na sua região', 1,
     '{"seller_count": 3, "message": "Três novos produtores de hortaliças começaram a atender na sua região"}',
     NOW() - INTERVAL '7 days', true),

    (16, 'Seu pedido foi aceito', 2,
     '{"order_id": 1011, "seller_name": "artur cardoso", "message": "Seu pedido de brócolis foi aceito pelo vendedor"}',
     NOW() - INTERVAL '3 days', true),

    (16, 'Pesquisa de satisfação', 7,
     '{"survey_id": 2024001, "message": "Compartilhe sua opinião sobre a experiência com a plataforma e ganhe desconto"}',
     NOW() - INTERVAL '1 day', false),

    -- User 17: juliana martins (seller)
    (17, 'Nova avaliação recebida', 5,
     '{"product_id": 16, "rating": 4, "customer_name": "nelson ferreira", "message": "Seu coentro recebeu uma avaliação de 4 estrelas"}',
     NOW() - INTERVAL '6 days', true),

    (17, 'Alteração na agenda', 4,
     '{"schedule_id": 13, "message": "Sua agenda de vendas foi atualizada conforme solicitado"}',
     NOW() - INTERVAL '4 days', true),

    (17, 'Dica de produção', 7,
     '{"product_id": 4, "message": "Veja técnicas para aumentar a produtividade do quiabo na estação atual"}',
     NOW() - INTERVAL '2 days', false),

    -- User 18: leonardo santos (seller)
    (18, 'Novo pedido recebido', 2,
     '{"order_id": 1012, "customer_name": "gabriel neves", "message": "Você recebeu um novo pedido de couve"}',
     NOW() - INTERVAL '5 days', true),

    (18, 'Certificação orgânica', 7,
     '{"certification": "Orgânico Certificado", "expiration": "2025-03-18", "message": "Sua certificação orgânica foi renovada"}',
     NOW() - INTERVAL '3 days', true),

    (18, 'Promoção sugerida', 6,
     '{"product_id": 17, "suggestion": "bundle", "message": "Crie um pacote promocional de couve com cebolinha para aumentar vendas"}',
     NOW() - INTERVAL '1 day', false),

    -- User 19: mariana oliveira (customer)
    (19, 'Produto em destaque esta semana', 1,
     '{"product_id": 2, "seller_name": "iago lobo", "message": "Pimenta fresca em destaque com preço especial"}',
     NOW() - INTERVAL '8 days', true),

    (19, 'Acompanhamento de pedido', 2,
     '{"order_id": 1013, "status": "processing", "message": "Seu pedido de pimenta está sendo preparado"}',
     NOW() - INTERVAL '4 days', true),

    (19, 'Hortaliças da estação', 7,
     '{"season": "outono", "products": ["couve", "espinafre", "brócolis"], "message": "Aproveite as hortaliças frescas da estação"}',
     NOW() - INTERVAL '1 day', false),

    -- User 20: nelson ferreira (customer)
    (20, 'Novo método de entrega disponível', 7,
     '{"delivery_method": "express", "message": "Agora você pode receber seus pedidos no mesmo dia com entrega expressa"}',
     NOW() - INTERVAL '9 days', true),

    (20, 'Confirmação de retirada', 2,
     '{"order_id": 1014, "pickup_location": "Feira Central", "message": "Seu pedido de couve-chinesa está confirmado para retirada"}',
     NOW() - INTERVAL '5 days', true),

    (20, 'Desconto para clientes frequentes', 6,
     '{"discount": 10, "valid_until": "2024-03-25", "message": "10% de desconto na próxima compra como agradecimento pela sua fidelidade"}',
     NOW() - INTERVAL '2 days', false);