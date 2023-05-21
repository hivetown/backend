import { OrderItem, ShipmentStatus } from '../entities';

export function handleReportProducts(atual: any[], orderItem: OrderItem, opcao: string) {
	const obj = atual.find((obj) => Number(obj.id) === Number(orderItem.producerProduct.id));

	if (obj) {
		if (opcao === 'numeroEncomendas') {
			if (!obj.encomendas.includes(orderItem.order.id)) {
				obj.numeroEncomendas++;
				obj.encomendas.push(orderItem.order.id);
			}

			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				obj.cancelado++;
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
		} else if (opcao === 'vendasTotais') {
			obj.vendasTotais += orderItem.quantity * orderItem.price;

			if (orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				obj.valorEmVendasTotaisCanceladas += orderItem.quantity * orderItem.price;
			}
		}
	} else if (opcao === 'numeroEncomendas') {
		const cancelado = orderItem.getActualStatus() === ShipmentStatus.Canceled ? 1 : 0;

		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			numeroEncomendas: 1,
			cancelado,
			encomendas: [orderItem.order.id]
		});
	} else if (opcao === 'totalProdutos') {
		const totalProdutosCancelados = orderItem.getActualStatus() === ShipmentStatus.Canceled ? orderItem.quantity : 0;
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			totalProdutos: orderItem.quantity,
			totalProdutosCancelados
		});
	} else if (opcao === 'comprasTotais') {
		const valorEmComprasTotaisCanceladas = orderItem.getActualStatus() === ShipmentStatus.Canceled ? orderItem.quantity * orderItem.price : 0;
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			comprasTotais: orderItem.quantity * orderItem.price,
			valorEmComprasTotaisCanceladas
		});
	} else if (opcao === 'vendasTotais') {
		const valorEmVendasTotaisCanceladas = orderItem.getActualStatus() === ShipmentStatus.Canceled ? orderItem.quantity * orderItem.price : 0;
		atual.push({
			id: orderItem.producerProduct.id,
			nome: orderItem.producerProduct.productSpec.name,
			vendasTotais: orderItem.quantity * orderItem.price,
			valorEmVendasTotaisCanceladas
		});
	}

	return atual;
}

// id, nome do produto, imagens (?), valor de acordo com a opção usada
