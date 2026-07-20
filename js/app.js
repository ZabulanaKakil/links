(function () {
  const root = document.getElementById("links-root");
  const siteTitle = document.getElementById("site-title");

  let currentData = null;
  let hasUnsavedChanges = false;

  function getInitial(name) {
    return (name.trim().charAt(0) || "?").toUpperCase();
  }

  function normalizeLink(link) {
    const clean = {
      name: link.name || "Untitled",
      url: link.url || "",
      icon: link.icon || window.LinksIcons.defaultId
    };

    if (link.displayUrl && link.displayUrl.trim()) {
      clean.displayUrl = link.displayUrl.trim();
    }

    return clean;
  }

  function normalizeData(data) {
    return {
      siteTitle: data.siteTitle || "Tanvir Nahian Links",
      sections: (data.sections || []).map(function (section) {
        return {
          id: section.id,
          title: section.title,
          links: (section.links || []).map(normalizeLink)
        };
      })
    };
  }

  function displayUrl(link) {
    if (link.displayUrl) {
      return link.displayUrl;
    }

    return link.url
      .replace(/^mailto:/i, "")
      .replace(/^tel:/i, "")
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "");
  }

  function createAvatar(name) {
    const avatar = document.createElement("span");
    avatar.className = "link-card__avatar";
    avatar.textContent = getInitial(name);
    avatar.setAttribute("aria-hidden", "true");
    return avatar;
  }

  function createLogo(link) {
    const iconId = link.icon || window.LinksIcons.defaultId;
    const img = document.createElement("img");
    img.className = "link-card__logo";
    img.src = window.LinksIcons.getUrl(iconId);
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", function onError() {
      img.replaceWith(createAvatar(link.name));
    });
    return img;
  }

  function createLinkBody(link) {
    const body = document.createElement("div");
    body.className = "link-card__body";

    const nameEl = document.createElement("span");
    nameEl.className = "link-card__name";
    nameEl.textContent = link.name;

    const urlEl = document.createElement("span");
    urlEl.className = "link-card__url";
    urlEl.textContent = link.url ? displayUrl(link) : "Link not set yet";

    body.append(nameEl, urlEl);
    return body;
  }

  function createLinkIcon() {
    const icon = document.createElement("span");
    icon.className = "link-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>';
    return icon;
  }

  function createLinkCard(link) {
    const hasUrl = Boolean(link.url && link.url.trim());

    const card = document.createElement(hasUrl ? "a" : "div");
    card.className = "link-card" + (hasUrl ? "" : " link-card--inactive");

    if (hasUrl) {
      card.href = link.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      if (/^mailto:/i.test(link.url) || /^tel:/i.test(link.url)) {
        card.removeAttribute("target");
      }
    } else if (link.displayUrl) {
      card.title = "Click to copy";
      card.addEventListener("click", function () {
        navigator.clipboard.writeText(link.displayUrl).then(function () {
          card.classList.add("link-card--copied");
          setTimeout(function () {
            card.classList.remove("link-card--copied");
          }, 1200);
        });
      });
    }

    card.append(createLogo(link), createLinkBody(link));

    if (hasUrl) {
      card.appendChild(createLinkIcon());
    }

    return card;
  }

  function renderSections(data) {
    currentData = normalizeData(data);

    if (currentData.siteTitle) {
      siteTitle.textContent = currentData.siteTitle;
      document.title = currentData.siteTitle;
    }

    root.replaceChildren();

    currentData.sections.forEach(function (section) {
      const sectionEl = document.createElement("section");
      sectionEl.className = "section";
      sectionEl.id = section.id;

      const heading = document.createElement("h2");
      heading.className = "section__title";
      heading.textContent = section.title;

      const list = document.createElement("ul");
      list.className = "section__list";

      section.links.forEach(function (link) {
        const item = document.createElement("li");
        item.appendChild(createLinkCard(link));
        list.appendChild(item);
      });

      sectionEl.append(heading, list);
      root.appendChild(sectionEl);
    });

    window.dispatchEvent(
      new CustomEvent("links-rendered", { detail: currentData })
    );
  }

  function showError(message) {
    root.innerHTML = '<p class="error">' + message + "</p>";
  }

  function fetchData() {
    const cacheBust = "?t=" + Date.now();
    return fetch("./data/links.json" + cacheBust).then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load links data.");
      }
      return response.json();
    });
  }

  function encodeBase64Utf8(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function saveToGitHub(data, token) {
    const config = window.LinksAdminConfig;
    const apiUrl =
      "https://api.github.com/repos/" +
      config.githubOwner +
      "/" +
      config.githubRepo +
      "/contents/" +
      config.githubFilePath;

    return fetch(apiUrl + "?ref=" + config.githubBranch, {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (body) {
            throw new Error(body.message || "Could not read links.json on GitHub.");
          });
        }
        return response.json();
      })
      .then(function (fileMeta) {
        const payload = normalizeData(data);
        const jsonText = JSON.stringify(payload, null, 2) + "\n";

        return fetch(apiUrl, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28"
          },
          body: JSON.stringify({
            message: "Update links via admin panel",
            content: encodeBase64Utf8(jsonText),
            sha: fileMeta.sha,
            branch: config.githubBranch
          })
        });
      })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (body) {
            throw new Error(body.message || "GitHub save failed.");
          });
        }
        return response.json();
      })
      .then(function () {
        hasUnsavedChanges = false;
        return fetchData();
      })
      .then(renderSections);
  }

  function loadData() {
    return fetchData()
      .then(function (data) {
        hasUnsavedChanges = false;
        renderSections(data);
        return data;
      })
      .catch(function () {
        showError("Unable to load links. Check that data/links.json exists.");
      });
  }

  window.LinksApp = {
    loadData: loadData,
    renderSections: renderSections,
    getData: function () {
      return currentData;
    },
    setData: function (data, markDirty) {
      renderSections(data);
      if (markDirty !== false) {
        hasUnsavedChanges = true;
      }
      window.dispatchEvent(new CustomEvent("links-dirty", { detail: hasUnsavedChanges }));
    },
    hasUnsavedChanges: function () {
      return hasUnsavedChanges;
    },
    reloadFromGitHub: loadData,
    saveToGitHub: saveToGitHub,
    exportJson: function () {
      if (!currentData) {
        return;
      }

      const blob = new Blob([JSON.stringify(currentData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "links.json";
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  loadData();
})();
