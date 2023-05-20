import type { OrderItem } from '../entities';

export function handleReportClients(atual: any[], orderItem: OrderItem, opcao: string) {
	const obj = atual.find((obj) => Number(obj.id) === Number(orderItem.order.consumer.user.id));
	if (obj) {
		if (opcao === 'numeroEncomendas') {
			// obj.numeroEncomendas++;
			if (!obj.encomendas.includes(orderItem.order.id)) {
				obj.numeroEncomendas++;
				obj.encomendas.push(orderItem.order.id);
			}
		} else if (opcao === 'totalProdutos') {
			obj.totalProdutos += orderItem.quantity;
		} else if (opcao === 'comprasTotais') {
			obj.comprasTotais += orderItem.quantity * orderItem.price;
		} else if (opcao === 'numeroProdutosEncomendados') {
			if (!obj.produtos.includes(orderItem.producerProduct.id)) {
				obj.numeroProdutosEncomendados++;
				obj.produtos.push(orderItem.producerProduct.id);
			}
		}
	} else if (opcao === 'numeroEncomendas') {
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			numeroEncomendas: 1,
			encomendas: [orderItem.order.id]
		});
	} else if (opcao === 'totalProdutos') {
		atual.push({ id: orderItem.order.consumer.user.id, nome: orderItem.order.consumer.user.name, totalProdutos: orderItem.quantity });
	} else if (opcao === 'comprasTotais') {
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			comprasTotais: orderItem.quantity * orderItem.price
		});
	} else if (opcao === 'numeroProdutosEncomendados') {
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			numeroProdutosEncomendados: 1,
			produtos: [orderItem.producerProduct.id]
		});
	}
	return atual;
}
