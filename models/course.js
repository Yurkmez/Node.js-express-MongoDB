const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { rejects } = require('assert');

class Course {
    constructor(title, price, img) {
        (this.title = title), (this.price = price), (this.img = img);
        this.id = uuidv4();
    }

    toJSON() {
        return {
            title: this.title,
            price: this.price,
            img: this.img,
            id: this.id,
        };
    }
    //
    async save() {
        // Получаем данные из файла (вызов метода getAll)
        const courses = await Course.getAll();
        // Добавляем к ним новый курс (+ вызов метода toJSON)
        // не очень понятна его роль...
        // вероятно "this" - это данные, поступающие от
        //  addCourseRoutes - (const course = new Course(req.body.title, req.body.price, req.body.img);)
        // (course.save();)
        // a toJSON() - структурирует данные?
        courses.push(this.toJSON());

        return new Promise((resolve, reject) => {
            // console.log(courses);
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'data.json'),
                JSON.stringify(courses),
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
    // Статический метод для получения данных из файла (fs, path)
    static getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.join(__dirname, '..', 'data', 'data.json'),
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
}

module.exports = Course;
