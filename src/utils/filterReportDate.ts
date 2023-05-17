export function filterOrderItemsByDate(orderItems: any[], dInicio: any, dFim: any) {
	const dataInicio = new Date(String(dInicio));
	const dataFim = new Date(String(dFim));

	// Definir as horas e minutos como zero nas datas
	dataInicio.setUTCHours(0, 0, 0, 0);
	dataFim.setUTCHours(0, 0, 0, 0);

	const orderItemsWithDate = orderItems.filter((oi: { date: any }) => {
		const { date } = oi;

		// Criar uma nova data com as horas e minutos definidos como zero
		const orderDate = new Date(date);
		orderDate.setUTCHours(0, 0, 0, 0);

		return orderDate >= dataInicio && orderDate <= dataFim;
	});

	return orderItemsWithDate;
}
