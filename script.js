const taskInput = document.querySelector(".task-input input"),
filters = document.querySelectorAll(".filters span"),
clearAll = document.querySelector(".clear-btn"),
taskBox = document.querySelector(".task-box");

const url = "http://server.iambanky.com:2000";
let editId,
isEditTask = false,
todos;

window.onload = function() {
    showTodo("all");
};

fetch(`${url}`).then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
        showTodo("all")
});

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    });
});

function showTodo(filter) {
    /*
    fetch(`${url}`).then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
    });*/
    let liTag = "";
    if(todos) {
        Array.from(todos).forEach((todo, id) => {
            let completed = todo.status == "completed" ? "checked" : "";
            if(filter == todo.status || filter == "all") {
                liTag += `<li class="task">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
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
        fetch(`${url}/update/${selectedTask.id}/completed`)
        .then((response) => response.json())
        .then((result) => {
            todos = JSON.parse(JSON.stringify(result));
        });
        //todos[selectedTask.id].status = "completed";
    } else {
        taskName.classList.remove("checked");
        fetch(`${url}/update/${selectedTask.id}/pending`)
        .then((response) => response.json())
        .then((result) => {
            todos = JSON.parse(JSON.stringify(result));
        });
        //todos[selectedTask.id].status = "pending";
    }
    //localStorage.setItem("todo-list", JSON.stringify(todos))
    fetch(`${url}`)
    .then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
    });
}

function editTask(taskId, textName) {
    editId = taskId;
    isEditTask = true;
    taskInput.value = textName;
    taskInput.focus();
    taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
    isEditTask = false;
    //todos.splice(deleteId, 1);
    fetch(`${url}/delete/${deleteId}`)
    .then((response) => response.json())
    .then((result) => {
        todos = JSON.parse(JSON.stringify(result));
        showTodo(filter);
    });
    //localStorage.setItem("todo-list", JSON.stringify(todos));
}

clearAll.addEventListener("click", () => {
    isEditTask = false;
    //todos.splice(0, todos.length);
    //localStorage.setItem("todo-list", JSON.stringify(todos));
    fetch(`${url}/clear`)
    .then((response) => response.json())
    .then((result) => {
        todos = [];
        showTodo();
    });
});

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if(e.key == "Enter" && userTask) {
        if(!isEditTask) {
            todos = !todos ? [] : todos;
            //let taskInfo = {name: userTask, status: "pending"};
            fetch(`${url}/add/${userTask}`)
            .then((response) => response.json())
            .then((result) => {
                todos = JSON.parse(JSON.stringify(result));
                showTodo(document.querySelector("span.active").id);
            });
            //todos.push(taskInfo);
        } else {
            isEditTask = false;
            fetch(`${url}/edit/${editId}/${userTask}`)
            .then((response) => response.json())
            .then((result) => {
                todos = JSON.parse(JSON.stringify(result));
                showTodo(document.querySelector("span.active").id);
            });
            //todos[editId].name = userTask;
        }
        taskInput.value = "";
        //localStorage.setItem("todo-list", JSON.stringify(todos));
        showTodo(document.querySelector("span.active").id);
    }
});