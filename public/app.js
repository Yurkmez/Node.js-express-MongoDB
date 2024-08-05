// Client script
// Форматирование вывода валют

const toCurrency = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
    }).format(price);
};

document.querySelectorAll('.price').forEach((node) => {
    node.textContent = toCurrency(node.textContent);
});
