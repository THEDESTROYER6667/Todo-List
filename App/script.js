"use strict";
const todoListData = dataControl();
const bundle = packages();

setInterval(() => localStorage.setItem("savedTodoList", JSON.stringify(todoListData)), 10000);

document.addEventListener("DOMContentLoaded", () => {
    if (todoListData.length > 0) {
        todoListData.forEach(list => bundle.listController.createListButton(list.name));
    }
});


function packages() {
    return {
        UIController: UIControl(),
        entryController: entryControl(),
        listController: listControl()
    }
}


function dataControl() {
    return JSON.parse(localStorage.getItem("savedTodoList")) || [];
}


function UIControl() {
    return {
        switchScreens(screen) {
            const sections = document.querySelectorAll(".section");
            sections.forEach(section => section.style.display = "none");
            document.getElementById(screen).style.display = "block";
        },

        editUIText(elem, callback) {
            elem.contentEditable = true;
            elem.focus();

            function call(e) {
                if (e.key === "Enter") {
                    callback();
                    elem.contentEditable = false;
                    elem.removeEventListener("keypress", call);
                }
            }

            elem.addEventListener("keypress", call);
        },

        gotoListSelection() {
            bundle.UIController.switchScreens("todoListSelection");
            const title =  document.querySelector("#title>h2");
            const existingEntries = document.querySelectorAll(".todoEntryContainer");
            title.textContent = '';

            if (existingEntries.length > 0) {
                existingEntries.forEach(entry => entry.remove());
            }
        }
    }
}


