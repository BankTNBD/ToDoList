const taskInput = document.querySelector(".task-input .detail"),
taskSubject = document.querySelector(".task-input .subject"),
taskDate = document.querySelector(".task-input .date"),
filters = document.querySelectorAll(".filters span"),
clearAll = document.querySelector(".clear-btn"),
taskBox = document.querySelector(".task-box");

const url = "http://server.iambanky.com:2000";
//const url = "http://localhost:2000";
let editId,
isEditTask = false,
todos;

window.onload = function() {
    showTodo("all");
};

fetch(url, { method: 'GET'})
.then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
        showTodo("all");
});

if(taskDate.value == "") {
    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    taskDate.value = year + "-" + month + "-" + date;
}

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

function showTodo(filter) {
    if (filter == "completed") {
        filter = 1;
    } else if (filter == "pending") {
        filter = 0;
    }
    let liTag = "";
    if(todos) {
        Array.from(todos).forEach((todo) => {
            let completed = todo.Status == 1 ? "checked" : "";
            if(filter == todo.Status || filter == "all") {
                liTag += `<li class="task">
                            <label for="${todo.ID}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${todo.ID}" ${completed}>
                                <div>
                                    <p>${(todo.Deadline).slice(0, 10)}</p>
                                    <p>${todo.Subject}</p>
                                    <p>${todo.Detail}</p>
                                </div>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${todo.ID}, "${(todo.Deadline).slice(0, 10)}", "${todo.Subject}", "${todo.Detail}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${todo.ID}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
            }
        });
    }
    taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
    let checkTask = taskBox.querySelectorAll(".task");
    !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
    taskBox.offsetHeight >= 300 ? taskBox.classList.add("overflow") : taskBox.classList.remove("overflow");
}
showTodo("all");

function showMenu(selectedTask) {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if(e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

function updateStatus(selectedTask) {
    let taskName = selectedTask.parentElement.lastElementChild;
    if(selectedTask.checked) {
        taskName.classList.add("checked");
        fetch(`${url}/update/${selectedTask.id}/1`)
        .then((response) => response.json())
        .then((result) => {
            todos = JSON.parse(JSON.stringify(result));
        });
    } else {
        taskName.classList.remove("checked");
        fetch(`${url}/update/${selectedTask.id}/0`)
        .then((response) => response.json())
        .then((result) => {
            todos = JSON.parse(JSON.stringify(result));
        });
    }
}

function editTask(taskId, textDate, textSubject, textName) {
    editId = taskId;
    isEditTask = true;
    taskDate.value = textDate;
    taskSubject.value = textSubject;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    let password = prompt("Please enter password:");
    fetch(`${url}/delete/${deleteId}/${password}`)
    .then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
        showTodo(filter);
    });
}

clearAll.addEventListener("click", () => {
    isEditTask = false;
    let password = prompt("Please enter password:");
    if (confirm("Delete all data") == true) {
        fetch(`${url}/clear/${password}`)
        .then((response) => response.json())
        .then((result) => {
            todos = [];
            showTodo();
        });
    }
});

taskInput.addEventListener("keyup", e => {
    let userTaskDate = taskDate.value;
    let userTaskSubject = taskSubject.value.trim();
    let userTaskInput = taskInput.value.trim();
    if(e.key == "Enter" && userTaskInput && userTaskSubject) {
        if(userTaskDate == "") {
            let date_time = new Date();
            let date = ("0" + date_time.getDate()).slice(-2);
            let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
            let year = date_time.getFullYear();
            userTaskDate = year + "-" + month + "-" + date;
        }
        userTaskInput = userTaskInput.replace(/[.\_\~\:\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\"\<\>\%\{\}\|\\\^\`\/\-]/g, '');
        userTaskSubject = userTaskSubject.replace(/[.\_\~\:\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\"\<\>\%\{\}\|\\\^\`\/\-]/g, '');
        if(!isEditTask) {
            todos = !todos ? [] : todos;
            fetch(`${url}/add/${userTaskDate}/${userTaskSubject}/${userTaskInput}`)
            .then((response) => response.json())
            .then((result) => {
                todos = JSON.parse(JSON.stringify(result));
                showTodo(document.querySelector("span.active").id);
            });
        } else {
            isEditTask = false;
            fetch(`${url}/edit/${editId}/${userTaskDate}/${userTaskSubject}/${userTaskInput}`)
            .then((response) => response.json())
            .then((result) => {
                todos = JSON.parse(JSON.stringify(result));
                showTodo(document.querySelector("span.active").id);
            });
        }
        let date_time = new Date();
        let date = ("0" + date_time.getDate()).slice(-2);
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        taskSubject.value = "";
        taskInput.value = "";
        taskDate.value = year + "-" + month + "-" + date;
        showTodo(document.querySelector("span.active").id);
    }
});