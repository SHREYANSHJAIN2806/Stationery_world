let cart = [];

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr));
}

function setActiveUser(username) {
  if (username) localStorage.setItem("activeUser", username);
  else localStorage.removeItem("activeUser");
}

function getActiveUsername() {
  return localStorage.getItem("activeUser");
}

function findUserByName(username) {
  return getUsers().find(x => x.username === username);
}

function findUserByEmail(email) {
  return getUsers().find(x => x.email === email);
}

function saveCartStorage() {
  let key = "cart_guest";
  let active = getActiveUsername();
  if (active) key = "cart_" + active;
  localStorage.setItem(key, JSON.stringify(cart));
}

function addToCart(name, price) {
  let item = cart.find(i => i.name === name);
  if (item) item.quantity++;
  else cart.push({ name, price: Number(price), quantity: 1 });
  saveCartStorage();
  updateCartUI();
}

function updateCartUI() {
  let count = cart.reduce((s, i) => s + i.quantity, 0);
  let total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  let cartCountTag = document.getElementById("cartCount");
  if (cartCountTag) cartCountTag.textContent = count;
  let cartItemsTag = document.getElementById("cartItems");
  if (!cartItemsTag) return;
  cartItemsTag.innerHTML = "";
  cart.forEach(item => {
    let li = document.createElement("li");
    li.style.listStyle = "none";
    li.style.marginBottom = "10px";
    li.style.padding = "8px";
    li.style.borderRadius = "8px";
    li.style.border = "1px solid #e6e6e6";
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="flex:1">
          <strong>${item.name}</strong><br>
          ₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}
        </div>
        <div style="text-align:right;min-width:120px">
          <button class="quantity-btn" onclick="changeQty('${escapeHtml(item.name)}', -1)">−</button>
          <button class="quantity-btn" onclick="changeQty('${escapeHtml(item.name)}', 1)">+</button>
          <div style="height:6px"></div>
          <button class="quantity-btn" style="background:#c0392b" onclick="removeItem('${escapeHtml(item.name)}')">Remove</button>
        </div>
      </div>
    `;
    cartItemsTag.appendChild(li);
  });
  let cartTotalTag = document.getElementById("cartTotal");
  if (cartTotalTag) cartTotalTag.textContent = total;
}

function changeQty(name, delta) {
  name = unescapeHtml(name);
  let item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeItem(name);
  saveCartStorage();
  updateCartUI();
}

function removeItem(name) {
  name = unescapeHtml(name);
  cart = cart.filter(i => i.name !== name);
  saveCartStorage();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCartStorage();
  updateCartUI();
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  let activeUser = getActiveUsername() || "Guest";
  let date = new Date().toLocaleString();
  document.getElementById("customerName").textContent = activeUser;
  document.getElementById("invoiceDate").textContent = `Date: ${date}`;
  document.getElementById("invoiceNumber").textContent = `Invoice #: INV${Math.floor(Math.random() * 10000)}`;
  let invoiceHTML = `<table class="table table-striped table-bordered">
    <thead class="table-dark">
      <tr><th>Item</th><th>Quantity</th><th>Price (₹)</th><th>Total (₹)</th></tr>
    </thead><tbody>`;
  let grandTotal = 0;
  cart.forEach(item => {
    let total = item.price * item.quantity;
    grandTotal += total;
    invoiceHTML += `<tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${total.toFixed(2)}</td>
    </tr>`;
  });
  invoiceHTML += `</tbody></table>`;
  document.getElementById("invoiceDetails").innerHTML = invoiceHTML;
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
  document.getElementById("invoicePage").style.display = "block";
  clearCart();
}

function toggleCart() {
  let sidebar = document.getElementById("cartSidebar");
  let overlay = document.querySelector(".overlay");
  if (!sidebar) return;
  sidebar.classList.toggle("active");
  document.body.classList.toggle("shift-left");
  if (overlay) overlay.classList.toggle("active");
}

function printInvoice() {
  let printContents = document.getElementById("invoicePage").innerHTML;
  let originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  location.reload();
}

function closeInvoice() {
  document.getElementById("invoicePage").style.display = "none";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeHtml(str) {
  return String(str)
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function register() {
  let u = document.getElementById("regUser").value.trim();
  let e = document.getElementById("regEmail").value.trim();
  let m = document.getElementById("regMobile").value.trim();
  let p = document.getElementById("regPass").value.trim();
  let c = document.getElementById("regConfirm").value.trim();

  if (!u || !e || !m || !p || !c) {
    alert("All fields required");
    return;
  }

  if (p !== c) {
    alert("Passwords do not match");
    return;
  }

  let users = getUsers();
  if (users.some(x => x.username === u)) {
    alert("Username already exists");
    return;
  }

  users.push({
    username: u,
    email: e,
    mobile: m,
    password: p
  });

  saveUsers(users);

  alert("Registration successful");
  window.location.href = "login.html";
}

function login() {
  let user = document.getElementById("loginUser").value.trim();
  let pass = document.getElementById("loginPass").value.trim();

  let users = getUsers();
  let found = users.find(x => x.username === user);

  if (!found) {
    alert("User not found");
    return;
  }

  if (found.password !== pass) {
    alert("Incorrect password");
    return;
  }

  localStorage.setItem("activeUser", JSON.stringify(found));
  alert("Login successful");
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("activeUser");
  window.location.href = "login.html";
}

function protectProfilePage() {
  let active = getActiveUsername();
  let profileInfo = document.getElementById("profileInfo");
  if (!profileInfo) return;
  if (!active) {
    alert("Please login to continue");
    window.location.href = "login.html";
    return;
  }
  let user = findUserByName(active);
  if (!user) {
    alert("User not found");
    window.location.href = "login.html";
    return;
  }
  profileInfo.innerHTML = `
    <h2>Welcome, ${escapeHtml(user.username)}</h2>
    <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
    <p><strong>Mobile:</strong> ${escapeHtml(user.mobile)}</p>
  `;
}

function showLoggedInInHeader() {
  let active = getActiveUsername();
  let el = document.getElementById("userDisplay");
  if (!el) return;
  if (active) el.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
  else el.innerHTML = `<a href="login.html">Login</a>`;
}

document.addEventListener("DOMContentLoaded", function () {
  let active = getActiveUsername();
  let key = active ? "cart_" + active : "cart_guest";
  cart = JSON.parse(localStorage.getItem(key)) || [];
  updateCartUI();
  protectProfilePage();
  showLoggedInInHeader();
});