function listControl() {
    return {
        createListButton(text) {
            const todoListHolder = document.getElementById("todoListHolder");
            const listBtn = document.createElement("div");
            listBtn.className = "listBtn";
            todoListHolder.prepend(listBtn);

            listBtn.insertAdjacentHTML("beforeend", `
                <div class="listText">
                    <h2>${text || ''}</h2>
                </div>
                <div class="listControls">
                    <div class="listControlBtn list-delete" onclick="bundle.listController.deleteList(this)">
                        <img src="../Assets/delete.png" alt="">
                    </div>
                    <div class="listControlBtn list-rename" onclick="bundle.listController.renameList(this)">R</div>
                    <div class="listControlBtn list-go">→</div>
                </div>
            `);

            if (todoListData.length > 0) {
                const listText = listBtn.querySelector("h2");
                const goBtn = listBtn.querySelector(".listControls .list-go");
                goBtn.onclick = () => bundle.listController.loadList(bundle.listController.getListByName(listText.textContent));
            }

            return listBtn;
        },


        createNewList() {
            const listBtn = bundle.listController.createListButton();
            const listText = listBtn.querySelector("h2");

            bundle.UIController.editUIText(listText, () => {
                todoListData.push({
                    name: listText.textContent,
                    active: false,
                    todoListLength: 0,
                    entries: [],
                });

                const goBtn = listBtn.querySelector(".listControls .list-go");
                goBtn.onclick = () => bundle.listController.loadList(bundle.listController.getListByName(listText.textContent));
            })
        },


        renameList(list) {
            const targetList = list.closest(".listBtn");
            const listText = targetList.querySelector("h2");
            const activeList = bundle.listController.getListByName(listText.textContent);
            bundle.UIController.editUIText(listText, () => activeList.name = listText.textContent)
        },


        deleteList(list) {
            const targetListElem = list.closest(".listBtn");
            const targetList = bundle.listController.getListByName(targetListElem.querySelector("h2").textContent);
            const index = todoListData.indexOf(targetList);

            if (index > -1) {
                targetListElem.remove();
                todoListData.splice(index, 1);
            }
        },


        getActiveList() {
            let targetedList;
            for (let i = 0; i < todoListData.length; i++) {
                if (todoListData[i].active) {
                    targetedList = i;
                }
            }

            return todoListData[targetedList];
        },


        getListByName(name) {
            let targetedList;
            for (let i = 0; i < todoListData.length; i++) {
                if (todoListData[i].name.toLowerCase() === name.toLowerCase()) {
                    targetedList = i;
                }
            }

            return todoListData[targetedList];
        },


        updateTrueValues(list) {
            todoListData.forEach(list => list.active = false);
            list.active = true;
        },


        loadList(list) {
            const existingEntries = document.querySelectorAll(".todoEntryContainer");
            const title = document.querySelector("#title h2");
            bundle.UIController.switchScreens("todoEntryWrapper");
            bundle.listController.updateTrueValues(list);
            title.textContent = list.name;

            if (existingEntries.length > 0) {
                existingEntries.forEach(entry => entry.remove());
            }

            if (list.entries.length > 0) {
                list.entries.forEach(entry => bundle.entryController.createEntry(entry.id, entry.value, entry.isCompleted, false));
            }
        },


        updateListValues() {
            const entryData = bundle.listController.getActiveList().entries;
            const todoEntries = document.querySelectorAll(".todoEntryContainer");
            const todoListNumbers = document.querySelectorAll(".todoNumber");

            if (todoEntries.length > 0) {
                for (let i = 0; i < todoEntries.length; i++) {
                    const completeBtn = document.querySelectorAll(".completeBtn");
                    completeBtn[i].onclick = () => bundle.entryController.completeEntry(i+1);

                    const renameBtn = document.querySelectorAll(".rename");
                    renameBtn[i].onclick = () => bundle.entryController.renameEntry(i+1);

                    const deleteBtn = document.querySelectorAll(".delete");
                    deleteBtn[i].onclick = () => bundle.entryController.deleteEntry(i+1);

                    const moveUpBtn = document.querySelectorAll(".arrangeUp");
                    moveUpBtn[i].onclick = () => bundle.entryController.moveEntry(i+1, "up");

                    const moveDownBtn = document.querySelectorAll(".arrangeDown");
                    moveDownBtn[i].onclick = () => bundle.entryController.moveEntry(i+1, "down");

                    entryData[i].id = i+1;
                    entryData[i].value = todoEntries[i].querySelector(".todoInfo .todoText").textContent;
                    entryData[i].element = `todoEntry${i+1}`;
                    todoEntries[i].id = `todoEntry${i+1}`;
                    todoListNumbers[i].textContent = `${i+1}.`;
                }
            }
        },

        updateListColors(element, isComplete, switchClass) {
            const todoInfo = element.querySelector(".todoInfo>.todoText");
            const todoButton = element.querySelector(".todoControls .completeBtn");

            function switch_class() {
                if (switchClass && isComplete) {
                    todoInfo.classList.replace("todoIncompleteText", "todoCompleteText");
                    todoButton.classList.replace("complete", "incomplete");
                }

                else if (switchClass && !isComplete) {
                    todoInfo.classList.replace("todoCompleteText", "todoIncompleteText");
                    todoButton.classList.replace("incomplete", "complete");
                }
            }

            console.log(isComplete);
            todoButton.textContent = isComplete ? "X" : "✓";
            switch_class();
        },


        clearList() {
            const todoEntries = document.querySelectorAll(".todoEntryContainer");
            let todoList = bundle.listController.getActiveList();

            if (todoList.entries.length > 0) {
                todoList.todoListLength = 0;
                todoList.entries = [];
                todoEntries.forEach(entry => entry.remove());
            }
        }
    }
}


