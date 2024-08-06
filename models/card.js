const path = require('path');
const fs = require('fs');

class Card {
    static async add(course) {
        const card = await Card.fetch();

        const idx = card.courses.findIndex((item) => item.id === course.id);
        const candidate = card.courses[idx];

        if (candidate) {
            candidate.count++;
            card.courses[idx] = candidate;
        } else {
            course.count = 1;
            card.courses.push(course);
        }
        card.price += +course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'card.json'),
                JSON.stringify(card),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    static async fetch() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.join(__dirname, '..', 'data', 'card.json'),
                'utf-8',
                (err, content) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(JSON.parse(content));
                    }
                }
            );
        });
    }

    static async remove(id) {
        // Получаем все карточки обращаясь к "static async fetch"
        const cards = await Card.fetch();
        // ищем индекс карточки по переданному индексу
        const idx = cards.courses.findIndex((item) => item.id === id);
        // определяем course = найденной карточке
        const course = cards.courses[idx];
        // если она одна
        if (course.count === 1) {
            // удаляем ее с помощью метода filter
            // и в cards.courses - оставшиеся курсы
            cards.courses = cards.courses.filter((item) => item.id !== id);
            // если их несколько - уменьшаем к-во у найденной картоки
        } else {
            cards.courses[idx].count--;
        }
        // корректируем общую стоимость курсов
        cards.price -= course.price;
        // наконец, записываем оставшиеся в корзине карточки в файл
        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'card.json'),
                JSON.stringify(cards),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(cards);
                    }
                }
            );
        });
    }
}

module.exports = Card;
