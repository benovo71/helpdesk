import "../styles/main.scss";
import { API } from "./api.js";
import { Modal } from "./modal.js";
import { TicketCard } from "./ticket.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Получаем основные элементы интерфейса
  const ticketsList = document.getElementById("ticketsList");
  const addTicketBtn = document.getElementById("addTicketBtn");
  const ticketForm = document.getElementById("ticketForm");

  // Проверяем существование критических элементов
  if (!ticketsList || !addTicketBtn || !ticketForm) {
    console.error("Не все элементы интерфейса загружены.");
    return;
  }

  // Инициализируем модальные окна
  const modal = new Modal("modal");
  const confirmModal = new Modal("confirmModal");

  // Состояние приложения
  let tickets = [];
  let ticketToDelete = null;

  // Вспомогательные функции для работы с DOM
  function getElementOrWarn(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Элемент ${id} не найден`);
    return el;
  }

  function showNotification(message, type = "error") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }

  function hideLoading() {
    const loadingEl = document.querySelector(".loading");
    if (loadingEl) loadingEl.remove();
  }

  // Основные функции
  async function init() {
    bindEvents();
    await loadTickets();
  }

  function bindEvents() {
    addTicketBtn.addEventListener("click", () => openModal());

    const modalClose = getElementOrWarn("modalClose");
    if (modalClose) {
      modalClose.addEventListener("click", () => modal.close());
    }
    modal.bindCloseEvents(() => ticketForm.reset());

    const cancelDelete = getElementOrWarn("cancelDelete");
    if (cancelDelete) {
      cancelDelete.addEventListener("click", () => confirmModal.close());
    }
    confirmModal.bindCloseEvents();

    ticketForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveTicket();
    });

    const confirmDeleteBtn = getElementOrWarn("confirmDelete");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async () => {
        if (ticketToDelete) {
          await deleteTicket(ticketToDelete);
          confirmModal.close();
          ticketToDelete = null;
        }
      });
    }
  }

  async function loadTickets() {
    showLoading();
    try {
      tickets = await API.getAll();
      renderTickets();
    } catch (err) {
      showError("Не удалось загрузить тикеты");
    } finally {
      hideLoading();
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
      ticketsList.append(card.render());
    });
  }

  function showLoading() {
    ticketsList.innerHTML = '<div class="loading">Загрузка...</div>';
  }

  function showError(message) {
    ticketsList.innerHTML = `<div class="error">⚠️ ${message}</div>`;
  }

  function openModal(ticket = null) {
    const modalTitle = getElementOrWarn("modalTitle");
    const ticketId = getElementOrWarn("ticketId");
    const nameInput = getElementOrWarn("ticketName");
    const descInput = getElementOrWarn("ticketDescription");
    const statusInput = getElementOrWarn("ticketStatus");
    const saveBtn = getElementOrWarn("saveBtn");

    if (
      !modalTitle ||
      !ticketId ||
      !nameInput ||
      !descInput ||
      !statusInput ||
      !saveBtn
    ) {
      console.error("Некоторые элементы модального окна не найдены");
      return;
    }

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
    const id = getElementOrWarn("ticketId")?.value;
    const name = getElementOrWarn("ticketName")?.value.trim();
    const description = getElementOrWarn("ticketDescription")?.value.trim();
    const status = getElementOrWarn("ticketStatus")?.checked;

    if (!name) {
      showNotification("Название тикета обязательно", "warning");
      return;
    }

    try {
      let updatedTicket;
      if (id) {
        updatedTicket = await API.update(id, { name, description, status });
        // Обновляем только изменённый тикет
        const index = tickets.findIndex((t) => t.id === id);
        if (index !== -1) tickets[index] = updatedTicket;
      } else {
        updatedTicket = await API.create({ name, description });
        tickets.push(updatedTicket);
      }

      modal.close();
      ticketForm.reset();
      renderTickets(); // Перерисовываем только при необходимости
      showNotification(id ? "Тикет обновлён" : "Тикет создан", "success");
    } catch (err) {
      showNotification("Ошибка при сохранении тикета", "error");
    }
  }

  function confirmDelete(id) {
    ticketToDelete = id;
    confirmModal.open();
  }

  async function deleteTicket(id) {
    try {
      await API.delete(id);
      // Удаляем из локального массива
      tickets = tickets.filter((t) => t.id !== id);
      renderTickets();
      showNotification("Тикет удалён", "success");
    } catch (err) {
      showNotification("Не удалось удалить тикет", "error");
    }
  }

  async function toggleStatus(id, status) {
    try {
      const updatedTicket = await API.update(id, { status });
      // Обновляем в локальном массиве
      const index = tickets.findIndex((t) => t.id === id);
      if (index !== -1) tickets[index] = updatedTicket;
      renderTickets();
      showNotification("Статус обновлён", "success");
    } catch (err) {
      showNotification("Ошибка при обновлении статуса", "error");
    }
  }

  function showTicketDetails(ticket) {
    const date = new Date(ticket.created).toLocaleString("ru-RU");
    const status = ticket.status ? "✅ Выполнено" : "⏳ В работе";

    showNotification(
      `📋 ${ticket.name}\n\n${ticket.description || "Без описания"}\n\n🕐 ${date}\n📊 ${status}`,
      "info",
    );
  }

  // Запускаем приложение
  await init();
});
