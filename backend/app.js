//app.js
const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const cors = require('cors');
const app = express();
const port = config.port;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


app.use(express.json());
app.use(cors());

// Конфигурация подключения к базе данных
const dbConnection = mysql.createConnection(config.db.mysql);

// Подключение к базе данных
dbConnection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключение к базе данных успешно установлено');
});

// Получение всех задач
app.get('/getTasks/:userId', (req, res) => {
    const userId = req.params.userId;
    const sortBy = req.query.sortBy || 'default';
    let sqlQuery = '';

    switch (sortBy) {
        case 'deadline':
            sqlQuery =
                `SELECT id,
                    task_name,
                    description,
                    deadline
                 FROM Tasks
                 WHERE user = '${userId}'
                 ORDER BY deadline ASC`;
            break;
        case 'lexicographic':
            sqlQuery =
                `SELECT id,
                    task_name,
                    description,
                    deadline
                 FROM Tasks
                 WHERE user = '${userId}'
                 ORDER BY task_name ASC`;
            break;
        case 'default':
        default:
            sqlQuery =
                `SELECT id,
                    task_name,
                    description,
                    deadline
                 FROM Tasks
                 WHERE user = '${userId}'
                 ORDER BY last_change DESC`;
            break;
    }

    dbConnection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Ошибка  выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Результаты запроса:', results);
        res.json(results);
    });
});

// Добавление задачи
app.post('/addTask', (req, res) => {
    const taskName = req.body.taskName;
    const description = req.body.description;
    const deadline = req.body.deadline;
    const userId = req.body.userId;

    if (!taskName) {
        res.status(400).send('Не указано имя задачи');
        return;
    }

    let sqlQuery = `INSERT INTO Tasks (task_name, description, deadline, last_change, user)
                        VALUES ('${taskName}', '${description}', '${deadline}', NOW(), ${userId})`;

    if (!deadline) {
        sqlQuery = `INSERT INTO Tasks (task_name, description, deadline, last_change, user)
                        VALUES ('${taskName}', '${description}', ${deadline}, NOW(), ${userId})`;
    }

    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Запись успешно добавлена в таблицу Tasks');
        res.send('Запись успешно добавлена в таблицу Tasks');
    });
});

// Удаление задачи
app.delete('/deleteTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;

    const sqlQuery = `DELETE FROM Tasks WHERE id = ${taskId}`;
    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        console.log('Задача успешно удалена из таблицы tasks');
        res.send('Задача успешно удалена из таблицы tasks');
    });
});

// Метод для редактирования задачи  
app.put('/editTask/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    const { newName, newDescription, newDeadline } = req.body;

    if (!newName) {
        return res.status(400).json({ error: 'Не указаны новые данные' });
    }

    let sqlQuery = `UPDATE Tasks SET task_name = '${newName}',
        description = '${newDescription}', deadline = '${newDeadline}', last_change = NOW() WHERE id = ${taskId}`;
    if (!newDeadline) {
        sqlQuery = `UPDATE Tasks SET task_name = '${newName}',
            description = '${newDescription}', deadline = ${newDeadline}, last_change = NOW() WHERE id = ${taskId}`;
    }
    dbConnection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ' + err.stack);
            res.status(500).send('Ошибка: задача не отредактирована');
            return;
        }
        console.log('Задача успешно отредактирована');
        res.status(200).json({ message: 'Задача успешно отредактирована' });
    });
});

app.post('/tablesCreate', async (req, res) => {
    const sqlQuery1 = `CREATE TABLE IF NOT EXISTS Users (
                          user_id INT AUTO_INCREMENT PRIMARY KEY,
                          email VARCHAR(255) UNIQUE NOT NULL,
                          password VARCHAR(255) NOT NULL
                       )`;

    const sqlQuery2 = `CREATE TABLE IF NOT EXISTS Tasks (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          task_name VARCHAR(50) NOT NULL,
                          description VARCHAR(1048),
                          deadline DATETIME,
                          last_change DATETIME,
                          user INT NOT NULL,
                          FOREIGN KEY (user) REFERENCES Users (user_id) ON DELETE CASCADE
                       )`;

dbConnection.query(sqlQuery1, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса 1: ' + err.stack);
            res.status(500).send('Ошибка создания таблицы Users');
            return;
        }
        console.log('Таблица Users успешно создана');

        // Запрос для создания таблицы Tasks
        dbConnection.query(sqlQuery2, (err, result) => {
            if (err) {
                console.error('Ошибка выполнения запроса 2: ' + err.stack);
                res.status(500).send('Ошибка создания таблицы Tasks');
                return;
            }
            console.log('Таблица Tasks успешно создана');
            res.status(200).json({ message: 'Таблицы успешно созданы' });
        });
    });
});

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        // Сохранение пользователя в базе данных
        dbConnection.query(
            `INSERT INTO Users (email, password) VALUES ('${email}', '${hashedPassword}')`,
            (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ' + err.stack);
                    res.status(500).send('Ошибка сервера');
                    return;
                }
                console.log('Пользователь успешно зарегистрирован');
                res.status(201).send('Пользователь успешно зарегистрирован');
            }
        );
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Вход пользователя
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Поиск пользователя в базе данных
        dbConnection.query(
            `SELECT * FROM Users WHERE email = '${email}'`,
            async (err, results) => {
                if (err) {
                    console.error('Ошибка выполнения запроса: ' + err.stack);
                    res.status(500).send('Ошибка сервера');
                    return;
                }
                if (results.length === 0) {
                    res.status(401).send('Неверные учетные данные');
                    return;
                }
                const user = results[0];
                // Проверка пароля
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    res.status(401).send('Неверные учетные данные');
                    return;
                }
                // Генерация JWT токена
                const token = jwt.sign({ email: user.email }, config.jwtSecret);
                res.status(200).json({ token });
            }
        );
    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Проверка аутентификации с использованием JWT
app.get('/profile', async (req, res) => {
    // Получение токена из заголовка Authorization
    const token = req.headers.authorization.split(' ')[1];
    try {
        // Проверка токена и декодирование
        const decoded = jwt.verify(token, config.jwtSecret);
        const email = decoded.email;
        const sqlQuery = `SELECT user_id FROM Users WHERE email = '${email}'`;

        // Выполнение запроса к базе данных
        const results = await new Promise((resolve, reject) => {
            dbConnection.query(sqlQuery, (error, results) => {
                if (error) {
                    console.error('Ошибка при выполнении запроса:', error);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });

        const userId = results[0].user_id;
        res.status(200).json({ userId: userId });
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(401).send('Неверный токен');
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
/*
const sqlQuery = `CREATE TABLE Folders (
                            folder_id INT AUTO_INCREMENT PRIMARY KEY,
                            folder_name VARCHAR(50) NOT NULL
                          );

                          CREATE TABLE Tasks (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            task_name VARCHAR(50) NOT NULL,
                            description VARCHAR(255),
                            folder INT NOT NULL,
                            deadline DATETIME,
                            last_change DATETIME,
                            FOREIGN KEY (folder) REFERENCES Folders (folder_id) ON DELETE CASCADE
                          );

                          CREATE TABLE Users (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              email VARCHAR(255) UNIQUE NOT NULL,
                              password VARCHAR(255) NOT NULL
                          );`
 */