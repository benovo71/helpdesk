export class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.isOpen = false;
  }

  open() {
    this.modal.classList.remove("hidden");
    this.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  close() {
    this.modal.classList.add("hidden");
    this.isOpen = false;
    document.body.style.overflow = "";
  }

  bindCloseEvents(onClose) {
    const content = this.modal.querySelector(".modal-content");

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
        onClose?.();
      }
    });

    content.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
        onClose?.();
      }
    });
  }
}
