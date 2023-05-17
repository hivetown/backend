export function handleReportEvolution(orderItems: any[], opcao: string) {
	// console.log('orderItems', orderItems);
	// console.log('opcao', opcao);

	// let resultado;

	// para o numeroEncomendas
	const encomendas: any[] = [];
	const totalProdutos: any[] = [];
	const comprasTotais: any[] = [];

	if (opcao === 'numeroEncomendas') {
		for (const oi of orderItems) {
			encomendas.push({ orderId: oi.orderItem.order.id, date: oi.date });
		}

		const encomendasFiltradas = encomendas.filter((encomenda, index, self) => self.findIndex((t) => t.orderId === encomenda.orderId) === index);

		console.log('encomendas filtradas', agrupaNumeroEncomendas(encomendasFiltradas));
	} else if (opcao === 'totalProdutos') {
		for (const oi of orderItems) {
			totalProdutos.push({ valor: oi.orderItem.quantity, date: oi.date });
		}

		console.log('totalProdutos', agrupaRestantes(totalProdutos));
	} else if (opcao === 'comprasTotais') {
		for (const oi of orderItems) {
			comprasTotais.push({ valor: oi.orderItem.quantity * oi.orderItem.price, date: oi.date });
		}

		console.log('comprasTotais', agrupaRestantes(comprasTotais));
	}
}

function agrupaNumeroEncomendas(encomendasFiltradas: any) {
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

function agrupaRestantes(obj: any) {
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
