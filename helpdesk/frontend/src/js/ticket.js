export class TicketCard {
  constructor(ticket, onEdit, onDelete, onToggle, onView) {
    this.ticket = ticket;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onToggle = onToggle;
    this.onView = onView;
  }

  render() {
    const el = document.createElement("div");
    el.className = `ticket-card ${this.ticket.status ? "done" : ""}`;
    el.dataset.id = this.ticket.id;

    const date = new Date(this.ticket.created).toLocaleDateString("ru-RU");

    el.innerHTML = `
      <input type="checkbox" class="ticket-checkbox" ${this.ticket.status ? "checked" : ""} />
      <div class="ticket-body">
        <div class="ticket-name">${this.escapeHtml(this.ticket.name)}</div>
        <div class="ticket-meta">Создан: ${date}</div>
      </div>
      <div class="ticket-actions">
        <button class="btn btn-secondary edit-btn" title="Редактировать">✎</button>
        <button class="btn btn-danger delete-btn" title="Удалить">✕</button>
      </div>
    `;

    el.querySelector(".ticket-body").addEventListener("click", (e) => {
      e.stopPropagation();
      this.onView(this.ticket);
    });

    el.querySelector(".ticket-checkbox").addEventListener("change", (e) => {
      e.stopPropagation();
      this.onToggle(this.ticket.id, e.target.checked);
    });

    el.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.onEdit(this.ticket);
    });

    el.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.onDelete(this.ticket.id);
    });

    return el;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
