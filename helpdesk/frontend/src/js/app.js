import "../styles/main.scss";
import { API } from "./api.js";
import { Modal } from "./modal.js";
import { TicketCard } from "./ticket.js";

const ticketsList = document.getElementById("ticketsList");
const addTicketBtn = document.getElementById("addTicketBtn");
const ticketForm = document.getElementById("ticketForm");
const modal = new Modal("modal");
const confirmModal = new Modal("confirmModal");

let tickets = [];
let ticketToDelete = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await loadTickets();
}

function bindEvents() {
  addTicketBtn.addEventListener("click", () => openModal());

  document
    .getElementById("modalClose")
    .addEventListener("click", () => modal.close());
  modal.bindCloseEvents(() => ticketForm.reset());

  document
    .getElementById("cancelDelete")
    .addEventListener("click", () => confirmModal.close());
  confirmModal.bindCloseEvents();

  ticketForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveTicket();
  });

  document
    .getElementById("confirmDelete")
    .addEventListener("click", async () => {
      if (ticketToDelete) {
        await deleteTicket(ticketToDelete);
        confirmModal.close();
        ticketToDelete = null;
      }
    });
}

async function loadTickets() {
  showLoading();
  try {
    tickets = await API.getAll();
    renderTickets();
  } catch (err) {
    showError("Не удалось загрузить тикеты");
  }
}

function renderTickets() {
  ticketsList.innerHTML = "";

  if (tickets.length === 0) {
    ticketsList.innerHTML =
      '<div class="loading">Нет тикетов. Создайте первый!</div>';
    return;
  }

  tickets.forEach((ticket) => {
    const card = new TicketCard(
      ticket,
      openModal,
      confirmDelete,
      toggleStatus,
      showTicketDetails,
    );
    ticketsList.appendChild(card.render());
  });
}

function showLoading() {
  ticketsList.innerHTML = '<div class="loading">Загрузка...</div>';
}

function showError(message) {
  ticketsList.innerHTML = `<div class="error">⚠️ ${message}</div>`;
}

function openModal(ticket = null) {
  const modalTitle = document.getElementById("modalTitle");
  const ticketId = document.getElementById("ticketId");
  const nameInput = document.getElementById("ticketName");
  const descInput = document.getElementById("ticketDescription");
  const statusInput = document.getElementById("ticketStatus");
  const saveBtn = document.getElementById("saveBtn");

  if (ticket) {
    modalTitle.textContent = "Редактировать тикет";
    ticketId.value = ticket.id;
    nameInput.value = ticket.name;
    descInput.value = ticket.description || "";
    statusInput.checked = ticket.status;
    statusInput.closest(".form-group").style.display = "block";
    saveBtn.textContent = "Обновить";
  } else {
    modalTitle.textContent = "Новый тикет";
    ticketForm.reset();
    ticketId.value = "";
    statusInput.closest(".form-group").style.display = "none";
    saveBtn.textContent = "Создать";
  }

  modal.open();
  nameInput.focus();
}

async function saveTicket() {
  const id = document.getElementById("ticketId").value;
  const name = document.getElementById("ticketName").value.trim();
  const description = document.getElementById("ticketDescription").value.trim();
  const status = document.getElementById("ticketStatus").checked;

  if (!name) {
    alert("Название тикета обязательно");
    return;
  }

  try {
    if (id) {
      await API.update(id, { name, description, status });
    } else {
      await API.create({ name, description });
    }

    modal.close();
    ticketForm.reset();
    await loadTickets();
  } catch (err) {
    alert("Ошибка при сохранении тикета");
  }
}

function confirmDelete(id) {
  ticketToDelete = id;
  confirmModal.open();
}

async function deleteTicket(id) {
  try {
    await API.delete(id);
    await loadTickets();
  } catch (err) {
    alert("Не удалось удалить тикет");
  }
}

async function toggleStatus(id, status) {
  try {
    await API.update(id, { status });
    await loadTickets();
  } catch (err) {
    alert("Ошибка при обновлении статуса");
  }
}

function showTicketDetails(ticket) {
  const date = new Date(ticket.created).toLocaleString("ru-RU");
  const status = ticket.status ? "✅ Выполнено" : "⏳ В работе";

  alert(
    `📋 ${ticket.name}\n\n${ticket.description || "Без описания"}\n\n🕐 ${date}\n📊 ${status}`,
  );
}
