(() => {
  "use strict";

  const STORAGE_KEY = "tasks.v1";
  const FILTER_KEY = "tasks.filter.v1";

  /** @type {{ id: string, text: string, done: boolean, createdAt: number }[]} */
  let tasks = load();
  let filter = loadFilter();

  const $ = (sel) => document.querySelector(sel);
  const form = $("#form");
  const input = $("#input");
  const list = $("#list");
  const count = $("#count");
  const clearDoneBtn = $("#clear-done");
  const filterBtns = Array.from(document.querySelectorAll(".filters__btn"));

  // ---------- persistence ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* storage may be full or disabled — ignore silently */
    }
  }

  function loadFilter() {
    const f = localStorage.getItem(FILTER_KEY);
    return f === "open" || f === "done" ? f : "all";
  }

  function saveFilter() {
    try {
      localStorage.setItem(FILTER_KEY, filter);
    } catch {
      /* ignore */
    }
  }

  // ---------- mutations ----------
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({
      id: cryptoId(),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    });
    save();
    render();
  }

  function toggleTask(id) {
    const t = tasks.find((t) => t.id === id);
    if (!t) return;
    t.done = !t.done;
    save();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearDone() {
    const before = tasks.length;
    tasks = tasks.filter((t) => !t.done);
    if (tasks.length !== before) {
      save();
      render();
    }
  }

  function setFilter(next) {
    filter = next;
    saveFilter();
    filterBtns.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.filter === next)
    );
    render();
  }

  // ---------- render ----------
  function visibleTasks() {
    if (filter === "open") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }

  function render() {
    const items = visibleTasks();
    list.innerHTML = items
      .map(
        (t) => `
        <li class="task ${t.done ? "is-done" : ""}" data-id="${t.id}">
          <input
            type="checkbox"
            class="task__check"
            ${t.done ? "checked" : ""}
            aria-label="Mark ${escapeAttr(t.text)} as ${t.done ? "open" : "done"}"
          />
          <span class="task__label">${escapeHtml(t.text)}</span>
          <button class="task__delete" type="button" aria-label="Delete ${escapeAttr(t.text)}">×</button>
        </li>`
      )
      .join("");

    const open = tasks.filter((t) => !t.done).length;
    const done = tasks.length - open;
    count.textContent = `${open} open · ${done} done`;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function cryptoId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ---------- events ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask(input.value);
    input.value = "";
    input.focus();
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest(".task");
    if (!li) return;
    const id = li.dataset.id;
    if (e.target.matches(".task__delete")) {
      deleteTask(id);
    } else if (e.target.matches(".task__check")) {
      toggleTask(id);
    }
  });

  clearDoneBtn.addEventListener("click", clearDone);

  filterBtns.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));

  // Keyboard shortcuts: "/" focuses input, Escape clears/cancels.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      input.blur();
    }
  });

  // ---------- init ----------
  setFilter(filter); // sync active state
  render();
})();
