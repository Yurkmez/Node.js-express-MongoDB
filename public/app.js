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
// _________________________________

// Здесь мы отправляем к-ду на удаление карточки из корзины
// Находим, где есть селектор с id card
const $card = document.querySelector('#card');
// если есть, а он у нас в файлe "card.hbs",
if ($card) {
    // то мы реализуем процедуру прослушивания
    // события 'click' там, где
    // это происходит  - т.е. кликанье
    // происходит там, где целевой объект
    // имеет класс 'js-remove', а это
    // кнопка "Delete"
    $card.addEventListener('click', (event) => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            // console.log(id);
            fetch('/card/remove/' + id, {
                method: 'delete',
            })
                .then((res) => res.json())
                .then((cards) => {
                    console.log(cards);
                    // Далее надо решать сложную логику:
                    // если карточка удаляется - надо это поле
                    // на странице удалить, если уменьшается
                    // к-во - менять к-во
                    // если корзина опустеет после удаления
                    // то надо показывать сообщение, что корзина
                    // пуста.
                    // По сути, тогда после каждого
                    // удаления надо перерисовывать
                    // всю страницу
                    // Итак
                    // Если в таблице карточки остались
                    if (cards.courses.length) {
                        const html = cards.courses
                            .map((card) => {
                                return `
                            <tr>
                                <td>${card.title}</td>
                                <td>${card.count} </td>
                                <td>${card.price} </td>
                                <td>
                                    <button
                                        class='btn btn-small js-remove'
                                        data-id='${card.id}'
                                    >Delete</button>
                                </td>
                            </tr>
                            `;
                            })
                            .join('');
                        // Здесь очень странное поведение querySelector
                        // Если посмотреть  что внутри селектора tbody  - console.log($card.querySelector('tbody').innerHTML);
                        // то мы увидим <th> ...</th>, т.е. строку с заголовками, хотя эти тэги находятся не внутри "tbody"
                        // Поэтому пришлось использовать querySelectorAll('tbody')[1],
                        // чтобы получить доступ ко 2 элементу (хотя он не второй, а единственный!)
                        $card.querySelectorAll('tbody')[1].innerHTML = html;
                        $card.querySelector('.price').textContent = toCurrency(
                            cards.price
                        );
                        // корзина опустела
                    } else {
                        $card.innerHTML = '<p>Basket is empty</p>';
                    }
                });
        }
    });
}
