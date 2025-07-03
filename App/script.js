const todoEntryData = todoData();
const entryController = entryControl();
const listController = listControl();

function todoData() {
    return JSON.parse(localStorage.getItem("savedTodoList")) || {
        todoListLength: 0,
        entries: []
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const storage = JSON.parse(localStorage.getItem("savedTodoList"));

    if (storage && storage.entries[0]) {
        todoEntryData.entries.forEach(entry => {
            entryController.createEntry(entry.id, entry.value, entry.isCompleted);
            listController.updateListColors(document.getElementById(entry.element), entry.isCompleted);
        })
    }
})


document.querySelector("#name-input input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        entryController.createEntry(todoEntryData.todoListLength, document.querySelector("#name-input input").value, false, true);
    }
})


function entryControl() {
    return {
        createEntry(id, value, complete, saveElements) {
            const input = document.querySelector("#name-input input");
            const todoContainer = document.getElementById("todoEntries");

            const isTodoCompleted = complete ? "todoComplete" : "todoIncomplete";
            const isTodoTextCompleted = complete ? "todoCompleteText" : "todoIncompleteText";
            const isTodoButtonCompleted = complete ? "incomplete" : "complete";

            if (saveElements) {
                todoEntryData.todoListLength++;
                todoEntryData.entries.push({
                    id: id,
                    value: value,
                    isCompleted: complete,
                    element: `todoEntry${id}`
                })
            }

            todoContainer.insertAdjacentHTML("beforeend", `
                <div id="todoEntry${id}" class="todoEntryContainer ${isTodoCompleted}">
                    <div class="todoInfo">
                        <h2 class="todoNumber">${id}.</h2>
                        <h2 class="todoText ${isTodoTextCompleted}">${value}</h2>
                    </div>
                    
                    <div class="todoControls">
                        <div class="rearrangeContainer">
                            <div class="arrangeUp" onclick="entryController.moveEntry(${id}, 'up')">↑</div>
                            <div class="arrangeDown" onclick="entryController.moveEntry(${id}, 'down')">↓</div>
                        </div>
                        
                        <div class="todoEntryBtns">
                            <div class="delete" onclick="entryController.deleteEntry(${id})">
                                <img src="../Assets/delete.png" alt="">
                            </div>
                            <div class="rename" onclick="entryController.renameEntry(${id})">R</div>
                            <div class="${isTodoButtonCompleted} completeBtn" onclick="entryController.completeEntry(${id})">✓</div>
                        </div>
                    </div>
                </div>
            `);

            if (input.value !== '') {
                input.value = '';
            }

            listController.updateListValues();
        },

        createEntryClick() {
            const input = document.querySelector('#name-input input');

            if (input.value !== '') {
                entryController.createEntry(todoEntryData.todoListLength, input.value, false, true);
            }
        },
        
        getEntryById(ID) {
            let targetEntry;
            todoEntryData.entries.forEach(entry => {
                if (entry.id === ID) {
                    targetEntry = entry;
                }
            })

            return {
                entry: targetEntry,
                element: document.getElementById(targetEntry.element),
                elementID: targetEntry.element,
                isCompleted: targetEntry.isCompleted,
                value: targetEntry.value
            }
        },

        completeEntry(entry) {
            const entryData = entryController.getEntryById(entry);
            const todoInfo = entryData.element.querySelector(".todoInfo>.todoText");
            todoEntryData.entries[entry - 1].isCompleted = !todoEntryData.entries[entry - 1].isCompleted;

            let entryIsCompleted = todoEntryData.entries[entry - 1].isCompleted;
            todoInfo.style.animation = entryIsCompleted ? "complete 0.5s" : "incomplete 0.5s";
            todoInfo.onanimationend = () => {
                listController.updateListColors(entryData.element, entryIsCompleted, true);
                todoInfo.style.animation = '';
            }
        },

        moveEntry(entry, direction) {
            const targetEntry = entryController.getEntryById(entry);
            const targetEntryNumber = parseInt(targetEntry.elementID.split("y")[1]);

            const nextEntry = document.getElementById(`todoEntry${targetEntryNumber - 1}`);
            const lastEntry = document.getElementById(`todoEntry${targetEntryNumber + 1}`);
            const entryHolder = document.getElementById("todoEntries");

            if (direction === "up" && nextEntry) {
                entryHolder.insertBefore(targetEntry.element, nextEntry);
                listController.updateListValues();
            } else if (direction === "down" && lastEntry) {
                entryHolder.insertBefore(targetEntry.element, lastEntry.nextSibling);
                listController.updateListValues();
            }
        },

        shuffleEntries() {
            const entries = document.querySelectorAll(".todoEntryContainer");
            const entryHolder = document.getElementById("todoEntries");

            if (entries[0]) {
                for (let i = 0; i < entries.length; i++) {
                    const randomNumber = Math.floor(Math.random() * entries.length);
                    entryHolder.insertBefore(entries[i], entries[randomNumber]);
                }

                listController.updateListValues();
            }
        },

        renameEntry(entry) {
            const entryElement = entryController.getEntryById(entry);
            const todoInfo = entryElement.element.querySelector(".todoInfo>.todoText");

            todoInfo.contentEditable = true;
            todoInfo.focus();
            todoInfo.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    todoInfo.contentEditable = false;
                    todoEntryData.entries[entry - 1].value = todoInfo.textContent;
                }
            })
        },

        deleteEntry(ID) {
            const entryData = entryController.getEntryById(ID);
            entryData.element.remove();
            todoEntryData.todoListLength--;
            todoEntryData.entries.splice(ID - 1, 1);
            listController.updateListValues();
        }
    }
}



