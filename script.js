let db;

function initDB() {
  const request = indexedDB.open("PasswordManagerDB", 2); // Обновляем версию базы данных

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("passwords")) {
      const objectStore = db.createObjectStore("passwords", { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("service", "service", { unique: false });
      objectStore.createIndex("login", "login", { unique: false });
      objectStore.createIndex("password", "password", { unique: false });
    } else {
      // Обновление структуры объекта, если база уже создана
      const objectStore = event.target.transaction.objectStore("passwords");
      if (!objectStore.indexNames.contains("login")) {
        objectStore.createIndex("login", "login", { unique: false });
      }
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    loadPasswords();
  };

  request.onerror = function (event) {
    console.error("Ошибка при открытии базы данных", event);
  };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generatePassword() {
	const lengthpass = document.getElementById("lengthpassword").value;
	const symbolls = document.getElementById("symbolls").value;
  
  let mas2 = new Array(lengthpass);
  let mas3 = new Array(lengthpass);
  let text = '';
  let text1 = '';
  text1 = document.getElementById("symbolls").value;
  let lenn = text1.length;


  for (let i = 0; i < lenn; i++)
  {
    mas2[i] = document.getElementById('symbolls').value[i];
  }
  for (let j = 0; j < lengthpass; j++)
  {
    let bb = getRandomInt(lenn);
    mas3[j] = mas2[bb];
    text = text + mas3[j]
  }
  document.getElementById("pass").value = text;
  //getElementById("pass").value = text;

}



function addPassword() {
  const service = document.getElementById("service").value;
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  if (service && login && password) {
    const transaction = db.transaction(["passwords"], "readwrite");
    const objectStore = transaction.objectStore("passwords");
    const request = objectStore.add({ service, login, password });

    request.onsuccess = function () {
      document.getElementById("service").value = '';
      document.getElementById("login").value = '';
      document.getElementById("password").value = '';
      loadPasswords();
    };

    request.onerror = function () {
      alert("Не удалось добавить пароль");
    };
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
}

function loadPasswords() {
  const passwordList = document.getElementById("passwordList");
  passwordList.innerHTML = '';

  const transaction = db.transaction(["passwords"], "readonly");
  const objectStore = transaction.objectStore("passwords");

  objectStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const passwordItem = document.createElement("div");
      passwordItem.className = "password-item";
      passwordItem.innerHTML = `
        <span>Сервис: ${cursor.value.service}</span>
        <span>Логин: ${cursor.value.login}</span>
        <input type="password" value="${cursor.value.password}" readonly>
        <div class="actions">
          <button onclick="copyPassword(${cursor.value.id})">Копировать</button>
          <button onclick="deletePassword(${cursor.value.id})">Удалить</button>
        </div>
      `;
      passwordList.appendChild(passwordItem);
      cursor.continue();
    }
  };
}

function copyPassword(id) {
  const transaction = db.transaction(["passwords"], "readonly");
  const objectStore = transaction.objectStore("passwords");
  const request = objectStore.get(id);

  request.onsuccess = function () {
    const password = request.result.password;
    navigator.clipboard.writeText(password).then(() => {
      alert("Пароль скопирован!");
    }).catch(err => {
      alert("Не удалось скопировать пароль.");
    });
  };
}

function deletePassword(id) {
  const transaction = db.transaction(["passwords"], "readwrite");
  const objectStore = transaction.objectStore("passwords");
  const request = objectStore.delete(id);

  request.onsuccess = function () {
    loadPasswords();
  };
}

window.onload = initDB;
