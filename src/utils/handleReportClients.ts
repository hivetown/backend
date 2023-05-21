import { OrderItem, ShipmentStatus } from '../entities';

export function handleReportClients(atual: any[], orderItem: OrderItem, opcao: string) {
	const obj = atual.find((obj) => Number(obj.id) === Number(orderItem.order.consumer.user.id));
	if (obj) {
		if (opcao === 'numeroEncomendas') {
			if (!obj.encomendas.includes(orderItem.order.id)) {
				obj.numeroEncomendas++;
				obj.encomendas.push(orderItem.order.id);
			}

			if (orderItem.order.getGeneralStatus() === 'Canceled') {
				if (!obj.encomendasCanceladas.includes(orderItem.order.id)) {
					obj.numeroEncomendasCanceladas++;
					obj.encomendasCanceladas.push(orderItem.order.id);
				}
			}
		} else if (opcao === 'totalProdutos') {
			obj.totalProdutos += orderItem.quantity;

			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				obj.totalProdutosCancelados += orderItem.quantity;
			}
		} else if (opcao === 'comprasTotais') {
			obj.comprasTotais += orderItem.quantity * orderItem.price;

			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				obj.valorEmComprasTotaisCanceladas += orderItem.quantity * orderItem.price;
			}
		} else if (opcao === 'numeroProdutosEncomendados') {
			if (!obj.produtos.includes(orderItem.producerProduct.id)) {
				obj.numeroProdutosEncomendados++;
				obj.produtos.push(orderItem.producerProduct.id);
			}
			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				obj.numeroProdutosCancelados++;
			}
		}
	} else if (opcao === 'numeroEncomendas') {
		const numeroEncomendasCanceladas = orderItem.order.getGeneralStatus() === 'Canceled' ? 1 : 0;
		const encomendasCanceladas = numeroEncomendasCanceladas > 0 ? [orderItem.order.id] : [];
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			numeroEncomendas: 1,
			encomendas: [orderItem.order.id],
			numeroEncomendasCanceladas,
			encomendasCanceladas
		});
	} else if (opcao === 'totalProdutos') {
		const totalProdutosCancelados = orderItem.getActualStatus() === ShipmentStatus.Canceled ? orderItem.quantity : 0;
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			totalProdutos: orderItem.quantity,
			totalProdutosCancelados
		});
	} else if (opcao === 'comprasTotais') {
		const valorEmComprasTotaisCanceladas = orderItem.getActualStatus() === ShipmentStatus.Canceled ? orderItem.quantity * orderItem.price : 0;
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			comprasTotais: orderItem.quantity * orderItem.price,
			valorEmComprasTotaisCanceladas
		});
	} else if (opcao === 'numeroProdutosEncomendados') {
		const numeroProdutosCancelados = orderItem.getActualStatus() === ShipmentStatus.Canceled ? 1 : 0;
		atual.push({
			id: orderItem.order.consumer.user.id,
			nome: orderItem.order.consumer.user.name,
			numeroProdutosEncomendados: 1,
			produtos: [orderItem.producerProduct.id],
			numeroProdutosCancelados
		});
	}
	return atual;
}