function entryControl() {
    return {
        createEntry(id, value, complete, saveElements) {
            const input = document.querySelector("#name-input input");
            const todoContainer = document.getElementById("todoEntries");

            const isTodoCompleted = complete ? "todoComplete" : "todoIncomplete";
            const isTodoTextCompleted = complete ? "todoCompleteText" : "todoIncompleteText";
            const isTodoButtonCompleted = complete ? "incomplete" : "complete";

            if (saveElements) {
                bundle.listController.getActiveList().todoListLength++;
                bundle.listController.getActiveList().entries.push({
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
                            <div class="arrangeUp" onclick="bundle.entryController.moveEntry(${id}, 'up')">↑</div>
                            <div class="arrangeDown" onclick="bundle.entryController.moveEntry(${id}, 'down')">↓</div>
                        </div>
                        
                        <div class="todoEntryBtns">
                            <div class="delete" onclick="bundle.entryController.deleteEntry(${id})">
                                <img src="../Assets/delete.png" alt="">
                            </div>
                            <div class="rename" onclick="bundle.entryController.renameEntry(${id})">R</div>
                            <div class="${isTodoButtonCompleted} completeBtn" onclick="bundle.entryController.completeEntry(${id})">${complete ? 'X' : '✓'}</div>
                        </div>
                    </div>
                </div>
            `);

            if (input.value !== '') {
                input.value = '';
            }

            bundle.listController.updateListValues();
        },


        createEntryClick() {
            const input = document.querySelector('#name-input input');
            if (input.value !== '') {
                bundle.entryController.createEntry(0, input.value, false, true);
            }
        },


        getEntryById(ID) {
            const activeList = bundle.listController.getActiveList();
            let targetEntry;

            for (let i = 0; i < activeList.entries.length; i++) {
                if (activeList.entries[i].id === ID) {
                    targetEntry = i;
                }
            }

            return activeList.entries[targetEntry];
        },


        completeEntry(entry) {
            const entryData = bundle.entryController.getEntryById(entry);
            const entryElement = document.getElementById(entryData.element);
            const todoInfo = entryElement.querySelector(".todoInfo>.todoText");
            entryData.isCompleted = !entryData.isCompleted;

            todoInfo.style.animation = entryData.isCompleted ? "complete 0.5s" : "incomplete 0.5s";
            todoInfo.onanimationend = () => {
                bundle.listController.updateListColors(entryElement, entryData.isCompleted, true);
                todoInfo.style.animation = '';
            }
        },


        moveEntry(entry, direction) {
            const targetEntry = bundle.entryController.getEntryById(entry);
            const entryElement = document.getElementById(targetEntry.element);
            const targetEntryNumber = parseInt(targetEntry.element.split("y")[1]);

            const nextEntry = document.getElementById(`todoEntry${targetEntryNumber - 1}`);
            const lastEntry = document.getElementById(`todoEntry${targetEntryNumber + 1}`);
            const entryHolder = document.getElementById("todoEntries");

            if (direction === "up" && nextEntry) {
                entryHolder.insertBefore(entryElement, nextEntry);
                bundle.listController.updateListValues();
            }

            else if (direction === "down" && lastEntry) {
                entryHolder.insertBefore(entryElement, lastEntry.nextSibling);
                bundle.listController.updateListValues();
            }
        },


        shuffleEntries() {
            const entries = document.querySelectorAll(".todoEntryContainer");
            const entryHolder = document.getElementById("todoEntries");

            if (entries.length > 0) {
                for (let i = 0; i < entries.length; i++) {
                    const randomNumber = Math.floor(Math.random() * entries.length);
                    entryHolder.insertBefore(entries[i], entries[randomNumber]);
                }

                bundle.listController.updateListValues();
            }
        },


        renameEntry(entry) {
            const targetEntry = bundle.entryController.getEntryById(entry);
            const entryElement = document.getElementById(targetEntry.element);
            const todoInfo = entryElement.querySelector(".todoInfo>.todoText");
            bundle.UIController.editUIText(todoInfo, () => targetEntry.value = todoInfo.textContent)
        },


        deleteEntry(ID) {
            const activeList = bundle.listController.getActiveList();
            const targetEntry = bundle.entryController.getEntryById(ID);
            const entryElement = document.getElementById(targetEntry.element);
            const index = bundle.listController.getActiveList().entries.indexOf(targetEntry);

            if (index > -1) {
                entryElement.remove();
                activeList.todoListLength--;
                activeList.entries.splice(index, 1);
                bundle.listController.updateListValues();
            }
        }
    }
}


document.querySelector("#name-input input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        bundle.entryController.createEntry(
            0, document.querySelector("#name-input input").value,
            false, true
        );
    }
});