function listControl() {
    return {
        updateListValues() {
            const entryData = todoEntryData.entries;
            const todoEntries = document.querySelectorAll(".todoEntryContainer");
            const todoListNumbers = document.querySelectorAll(".todoNumber");

            for (let i = 0; i < todoEntries.length; i++) {
                const completeBtn = document.querySelectorAll(".completeBtn");
                const renameBtn = document.querySelectorAll(".rename");
                const deleteBtn = document.querySelectorAll(".delete");
                const moveUpBtn = document.querySelectorAll(".arrangeUp");
                const moveDownBtn = document.querySelectorAll(".arrangeDown");

                entryData[i].id = i+1;
                entryData[i].value = todoEntries[i].querySelector(".todoInfo .todoText").textContent;
                entryData[i].element = `todoEntry${i+1}`;
                todoEntries[i].id = `todoEntry${i+1}`;
                todoListNumbers[i].textContent = `${i+1}.`;

                completeBtn[i].onclick = () => entryController.completeEntry(i+1);
                renameBtn[i].onclick = () => entryController.renameEntry(i+1);
                deleteBtn[i].onclick = () => entryController.deleteEntry(i+1);
                moveUpBtn[i].onclick = () => entryController.moveEntry(i+1, "up");
                moveDownBtn[i].onclick = () => entryController.moveEntry(i+1, "down");
            }
        },

        updateListColors(element, isComplete, switchClass) {
            const todoInfo = element.querySelector(".todoInfo>.todoText");
            const todoButton = element.querySelector(".todoControls .completeBtn");

            function switch_class() {
                if (switchClass && isComplete) {
                    todoInfo.classList.replace("todoIncompleteText", "todoCompleteText");
                    todoButton.classList.replace("complete", "incomplete");
                } else if (switchClass && !isComplete) {
                    todoInfo.classList.replace("todoCompleteText", "todoIncompleteText");
                    todoButton.classList.replace("incomplete", "complete");
                }
            }

            todoButton.textContent = isComplete ? "X" : "✓";
            switch_class();
        },

        clearList() {
            const todoEntries = document.querySelectorAll(".todoEntryContainer");
            const todoEntryList = todoEntryData.entries;
            const storage = localStorage.getItem("savedTodoList");

            if (todoEntryList[0]) {
                todoEntryData.todoListLength = 0;
                todoEntryData.entries = [];
                todoEntries.forEach(entry => entry.remove());
            }

            if (storage) {
                localStorage.removeItem("savedTodoList");
            }
        }
    }
}