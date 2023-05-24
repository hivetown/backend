import { ShipmentStatus } from '../enums';

export function handleReportEvolution(orderItems: any[], opcao: string) {
	// console.log('orderItems', orderItems);
	// console.log('opcao', opcao);

	let resultado;
	let cancelados;

	// para o numeroEncomendas
	const encomendas: any[] = [];
	const encomendasCanceladas: any[] = [];
	const totalProdutos: any[] = [];
	const totalProdutosCancelados: any[] = [];
	const produtosEncomendados: any[] = [];
	const produtosEncomendadosCancelados: any[] = [];
	const totais: any[] = [];
	const totaisCancelados: any[] = [];

	if (opcao === 'numeroEncomendas') {
		for (const oi of orderItems) {
			encomendas.push({ orderId: oi.orderItem.order.id, date: oi.date });

			if (oi.orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				encomendasCanceladas.push({ orderId: oi.orderItem.order.id, date: oi.date });
			}
		}

		const encomendasFiltradas = encomendas.filter((encomenda, index, self) => self.findIndex((t) => t.orderId === encomenda.orderId) === index);
		const encomendasCanceladasFiltradas = encomendasCanceladas.filter(
			(encomenda, index, self) => self.findIndex((t) => t.orderId === encomenda.orderId) === index
		);

		resultado = agrupaConta(encomendasFiltradas);
		cancelados = agrupaConta(encomendasCanceladasFiltradas);
	} else if (opcao === 'totalProdutos') {
		for (const oi of orderItems) {
			totalProdutos.push({ valor: oi.orderItem.quantity, date: oi.date });

			if (oi.orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				totalProdutosCancelados.push({ valor: oi.orderItem.quantity, date: oi.date });
			}
		}

		resultado = agrupaValor(totalProdutos);
		cancelados = agrupaValor(totalProdutosCancelados);
	} else if (opcao === 'comprasTotais' || opcao === 'vendasTotais') {
		for (const oi of orderItems) {
			totais.push({ valor: oi.orderItem.quantity * oi.orderItem.price, date: oi.date });

			if (oi.orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				totaisCancelados.push({ valor: oi.orderItem.quantity * oi.orderItem.price, date: oi.date });
			}
		}

		resultado = agrupaValor(totais);
		cancelados = agrupaValor(totaisCancelados);
	} else if (opcao === 'numeroProdutosEncomendados') {
		for (const oi of orderItems) {
			produtosEncomendados.push({ producerProductId: oi.orderItem.producerProduct.id, date: oi.date });

			if (oi.orderItem.getActualStatus() === ShipmentStatus.Canceled) {
				produtosEncomendadosCancelados.push({ producerProductId: oi.orderItem.producerProduct.id, date: oi.date });
			}
		}
		// console.log('produtos não filtrados', produtosEncomendados);
		const produtosFiltrados = produtosEncomendados.filter(
			(produto, index, self) => self.findIndex((t) => t.producerProductId === produto.producerProductId) === index
		);

		const produtosCanceladosFiltrados = produtosEncomendadosCancelados.filter(
			(produto, index, self) => self.findIndex((t) => t.producerProductId === produto.producerProductId) === index
		);

		resultado = agrupaConta(produtosFiltrados);
		cancelados = agrupaConta(produtosCanceladosFiltrados);
	}

	const resultadoOrdenado = ordena(resultado);
	const canceladosOrdenado = ordena(cancelados);

	return { resultadoOrdenado, canceladosOrdenado };
}

function agrupaConta(encomendasFiltradas: any) {
	return encomendasFiltradas.reduce((acc: { [x: string]: number }, item: { date: string | number | Date }) => {
		const date = new Date(item.date);
		const month = date.getMonth() + 1; // O método getMonth() retorna um valor entre 0 e 11, então adicionamos 1 para representar o mês corretamente
		const year = date.getFullYear();
		const key = `${month}/${year}`;

		if (acc[key]) {
			acc[key] += 1; // Incrementa a contagem de pedidos para o grupo existente
		} else {
			acc[key] = 1; // Cria um novo grupo com contagem inicial de 1
		}

		return acc;
	}, {});
}

function agrupaValor(obj: any) {
	return obj.reduce((acc: { [x: string]: any }, item: { date: string | number | Date; valor: any }) => {
		const date = new Date(item.date);
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		const key = `${month}/${year}`;

		if (acc[key]) {
			acc[key] += item.valor; // Soma a quantidade ao grupo existente
		} else {
			acc[key] = item.valor; // Cria um novo grupo com a quantidade inicial
		}

		return acc;
	}, {});
}

function ordena(obj: any) {
	const sortedData: { [key: string]: any } = {};

	Object.keys(obj)
		.sort((keyA, keyB) => {
			const [monthA, yearA] = keyA.split('/').map(Number);
			const [monthB, yearB] = keyB.split('/').map(Number);

			if (yearA !== yearB) {
				return yearA - yearB;
			}

			return monthA - monthB;
		})
		.forEach((key) => {
			sortedData[key] = obj[key];
		});
	return sortedData;
}
