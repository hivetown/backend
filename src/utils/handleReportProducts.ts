import type { OrderItem } from '../entities';

export function handleReportProducts(atual: any[], orderItem: OrderItem, opcao: string) {
	const obj = atual.find((obj) => Number(obj.id) === Number(orderItem.producerProduct.id));

	if (obj) {
		if (opcao === 'numeroEncomendas') {
			if (!obj.encomendas.includes(orderItem.order.id)) {
				obj.numeroEncomendas++;
				obj.encomendas.push(orderItem.order.id);
			}
		} else if (opcao === 'totalProdutos') {
			obj.totalProdutos += orderItem.quantity;
		} else if (opcao === 'comprasTotais') {
			obj.comprasTotais += orderItem.quantity * orderItem.price;
		} else if (opcao === 'vendasTotais') {
			obj.vendasTotais += orderItem.quantity * orderItem.price;
		}
	} else if (opcao === 'numeroEncomendas') {
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			numeroEncomendas: 1,
			encomendas: [orderItem.order.id]
		});
	} else if (opcao === 'totalProdutos') {
		atual.push({ id: orderItem.producerProduct.id, nome: orderItem.producerProduct.productSpec.name, totalProdutos: orderItem.quantity });
	} else if (opcao === 'comprasTotais') {
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			comprasTotais: orderItem.quantity * orderItem.price
		});
	} else if (opcao === 'vendasTotais') {
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			vendasTotais: orderItem.quantity * orderItem.price
		});
	}

	return atual;
}

// id, nome do produto, imagens (?), valor de acordo com a opção usada
