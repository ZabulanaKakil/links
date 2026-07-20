(function () {
  const SESSION_KEY = "tanvir-links-admin";
  const TAP_COUNT = 5;
  const TAP_WINDOW_MS = 2000;

  let tapCount = 0;
  let tapTimer = null;
  let isUnlocked = sessionStorage.getItem(SESSION_KEY) === "1";
  let adminMode = "edit";

  const overlay = document.getElementById("admin-overlay");
  const passwordPanel = document.getElementById("admin-password");
  const editorPanel = document.getElementById("admin-editor");
  const editPanel = document.getElementById("admin-edit-panel");
  const reorderPanel = document.getElementById("admin-reorder-panel");
  const passwordInput = document.getElementById("admin-password-input");
  const passwordError = document.getElementById("admin-password-error");
  const linksEditor = document.getElementById("admin-links-editor");
  const reorderEditor = document.getElementById("admin-reorder-editor");
  const saveStatus = document.getElementById("admin-save-status");
  const saveButton = document.getElementById("admin-save");
  const saveLayoutButton = document.getElementById("admin-save-layout");
  const adminTitle = document.getElementById("admin-title");

  function getGitHubToken() {
    const config = window.LinksAdminConfig;
    return (config.githubToken || "").trim();
  }

  async function sha256(text) {
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buffer))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function setStatus(message, isError) {
    saveStatus.textContent = message;
    saveStatus.className =
      "admin-status" + (isError ? " admin-status--error" : " admin-status--ok");
  }

  function isOverlayOpen() {
    return !overlay.hidden;
  }

  function openOverlay() {
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-open");

    if (isUnlocked) {
      showEditor("edit");
    } else {
      showPassword();
    }
  }

  function closeOverlay() {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("admin-open");
    passwordInput.value = "";
    passwordError.hidden = true;
    adminMode = "edit";
  }

  function showPassword() {
    adminTitle.textContent = "Edit Links";
    passwordPanel.hidden = false;
    editorPanel.hidden = true;
    passwordInput.focus();
  }

  function showEditor(mode) {
    adminMode = mode || "edit";
    adminTitle.textContent = adminMode === "reorder" ? "Reorder Links" : "Manage Links";
    passwordPanel.hidden = true;
    editorPanel.hidden = false;
    editPanel.hidden = adminMode !== "edit";
    reorderPanel.hidden = adminMode !== "reorder";

    if (adminMode === "reorder") {
      renderReorderEditor();
    } else {
      renderEditor();
    }

    updateDirtyState();
  }

  function unlock() {
    isUnlocked = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    showEditor("edit");
  }

  function lock() {
    isUnlocked = false;
    sessionStorage.removeItem(SESSION_KEY);
    closeOverlay();
  }

  function updateDirtyState() {
    if (window.LinksApp.hasUnsavedChanges()) {
      setStatus("You have unsaved changes. Save to update links.json on GitHub.", false);
    } else {
      setStatus("All changes saved to GitHub.", false);
    }
  }

  function renderEditor() {
    const data = window.LinksApp.getData();
    if (!data) {
      return;
    }

    linksEditor.replaceChildren();

    data.sections.forEach(function (section, sectionIndex) {
      const block = document.createElement("div");
      block.className = "admin-section";

      const title = document.createElement("h3");
      title.className = "admin-section__title";
      title.textContent = section.title;

      const list = document.createElement("div");
      list.className = "admin-section__list";

      section.links.forEach(function (link, linkIndex) {
        list.appendChild(createLinkEditor(sectionIndex, linkIndex, link));
      });

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "admin-btn admin-btn--ghost";
      addBtn.textContent = "+ Add link";
      addBtn.addEventListener("click", function () {
        addLink(sectionIndex);
      });

      block.append(title, list, addBtn);
      linksEditor.appendChild(block);
    });
  }

  function renderReorderEditor() {
    const data = window.LinksApp.getData();
    if (!data) {
      return;
    }

    reorderEditor.replaceChildren();

    data.sections.forEach(function (section, sectionIndex) {
      const block = document.createElement("div");
      block.className = "admin-reorder-section";

      const title = document.createElement("h3");
      title.className = "admin-section__title";
      title.textContent = section.title;

      const list = document.createElement("div");
      list.className = "admin-reorder-list";

      if (!section.links.length) {
        const empty = document.createElement("p");
        empty.className = "admin-reorder-empty";
        empty.textContent = "No links in this category.";
        list.appendChild(empty);
      }

      section.links.forEach(function (link, linkIndex) {
        list.appendChild(createReorderRow(sectionIndex, linkIndex, link, data.sections));
      });

      block.append(title, list);
      reorderEditor.appendChild(block);
    });
  }

  function createReorderRow(sectionIndex, linkIndex, link, sections) {
    const row = document.createElement("div");
    row.className = "admin-reorder-row";

    const icon = document.createElement("img");
    icon.className = "admin-reorder-row__icon";
    icon.src = window.LinksIcons.getUrl(link.icon || window.LinksIcons.defaultId);
    icon.alt = "";

    const info = document.createElement("div");
    info.className = "admin-reorder-row__info";

    const name = document.createElement("span");
    name.className = "admin-reorder-row__name";
    name.textContent = link.name;

    const url = document.createElement("span");
    url.className = "admin-reorder-row__url";
    url.textContent = link.displayUrl || link.url || "No URL set";

    info.append(name, url);

    const controls = document.createElement("div");
    controls.className = "admin-reorder-row__controls";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "admin-btn admin-btn--ghost admin-reorder-btn";
    upBtn.textContent = "Up";
    upBtn.disabled = linkIndex === 0;
    upBtn.addEventListener("click", function () {
      moveLink(sectionIndex, linkIndex, sectionIndex, linkIndex - 1);
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "admin-btn admin-btn--ghost admin-reorder-btn";
    downBtn.textContent = "Down";
    downBtn.disabled = linkIndex === sections[sectionIndex].links.length - 1;
    downBtn.addEventListener("click", function () {
      moveLink(sectionIndex, linkIndex, sectionIndex, linkIndex + 1);
    });

    const categoryLabel = document.createElement("label");
    categoryLabel.className = "admin-reorder-row__category";
    categoryLabel.innerHTML = '<span>Category</span>';

    const categorySelect = document.createElement("select");
    categorySelect.className = "admin-reorder-select";

    sections.forEach(function (section, targetIndex) {
      const option = document.createElement("option");
      option.value = String(targetIndex);
      option.textContent = section.title;
      option.selected = targetIndex === sectionIndex;
      categorySelect.appendChild(option);
    });

    categorySelect.addEventListener("change", function () {
      const targetSection = Number(categorySelect.value);
      if (targetSection !== sectionIndex) {
        moveLinkToSection(sectionIndex, linkIndex, targetSection);
      }
    });

    categoryLabel.appendChild(categorySelect);
    controls.append(upBtn, downBtn, categoryLabel);
    row.append(icon, info, controls);
    return row;
  }

  function createIconPicker(sectionIndex, linkIndex, selectedIcon) {
    const wrap = document.createElement("div");
    wrap.className = "admin-icon-picker";

    const label = document.createElement("span");
    label.className = "admin-icon-picker__label";
    label.textContent = "Icon";

    const grid = document.createElement("div");
    grid.className = "admin-icon-picker__grid";

    window.LinksIcons.pool.forEach(function (icon) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "admin-icon-picker__btn" +
        (icon.id === selectedIcon ? " admin-icon-picker__btn--active" : "");
      btn.title = icon.label;

      const img = document.createElement("img");
      img.src = window.LinksIcons.getUrl(icon.id);
      img.alt = icon.label;
      btn.appendChild(img);

      btn.addEventListener("click", function () {
        updateLinkField(sectionIndex, linkIndex, "icon", icon.id);
      });

      grid.appendChild(btn);
    });

    wrap.append(label, grid);
    return wrap;
  }

  function createLinkEditor(sectionIndex, linkIndex, link) {
    const row = document.createElement("div");
    row.className = "admin-link";

    row.innerHTML =
      '<label class="admin-field"><span>Name</span><input type="text" data-field="name" value="' +
      escapeAttr(link.name) +
      '"></label>' +
      '<label class="admin-field"><span>URL</span><input type="text" data-field="url" value="' +
      escapeAttr(link.url || "") +
      '" placeholder="https:// or mailto: or tel:"></label>' +
      '<label class="admin-field"><span>Display text (optional)</span><input type="text" data-field="displayUrl" value="' +
      escapeAttr(link.displayUrl || "") +
      '" placeholder="@username or custom label"></label>' +
      '<button type="button" class="admin-btn admin-btn--danger admin-link__remove">Remove</button>';

    row.insertBefore(
      createIconPicker(sectionIndex, linkIndex, link.icon || window.LinksIcons.defaultId),
      row.querySelector(".admin-link__remove")
    );

    row.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        updateLinkField(sectionIndex, linkIndex, input.dataset.field, input.value, false);
      });
      input.addEventListener("blur", function () {
        if (adminMode === "edit") {
          renderEditor();
        }
      });
    });

    row.querySelector(".admin-link__remove").addEventListener("click", function () {
      removeLink(sectionIndex, linkIndex);
    });

    return row;
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function getMutableData() {
    return JSON.parse(JSON.stringify(window.LinksApp.getData()));
  }

  function saveDraft(data, reRender) {
    window.LinksApp.setData(data, true);

    if (reRender !== false) {
      if (adminMode === "reorder") {
        renderReorderEditor();
      } else {
        renderEditor();
      }
    }

    updateDirtyState();
  }

  function updateLinkField(sectionIndex, linkIndex, field, value, reRender) {
    const data = getMutableData();
    data.sections[sectionIndex].links[linkIndex][field] = value;

    if (field === "displayUrl" && !value.trim()) {
      delete data.sections[sectionIndex].links[linkIndex].displayUrl;
    }

    saveDraft(data, reRender);
  }

  function removeLink(sectionIndex, linkIndex) {
    const data = getMutableData();
    data.sections[sectionIndex].links.splice(linkIndex, 1);
    saveDraft(data);
  }

  function addLink(sectionIndex) {
    const data = getMutableData();
    data.sections[sectionIndex].links.push({
      name: "New Link",
      url: "",
      icon: window.LinksIcons.defaultId
    });
    saveDraft(data);
  }

  function moveLink(fromSection, fromIndex, toSection, toIndex) {
    const data = getMutableData();
    const links = data.sections[fromSection].links;

    if (toIndex < 0 || toIndex >= links.length) {
      return;
    }

    const item = links.splice(fromIndex, 1)[0];
    links.splice(toIndex, 0, item);
    saveDraft(data);
  }

  function moveLinkToSection(fromSection, fromIndex, toSection) {
    const data = getMutableData();
    const item = data.sections[fromSection].links.splice(fromIndex, 1)[0];
    data.sections[toSection].links.push(item);
    saveDraft(data);
  }

  function saveToGitHub(onSuccess) {
    const token = getGitHubToken();

    if (!token) {
      setStatus("GitHub token missing in js/admin-config.js.", true);
      return Promise.reject(new Error("Missing token"));
    }
    saveButton.disabled = true;
    saveLayoutButton.disabled = true;
    setStatus("Saving to GitHub…", false);

    return window.LinksApp
      .saveToGitHub(window.LinksApp.getData(), token)
      .then(function () {
        setStatus("Saved. links.json updated on GitHub.", false);
        if (adminMode === "reorder") {
          renderReorderEditor();
        } else {
          renderEditor();
        }
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch(function (error) {
        setStatus(error.message || "Save failed.", true);
        throw error;
      })
      .finally(function () {
        saveButton.disabled = false;
        saveLayoutButton.disabled = false;
      });
  }

  document.getElementById("admin-close").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeOverlay();
  });

  document.querySelector(".admin-panel").addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.getElementById("admin-lock").addEventListener("click", lock);

  document.getElementById("admin-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const hash = await sha256(passwordInput.value);
    const expected = window.LinksAdminConfig.passwordHash;

    if (hash === expected) {
      passwordError.hidden = true;
      unlock();
    } else {
      passwordError.hidden = false;
      passwordInput.select();
    }
  });

  saveButton.addEventListener("click", function () {
    saveToGitHub();
  });

  saveLayoutButton.addEventListener("click", function () {
    saveToGitHub();
  });

  document.getElementById("admin-reorder-mode").addEventListener("click", function () {
    showEditor("reorder");
  });

  document.getElementById("admin-back-edit").addEventListener("click", function () {
    showEditor("edit");
  });

  document.getElementById("admin-discard").addEventListener("click", function () {
    if (
      !window.LinksApp.hasUnsavedChanges() ||
      confirm("Discard unsaved changes and reload from GitHub?")
    ) {
      window.LinksApp.reloadFromGitHub().then(function () {
        showEditor(adminMode);
        setStatus("Reloaded from links.json.", false);
      });
    }
  });

  document.getElementById("admin-export").addEventListener("click", function () {
    window.LinksApp.exportJson();
  });

  document.querySelector(".footer").addEventListener("click", function () {
    if (isOverlayOpen()) {
      return;
    }

    tapCount += 1;

    if (tapTimer) {
      clearTimeout(tapTimer);
    }

    if (tapCount >= TAP_COUNT) {
      tapCount = 0;
      openOverlay();
      return;
    }

    tapTimer = setTimeout(function () {
      tapCount = 0;
    }, TAP_WINDOW_MS);
  });

  overlay.addEventListener("click", function (e) {
    if (!e.target.closest(".admin-panel")) {
      closeOverlay();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOverlayOpen()) {
      e.preventDefault();
      closeOverlay();
    }
  });

  window.addEventListener("links-dirty", updateDirtyState);
})();
