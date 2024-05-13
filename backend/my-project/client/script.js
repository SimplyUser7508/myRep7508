document.addEventListener('DOMContentLoaded', async () => {
    let token = localStorage.getItem('token');
    let currentFolder = 0;
    const taskForm = document.getElementById('taskForm');
    let sortType = JSON.parse(localStorage.getItem('sortType'));
    let userId = 0;

    if (token && token !== 'undefined') {
        try {
            const response = await fetch('https://to-do-listok.onrender.com/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
                
            if (!response.ok) {
                throw new Error('Неверный токен');
            }
            
            const data = await response.json();
            userId = data;
            taskForm.style.display = 'none';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('editButton').style.display = 'none';
            document.querySelector('button.dropbtn').style.display = 'none';
            document.getElementById('folderForm').style.display = 'block';
            document.getElementById('myFolders').style.display = 'none';
            loadFolders(userId);
        } catch (error) {
            console.error('Ошибка при проверке аутентификации:', error);
            alert('Для просмотра задач необходимо войти в систему');
        }
    } else {
        const response = await fetch('https://to-do-listok.onrender.com', {
        });
        taskForm.style.display = 'none';
        document.getElementById('myFolders').style.display = 'none';
        document.getElementById('folderForm').style.display = 'none';
        document.querySelector('button.dropbtn').style.display = 'none';
        document.getElementById('buttonsBlock').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'block';
    }

    // Обработчик события отправки формы
    document.getElementById('submitButton').addEventListener('click', function (event) {
        event.preventDefault();
        if (currentFolder !== 0) {
            const taskInput = document.getElementById('taskInput');
            const descriptionInput = document.getElementById('descriptionInput');
            const dateInput = document.getElementById('dateInput').value;
            const timeInput = document.getElementById('timeInput').value;
            let deadline = null;
            
            if (dateInput !== "" && timeInput !== "") {
                const localDeadline = new Date(dateInput + 'T' + timeInput);
                localDeadline.setTime(localDeadline.getTime() + 6 * 60 * 60 * 1000);
                deadline = localDeadline.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
            }

            const taskName = taskInput.value.trim();
            const description = descriptionInput.value.trim();

            if (taskName !== '') {
                addTask(taskName, description, deadline, currentFolder);
                taskInput.value = '';
                descriptionInput.value = ''; 
            }
        } else {
            const folderInput = document.getElementById('folderInput');
            const folderName = folderInput.value.trim();
            if (folderName !== '') {
                addFolder(userId, folderName);
                folderInput.value = '';
            }
        }
    });

    document.getElementById('myFolders').addEventListener('click', function (event) {
        event.preventDefault();
        taskForm.style.display = 'none';
        document.getElementById('dropbtn').style.display = 'none';
        document.getElementById('folderForm').style.display = 'block';
        document.getElementById('folderList').style.display = 'block';
        currentFolder = 0;
        loadFolders(userId);
    });

    const dropdownItems = document.querySelectorAll('.dropdown-content a');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const selectedSort = item.textContent;
            localStorage.setItem('sortType', JSON.stringify(selectedSort));
            switch(selectedSort) {
                case 'lexicographic':
                    loadTasks(currentFolder, 'lexicographic');
                    break;
                case 'deadline':
                    loadTasks(currentFolder, 'deadline');
                    break;
                default:
                    loadTasks(currentFolder, 'default');
                    break;
            }
        });
    });
    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('https://to-do-listok.onrender.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if(data == 'undefined') return alert('Аккаунт не активирован');;
            localStorage.setItem('token', data.token);
            token = localStorage.getItem('token');
            if (token == 'undefined'){
                alert('Неверное имя пользователя или пароль');
            } else {
                alert('Вы успешно вошли');
            }
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при входе:', error);
            alert('Ошибка при входе');
        }
    });

    // Обработка формы регистрации
    document.getElementById('registerForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const yourEmail = document.getElementById('yourEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        try {
            const response = await fetch('https://to-do-listok.onrender.com/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: yourEmail, password: newPassword })
            });
            alert('Пользователь успешно зарегистрирован');
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Ошибка при регистрации');
        }
    });

    // Функция для загрузки папок с сервера
    function loadFolders(userId) {
        document.getElementById('taskList').style.display = 'none';
        document.getElementById('myFolders').style.display = 'none';
        fetch(`https://to-do-listok.onrender.com/folders/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(folders => {
                const folderList = document.getElementById('folderList');
                folderList.innerHTML = '';
                folders.forEach(folder => {
                    const li = document.createElement('li');
                    const folderInfo = document.createElement('div');

                    const folderButton = document.createElement('button');
                    folderButton.textContent = `Folder: ${folder.folder_name}`;
                    folderButton.classList.add('folder'); // Добавляем класс "folder"
                    folderButton.addEventListener('click', () => {
                        loadTasks(folder.id, sortType);
                    });
                    folderInfo.appendChild(folderButton);
                    li.appendChild(folderInfo);
                    folderList.appendChild(li);
    
                    const trashIcon = document.createElement('span');
                    trashIcon.classList.add('folder-delete');
                    trashIcon.textContent = '🗑';
                    trashIcon.addEventListener('click', () => {
                        deleteFolder(folder.id);
                    });
                    folderInfo.appendChild(trashIcon);

                    const editIcon = document.createElement('span');
                    editIcon.classList.add('folder-edit');
                    editIcon.textContent = '✎';
                    editIcon.addEventListener('click', () => {
                        handleEditFolder(folder.id, folder.folder_name);
                    });
                    folderInfo.appendChild(editIcon);
    
                    li.appendChild(folderInfo);
                    folderList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Функция для загрузки задач с сервера
    function loadTasks(folderId, sortType) {
        document.getElementById('taskList').style.display = 'block';
        if(sortType == null) sortType = 'default';
        currentFolder = folderId;
        taskForm.style.display = 'block';
        document.getElementById('folderForm').style.display = 'none';
        document.getElementById('folderList').style.display = 'none';
        document.getElementById('myFolders').style.display = 'block';
        document.querySelector('button.dropbtn').style.display = 'block';
        fetch(`https://to-do-listok.onrender.com/tasks/${folderId}/${sortType}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('taskList');
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    const taskInfo = document.createElement('div');
    
                    const taskNameElement = document.createElement('p');
                    taskNameElement.textContent = `Task Name: ${task.task_name}`;
                    taskInfo.appendChild(taskNameElement);

                    if(task.description){
                        const descriptionElement = document.createElement('p');
                        descriptionElement.textContent = `Description: ${task.description}`;
                        taskInfo.appendChild(descriptionElement);
                    }

                    if(task.deadline){
                        const deadlineElement = document.createElement('p');
                        deadlineElement.textContent = `Deadline: ${formatDeadline(task.deadline)}`;
                        taskInfo.appendChild(deadlineElement);
                    }
    
                    const trashIcon = document.createElement('span');
                    trashIcon.classList.add('task-delete');
                    trashIcon.textContent = '🗑';
                    trashIcon.addEventListener('click', () => {
                        deleteTask(task.id);
                    });
                    taskInfo.appendChild(trashIcon);

                    const editIcon = document.createElement('span');
                    editIcon.classList.add('task-edit');
                    editIcon.textContent = '✎';
                    editIcon.addEventListener('click', () => {
                        handleEditTask(task.id, task.task_name, task.description, task.deadline);
                    });
                    taskInfo.appendChild(editIcon);
    
                    li.appendChild(taskInfo);
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    // Функция для удаления задачи
    function deleteTask(taskId) {
        fetch(`https://to-do-listok.onrender.com/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Результат запроса
        })
        .then(() => {
            loadTasks(currentFolder, sortType); // После удаления задачи перезагружаем список задач
        })
        .catch(error => console.error('Ошибка при удалении задачи:', error));
    }

     // Функция для удаления задачи
     function deleteFolder(folderId) {
        fetch(`https://to-do-listok.onrender.com/folders/${folderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }
            return response.text();
        })
        .then(data => {
            console.log(data);
        })
        .then(() => {
            loadFolders(userId);
        })
        .catch(error => console.error('Ошибка при удалении задачи:', error));
    }
    
    // Функция для редактирования задачи
    function editTask(taskId, newName, newDescription, newDeadline) {
        document.getElementById('submitButton').style.display = 'block';
        document.getElementById('editButton').style.display = 'none';
        fetch(`https://to-do-listok.onrender.com/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                task_name: newName,
                description: newDescription,
                deadline: newDeadline,
                folderId: currentFolder
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Результат запроса
            loadTasks(currentFolder, sortType); // После редактирования задачи перезагружаем список задач
        })
        .catch(error => console.error('Ошибка при редактировании задачи:', error));
    }

    // Функция для обработки редактирования задачи
    function handleEditTask(taskId, task_name, description) {
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('editButton').style.display = 'block';
        const taskInput = document.getElementById('taskInput');
        const descriptionInput = document.getElementById('descriptionInput');

        // Заполнение полей формы данными текущей задачи
        taskInput.value = task_name;
        descriptionInput.value = description;

        // Обработчик события отправки формы с обновленными данными
        document.getElementById('editButton').addEventListener('click', () => {
            const newTaskName = taskInput.value.trim();
            const newDescription = descriptionInput.value.trim();
            const dateInput = document.getElementById('dateInput').value;
            const timeInput = document.getElementById('timeInput').value;
            let newDeadline = null;
            if (dateInput !== "" && timeInput !== "") {
                const localDeadline = new Date(dateInput + 'T' + timeInput);
                localDeadline.setTime(localDeadline.getTime() + 6 * 60 * 60 * 1000);
                newDeadline = localDeadline.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
            }
            if (newTaskName !== '') {
                editTask(taskId, newTaskName, newDescription, newDeadline);
                // Очистка полей формы после редактирования
                taskInput.value = '';
                descriptionInput.value = ''; 
            }
        });
    }

    // Функция для редактирования папки
    function editFolder(folderId, newName) {
        document.getElementById('submitButton').style.display = 'block';
        document.getElementById('editButton').style.display = 'none';
        fetch(`https://to-do-listok.onrender.com/folders/${folderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                folder_name: newName,
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Результат запроса
            loadFolders(userId); // После редактирования задачи перезагружаем список задач
        })
        .catch(error => console.error('Ошибка при редактировании задачи:', error));
    }

    // Функция для обработки редактирования папки
    function handleEditFolder(folderId, folder_name) {
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('editButton').style.display = 'block';
        const folderInput = document.getElementById('folderInput');

        // Заполнение полей формы данными текущей папки
        folderInput.value = folder_name;

        // Обработчик события отправки формы с обновленными данными
        document.getElementById('editButton').addEventListener('click', () => {
            const newFolderName = folderInput.value.trim();
            if (newFolderName !== '') {
                editFolder(folderId, newFolderName);
                // Очистка полей формы после редактирования
                folderInput.value = '';
            }
        });
    }


    // Функция для добавления задачи на сервер
    function addTask(taskName, description, deadline) {
    //'2024-04-07 12:00:00'; // Пример временного значения для демонстрации
    fetch(`https://to-do-listok.onrender.com/tasks/${currentFolder}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            task_name: taskName,
            description: description,
            deadline: deadline,
            folderId: currentFolder 
            })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Результат запроса
        })
        .then(() => {
            loadTasks(currentFolder, sortType); // После добавления задачи перезагружаем список задач
        })
        .catch(error => console.error('Ошибка при добавлении задачи:', error));
    }

    // Функция для добавления задачи на сервер
    function addFolder(userId, folderName) {
        //'2024-04-07 12:00:00'; // Пример временного значения для демонстрации
        fetch(`https://to-do-listok.onrender.com/folders/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            folder_name: folderName,
            })
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log(data); // Результат запроса
        })
        .then(() => {
            loadFolders(userId); // После добавления задачи перезагружаем список задач
        })
        .catch(error => console.error('Ошибка при добавлении папки:', error));
    }

    function formatDeadline(deadline) {
        const date = new Date(deadline); // Преобразование строки в объект Date
        const formattedDate = date.toISOString().replace('T', ' ').slice(0, 16); // Форматирование даты
        return formattedDate;
    }
});
