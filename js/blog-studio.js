const API = {
  documents: "/api/blog/documents",
  document: "/api/blog/document",
  newDocument: "/api/blog/documents/new",
  saveDraft: "/api/blog/drafts/save",
  publish: "/api/blog/publish",
  preview: "/api/blog/preview",
};

const ORIGIN_OPTIONS = [
  { value: "human", label: "Human-written" },
  { value: "ai-assisted", label: "AI-assisted" },
  { value: "ai-generated", label: "AI-generated" },
];

const state = {
  documents: {
    draft: [],
    published: [],
  },
  activeDocument: null,
  rawMarkdown: "",
  parsed: {
    frontmatter: {},
    body: "",
  },
  dirty: false,
  loading: false,
  previewLoading: false,
  requestNonce: 0,
  selectedStatus: null,
  selectedSlug: null,
  previewTimer: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  seedEmptyEditor();
  updateSummary();
  void loadDocuments();
});

function cacheElements() {
  Object.assign(elements, {
    reloadDocuments: document.getElementById("reload-documents"),
    refreshLibrary: document.getElementById("refresh-library"),
    focusNewPost: document.getElementById("focus-new-post"),
    newPostForm: document.getElementById("new-post-form"),
    newPostTitle: document.getElementById("new-post-title"),
    newPostOrigin: document.getElementById("new-post-origin"),
    newPostShowOrigin: document.getElementById("new-post-show-origin"),
    statusMessage: document.getElementById("status-message"),
    statusPill: document.getElementById("status-pill"),
    summaryDraftCount: document.getElementById("summary-draft-count"),
    summaryDraftNote: document.getElementById("summary-draft-note"),
    summaryPublishedCount: document.getElementById("summary-published-count"),
    summaryPublishedNote: document.getElementById("summary-published-note"),
    summaryConnectionState: document.getElementById("summary-connection-state"),
    summaryConnectionNote: document.getElementById("summary-connection-note"),
    draftCountBadge: document.getElementById("draft-count-badge"),
    publishedCountBadge: document.getElementById("published-count-badge"),
    draftList: document.getElementById("draft-list"),
    publishedList: document.getElementById("published-list"),
    editorHeading: document.getElementById("editor-heading"),
    editorSubtitle: document.getElementById("editor-subtitle"),
    activeDocumentSummary: document.getElementById("active-document-summary"),
    dirtyStateSummary: document.getElementById("dirty-state-summary"),
    previewStateSummary: document.getElementById("preview-state-summary"),
    documentStatusPill: document.getElementById("document-status-pill"),
    documentOriginPill: document.getElementById("document-origin-pill"),
    fieldTitle: document.getElementById("field-title"),
    fieldSlug: document.getElementById("field-slug"),
    fieldDescription: document.getElementById("field-description"),
    fieldAuthor: document.getElementById("field-author"),
    fieldDate: document.getElementById("field-date"),
    fieldTags: document.getElementById("field-tags"),
    fieldOrigin: document.getElementById("field-origin"),
    fieldShowOrigin: document.getElementById("field-show-origin"),
    markdownInput: document.getElementById("markdown-input"),
    syncMetadata: document.getElementById("sync-metadata"),
    refreshPreview: document.getElementById("refresh-preview"),
    previewStatus: document.getElementById("preview-status"),
    previewFrame: document.getElementById("preview-frame"),
    saveDraft: document.getElementById("save-draft"),
    publishPost: document.getElementById("publish-post"),
  });
}

function bindEvents() {
  elements.reloadDocuments?.addEventListener("click", () => void loadDocuments());
  elements.refreshLibrary?.addEventListener("click", () => void loadDocuments());
  elements.focusNewPost?.addEventListener("click", () => {
    elements.newPostTitle?.focus();
    elements.newPostTitle?.select();
  });

  elements.newPostForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void createDraftFromForm();
  });

  elements.draftList?.addEventListener("click", handleLibraryClick);
  elements.publishedList?.addEventListener("click", handleLibraryClick);

  elements.syncMetadata?.addEventListener("click", () => {
    syncMetadataToMarkdown();
    schedulePreviewRefresh(true);
    setStatus("Metadata applied to the raw Markdown document.", "success");
  });

  elements.refreshPreview?.addEventListener("click", () => {
    schedulePreviewRefresh(true);
  });

  elements.saveDraft?.addEventListener("click", () => void saveCurrentDocument("draft"));
  elements.publishPost?.addEventListener("click", () => void saveCurrentDocument("publish"));

  const metadataInputs = [
    elements.fieldTitle,
    elements.fieldSlug,
    elements.fieldDescription,
    elements.fieldAuthor,
    elements.fieldDate,
    elements.fieldTags,
    elements.fieldOrigin,
    elements.fieldShowOrigin,
  ].filter(Boolean);

  metadataInputs.forEach((input) => {
    const eventName = input instanceof HTMLInputElement && input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventName, () => {
      if (!state.activeDocument) {
        return;
      }

      syncMarkdownFromMetadata();
      schedulePreviewRefresh();
    });
  });

  elements.markdownInput?.addEventListener("input", () => {
    if (!state.activeDocument) {
      state.activeDocument = createBlankDocument();
    }

    applyMarkdownChange(elements.markdownInput.value);
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey)) {
      return;
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveCurrentDocument("draft");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      void saveCurrentDocument("publish");
    }
  });
}

async function loadDocuments(options = {}) {
  setLoading(true);
  setStatus("Loading documents from the local API...", "info");

  try {
    const response = await fetch(API.documents, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`GET ${API.documents} failed with ${response.status}`);
    }

    const payload = await response.json();
    state.documents = normalizeDocumentGroups(payload);
    renderLibrary();
    updateSummary();

    const preferred = pickPreferredDocument(options);
    let openedPreferred = false;
    if (preferred) {
      await openDocument(preferred.slug, preferred.status, { skipPrompt: true });
      openedPreferred = true;
    } else if (!state.activeDocument) {
      seedEmptyEditor();
    }

    setConnectionState("Connected", "Local API responded successfully.");
    if (!openedPreferred) {
      setStatus("Documents loaded.", "success");
    }
  } catch (error) {
    setConnectionState("Offline", "The local API is not available yet.");
    setStatus(formatError(error, "Unable to load blog documents."), "error");

    if (!state.activeDocument) {
      seedEmptyEditor();
    }
    renderLibrary();
    updateSummary();
    renderPreviewState();
  } finally {
    setLoading(false);
  }
}

function pickPreferredDocument(options) {
  if (options.slug && options.status) {
    return { slug: options.slug, status: options.status };
  }

  if (state.selectedSlug && state.selectedStatus) {
    return { slug: state.selectedSlug, status: state.selectedStatus };
  }

  const draft = state.documents.draft[0];
  if (draft) {
    return { slug: draft.slug, status: draft.status };
  }

  const published = state.documents.published[0];
  if (published) {
    return { slug: published.slug, status: published.status };
  }

  return null;
}

async function openDocument(slug, status, { skipPrompt = false } = {}) {
  if (!skipPrompt && state.dirty && !window.confirm("You have unsaved changes. Discard them and open another document?")) {
    return;
  }

  try {
    setStatus(`Loading ${status} document "${slug}"...`, "info");
    const document = await fetchDocument(slug, status);
    state.activeDocument = document;
    state.selectedSlug = document.slug;
    state.selectedStatus = document.status;
    applyDocumentToEditor(document);
    renderLibrary();
    renderPreviewState();
    setStatus(`Opened ${document.status} document "${document.title}".`, "success");
  } catch (error) {
    setStatus(formatError(error, `Unable to open ${status} document "${slug}".`), "error");
  }
}

async function fetchDocument(slug, status) {
  const url = new URL(API.document, window.location.origin);
  url.searchParams.set("slug", slug);
  url.searchParams.set("status", status);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`GET ${url.pathname} failed with ${response.status}`);
  }

  const payload = await response.json();
  return normalizeDocument(payload, status);
}

async function createDraftFromForm() {
  const title = elements.newPostTitle.value.trim();
  if (!title) {
    setStatus("Enter a title before creating a draft.", "error");
    elements.newPostTitle.focus();
    return;
  }

  const payload = {
    title,
    origin: elements.newPostOrigin.value,
    showOriginLabel: elements.newPostShowOrigin.checked,
  };

  setBusy(true);
  setStatus(`Creating draft "${title}"...`, "info");

  try {
    const response = await fetch(API.newDocument, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`POST ${API.newDocument} failed with ${response.status}`);
    }

    const result = await response.json();
    const created = normalizeDocument(result, "draft");
    state.documents = result?.documents
      ? normalizeDocumentGroups(result.documents)
      : upsertDocumentInGroups(state.documents, created);
    renderLibrary();
    updateSummary();
    await openDocument(created.slug, created.status, { skipPrompt: true });

    elements.newPostForm?.reset();
    elements.newPostOrigin.value = "human";
    elements.newPostShowOrigin.checked = true;
    setStatus(`Draft "${created.title}" created.`, "success");
  } catch (error) {
    setStatus(formatError(error, "Unable to create a draft."), "error");
  } finally {
    setBusy(false);
  }
}

async function saveCurrentDocument(nextStatus) {
  if (!state.activeDocument) {
    setStatus("Create or load a document before saving.", "error");
    return;
  }

  syncMarkdownFromMetadata();
  const activePayload = buildDocumentPayload(nextStatus === "publish" ? "published" : "draft");
  const endpoint = nextStatus === "publish" ? API.publish : API.saveDraft;
  const message = nextStatus === "publish" ? "Publishing document..." : "Saving draft...";

  setBusy(true);
  setStatus(message, "info");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(activePayload),
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed with ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    const saved = normalizeDocument(result ?? activePayload, nextStatus === "publish" ? "published" : "draft");

    setDirty(false);
    state.activeDocument = saved;
    state.selectedSlug = saved.slug;
    state.selectedStatus = saved.status;
    updateDirtyIndicator();
    state.documents = result?.documents
      ? normalizeDocumentGroups(result.documents)
      : upsertDocumentInGroups(state.documents, saved);
    renderLibrary();
    updateSummary();
    applyDocumentToEditor(saved);

    if (nextStatus === "publish") {
      setStatus(`Published "${saved.title}".`, "success");
      await loadDocuments({ slug: saved.slug, status: "published" });
      return;
    }

    setStatus(`Saved draft "${saved.title}".`, "success");
  } catch (error) {
    setStatus(formatError(error, nextStatus === "publish" ? "Unable to publish the document." : "Unable to save the draft."), "error");
  } finally {
    setBusy(false);
  }
}

function applyDocumentToEditor(document) {
  state.activeDocument = document;
  state.rawMarkdown = document.rawMarkdown;
  state.parsed = parseMarkdownDocument(document.rawMarkdown);
  state.dirty = false;
  state.selectedSlug = document.slug;
  state.selectedStatus = document.status;

  populateControls(document);
  elements.markdownInput.value = document.rawMarkdown;
  setEditorHeading(document);
  updateDocumentIndicators(document);
  updateDirtyIndicator();
  renderPreviewState();
  schedulePreviewRefresh(true);
}

function populateControls(document) {
  elements.fieldTitle.value = document.frontmatter.title ?? document.title ?? "";
  elements.fieldSlug.value = document.frontmatter.slug ?? document.slug ?? "";
  elements.fieldDescription.value = document.frontmatter.description ?? document.description ?? "";
  elements.fieldAuthor.value = document.frontmatter.author ?? document.author ?? "";
  elements.fieldDate.value = document.frontmatter.date ?? document.date ?? "";
  elements.fieldTags.value = Array.isArray(document.frontmatter.tags)
    ? document.frontmatter.tags.join(", ")
    : Array.isArray(document.tags)
      ? document.tags.join(", ")
      : "";
  elements.fieldOrigin.value = document.frontmatter.origin ?? document.origin ?? "human";
  elements.fieldShowOrigin.checked = Boolean(
    document.frontmatter.showOriginLabel ?? document.showOriginLabel ?? false
  );
}

function setEditorHeading(document) {
  elements.editorHeading.textContent = document.title || "Untitled document";
  elements.editorSubtitle.textContent = document.status === "published"
    ? "This document is already public. Publish again to rebuild the route."
    : "This document is still a draft. Keep it local until it is ready to publish.";
  elements.activeDocumentSummary.textContent = `${capitalize(document.status)} · ${document.slug}`;
}

function updateDocumentIndicators(document) {
  elements.documentStatusPill.textContent = capitalize(document.status);
  elements.documentOriginPill.textContent = `Origin: ${humanizeOrigin(document.origin)}`;
}

function handleLibraryClick(event) {
  const button = event.target.closest("[data-slug][data-status]");
  if (!button) {
    return;
  }

  void openDocument(button.dataset.slug, button.dataset.status);
}

function renderLibrary() {
  renderDocumentGroup(elements.draftList, state.documents.draft, "draft");
  renderDocumentGroup(elements.publishedList, state.documents.published, "published");
}

function renderDocumentGroup(container, documents, status) {
  if (!container) {
    return;
  }

  if (!documents.length) {
    container.innerHTML = `<p class="document-item-empty">No ${status} posts yet.</p>`;
    return;
  }

  container.innerHTML = documents.map((document) => renderDocumentItem(document)).join("");

  container.querySelectorAll("[data-slug][data-status]").forEach((button) => {
    const isSelected =
      button.dataset.slug === state.selectedSlug && button.dataset.status === state.selectedStatus;
    button.setAttribute("aria-selected", String(isSelected));
  });
}

function renderDocumentItem(document) {
  const tags = Array.isArray(document.tags) && document.tags.length ? document.tags.slice(0, 3).join(" · ") : "No tags";
  const sourceBadge =
    document.origin === "human" ? "Human" : document.origin === "ai-assisted" ? "AI-assisted" : "AI-generated";
  const dateLabel = formatReadableDate(document.date || document.dateStamp || document.updatedAt);

  return `
    <button class="document-item" type="button" data-slug="${escapeHtml(document.slug)}" data-status="${escapeHtml(document.status)}" aria-selected="false">
      <span class="document-item-title">
        <strong>${escapeHtml(document.title)}</strong>
        <span class="status-pill">${escapeHtml(capitalize(document.status))}</span>
      </span>
      <span class="document-item-meta">
        <span>${escapeHtml(dateLabel)}</span>
        <span>${escapeHtml(tags)}</span>
        <span>${escapeHtml(sourceBadge)}</span>
      </span>
    </button>
  `;
}

function updateSummary() {
  const draftCount = state.documents.draft.length;
  const publishedCount = state.documents.published.length;
  elements.summaryDraftCount.textContent = String(draftCount);
  elements.summaryPublishedCount.textContent = String(publishedCount);
  elements.draftCountBadge.textContent = String(draftCount);
  elements.publishedCountBadge.textContent = String(publishedCount);
  elements.summaryDraftNote.textContent = draftCount ? "Stored in blog/drafts" : "Nothing drafted yet";
  elements.summaryPublishedNote.textContent = publishedCount ? "Visible in the public blog" : "Nothing published yet";
}

function setConnectionState(stateLabel, note) {
  elements.summaryConnectionState.textContent = stateLabel;
  elements.summaryConnectionNote.textContent = note;
}

function setStatus(message, tone = "info") {
  elements.statusMessage.textContent = message;
  elements.statusPill.textContent = tone === "error" ? "Error" : tone === "success" ? "Saved" : tone === "info" ? "Working" : "Idle";
  elements.statusPill.classList.toggle("status-pill-accent", tone !== "error");
  elements.previewStatus.textContent = tone === "error" ? message : "";
  elements.previewStateSummary.textContent = tone === "error" ? "Error" : state.previewLoading ? "Rendering" : state.activeDocument ? "Ready" : "Waiting for content";
}

function setLoading(isLoading) {
  state.loading = isLoading;
  document.body.classList.toggle("is-loading", isLoading);
  toggleControlState(elements.reloadDocuments, !isLoading);
  toggleControlState(elements.refreshLibrary, !isLoading);
}

function setBusy(isBusy) {
  setEditorLocked(isBusy);
  toggleControlState(elements.saveDraft, !isBusy);
  toggleControlState(elements.publishPost, !isBusy);
  toggleControlState(elements.newPostForm, !isBusy);
  toggleControlState(elements.syncMetadata, !isBusy);
  toggleControlState(elements.refreshPreview, !isBusy);
  toggleControlState(elements.reloadDocuments, !isBusy);
  toggleControlState(elements.refreshLibrary, !isBusy);
  document.body.classList.toggle("is-loading", isBusy);
}

function toggleControlState(element, enabled) {
  if (!element) {
    return;
  }

  if ("disabled" in element) {
    element.disabled = !enabled;
  }
}

function setDirty(isDirty) {
  state.dirty = isDirty;
  updateDirtyIndicator();
}

function updateDirtyIndicator() {
  elements.dirtyStateSummary.textContent = state.dirty ? "Unsaved changes" : "Clean";
  elements.documentStatusPill.classList.toggle("is-dirty", state.dirty);
  if (!state.activeDocument) {
    elements.dirtyStateSummary.textContent = "Clean";
  }
}

function seedEmptyEditor() {
  const document = createBlankDocument();
  state.activeDocument = document;
  state.selectedSlug = null;
  state.selectedStatus = null;
  state.rawMarkdown = document.rawMarkdown;
  state.parsed = parseMarkdownDocument(document.rawMarkdown);
  state.dirty = false;
  populateControls(document);
  elements.markdownInput.value = document.rawMarkdown;
  setEditorHeading(document);
  updateDocumentIndicators(document);
  updateDirtyIndicator();
  renderPreviewState();
}

function createBlankDocument() {
  const rawMarkdown = buildMarkdownFromFrontmatter(
    {
      title: "Untitled draft",
      slug: "untitled-draft",
      description: "Add a short summary for the blog index and social preview.",
      author: "Daliso Ngoma",
      date: new Date().toISOString(),
      tags: [],
      origin: "human",
      showOriginLabel: false,
    },
    "# Untitled draft\n\nWrite your opening paragraph here.\n\n## Key Idea\n\nAdd the main argument.\n"
  );

  return normalizeDocument(
    {
      title: "Untitled draft",
      slug: "untitled-draft",
      description: "Add a short summary for the blog index and social preview.",
      author: "Daliso Ngoma",
      date: new Date().toISOString(),
      tags: [],
      origin: "human",
      showOriginLabel: false,
      markdown: rawMarkdown,
      status: "draft",
    },
    "draft"
  );
}

function applyMarkdownChange(markdown) {
  state.rawMarkdown = markdown;
  state.parsed = parseMarkdownDocument(markdown);
  syncControlsFromParsedDocument(state.parsed);
  setDirty(markdown !== state.activeDocument?.rawMarkdown);
  renderPreviewState();
  schedulePreviewRefresh();
}

function syncControlsFromParsedDocument(parsed) {
  const frontmatter = parsed.frontmatter ?? {};
  const existingFrontmatter = state.activeDocument?.frontmatter ?? {};
  const mergedDocument = {
    ...state.activeDocument,
    title: frontmatter.title ?? existingFrontmatter.title ?? state.activeDocument?.title ?? "Untitled draft",
    slug: frontmatter.slug ?? existingFrontmatter.slug ?? state.activeDocument?.slug ?? "untitled-draft",
    origin: frontmatter.origin ?? existingFrontmatter.origin ?? state.activeDocument?.origin ?? "human",
    status: state.activeDocument?.status ?? "draft",
  };

  elements.fieldTitle.value = pickStringValue(frontmatter.title, existingFrontmatter.title, "");
  elements.fieldSlug.value = pickStringValue(frontmatter.slug, existingFrontmatter.slug, "");
  elements.fieldDescription.value = pickStringValue(
    frontmatter.description,
    existingFrontmatter.description,
    ""
  );
  elements.fieldAuthor.value = pickStringValue(frontmatter.author, existingFrontmatter.author, "");
  elements.fieldDate.value = pickStringValue(frontmatter.date, existingFrontmatter.date, "");
  elements.fieldTags.value = serializeTags(frontmatter.tags, existingFrontmatter.tags);
  elements.fieldOrigin.value = pickStringValue(frontmatter.origin, existingFrontmatter.origin, "human");
  elements.fieldShowOrigin.checked = pickBooleanValue(
    frontmatter.showOriginLabel,
    existingFrontmatter.showOriginLabel,
    false
  );
  setEditorHeading(mergedDocument);
  updateDocumentIndicators(mergedDocument);
}

function syncMarkdownFromMetadata() {
  if (!state.activeDocument) {
    return;
  }

  const parsedFrontmatter = state.parsed.frontmatter ?? {};
  const existingFrontmatter = state.activeDocument.frontmatter ?? {};
  const tags = splitTags(elements.fieldTags.value);
  const frontmatter = {
    ...existingFrontmatter,
    ...parsedFrontmatter,
    title: pickStringValue(elements.fieldTitle.value.trim(), parsedFrontmatter.title, existingFrontmatter.title),
    slug: pickStringValue(elements.fieldSlug.value.trim(), parsedFrontmatter.slug, existingFrontmatter.slug),
    description: pickStringValue(
      elements.fieldDescription.value.trim(),
      parsedFrontmatter.description,
      existingFrontmatter.description
    ),
    author: pickStringValue(elements.fieldAuthor.value.trim(), parsedFrontmatter.author, existingFrontmatter.author),
    date: pickStringValue(elements.fieldDate.value.trim(), parsedFrontmatter.date, existingFrontmatter.date),
    tags: tags.length ? tags : normalizeTags(parsedFrontmatter.tags ?? existingFrontmatter.tags),
    origin: pickStringValue(elements.fieldOrigin.value, parsedFrontmatter.origin, existingFrontmatter.origin ?? "human"),
    showOriginLabel: elements.fieldShowOrigin.checked,
  };

  const body = state.parsed.body || state.activeDocument.body || "";
  const markdown = buildMarkdownFromFrontmatter(frontmatter, body);
  state.rawMarkdown = markdown;
  state.parsed = { frontmatter, body };
  elements.markdownInput.value = markdown;
  setDirty(markdown !== state.activeDocument.rawMarkdown);
  const mergedDocument = {
    ...state.activeDocument,
    title: frontmatter.title || state.activeDocument.title,
    slug: frontmatter.slug || state.activeDocument.slug,
    origin: frontmatter.origin || state.activeDocument.origin || "human",
    status: state.activeDocument.status,
  };

  setEditorHeading(mergedDocument);
  updateDocumentIndicators(mergedDocument);
}

function buildDocumentPayload(status) {
  const parsed = parseMarkdownDocument(elements.markdownInput.value);
  const parsedFrontmatter = parsed.frontmatter ?? {};
  const existingFrontmatter = state.activeDocument?.frontmatter ?? {};
  const tags = splitTags(elements.fieldTags.value);
  const frontmatter = {
    ...existingFrontmatter,
    ...parsedFrontmatter,
    title: pickStringValue(elements.fieldTitle.value.trim(), parsedFrontmatter.title, existingFrontmatter.title),
    slug: pickStringValue(elements.fieldSlug.value.trim(), parsedFrontmatter.slug, existingFrontmatter.slug),
    description: pickStringValue(
      elements.fieldDescription.value.trim(),
      parsedFrontmatter.description,
      existingFrontmatter.description
    ),
    author: pickStringValue(elements.fieldAuthor.value.trim(), parsedFrontmatter.author, existingFrontmatter.author),
    date: pickStringValue(elements.fieldDate.value.trim(), parsedFrontmatter.date, existingFrontmatter.date),
    tags: tags.length ? tags : normalizeTags(parsedFrontmatter.tags ?? existingFrontmatter.tags),
    origin: pickStringValue(elements.fieldOrigin.value, parsedFrontmatter.origin, existingFrontmatter.origin ?? "human"),
    showOriginLabel: elements.fieldShowOrigin.checked,
  };
  const body = parsed.body;
  const markdown = buildMarkdownFromFrontmatter(frontmatter, body);

  return {
    status,
    previousStatus: state.activeDocument?.status ?? "draft",
    previousSlug: state.activeDocument?.slug ?? frontmatter.slug,
    slug: frontmatter.slug,
    title: frontmatter.title,
    description: frontmatter.description,
    author: frontmatter.author,
    date: frontmatter.date,
    tags: frontmatter.tags,
    origin: frontmatter.origin,
    showOriginLabel: frontmatter.showOriginLabel,
    markdown,
    content: markdown,
    body,
  };
}

function syncMetadataToMarkdown() {
  if (!state.activeDocument) {
    return;
  }

  syncMarkdownFromMetadata();
}

function schedulePreviewRefresh(force = false) {
  if (!state.activeDocument) {
    renderPreviewState();
    return;
  }

  if (state.previewTimer) {
    window.clearTimeout(state.previewTimer);
  }

  state.previewTimer = window.setTimeout(() => {
    void refreshPreview(force);
  }, force ? 0 : 250);
}

async function refreshPreview(force = false) {
  if (!state.activeDocument) {
    renderPreviewState();
    return;
  }

  const requestId = ++state.requestNonce;
  state.previewLoading = true;
  setPreviewStatus("Rendering preview...", "info");

  const payload = buildDocumentPayload(state.activeDocument.status);

  try {
    const response = await fetch(API.preview, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`POST ${API.preview} failed with ${response.status}`);
    }

    const rawResponse = await response.text();
    let data = rawResponse;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      // The preview endpoint may return HTML directly; keep the raw body in that case.
    }

    if (requestId !== state.requestNonce) {
      return;
    }

    renderPreviewMarkup(data, payload);
    setPreviewStatus(force ? "Preview refreshed." : "Preview updated.", "success");
  } catch (error) {
    if (requestId !== state.requestNonce) {
      return;
    }

    const fallback = escapeHtml(payload.markdown).replace(/\n/g, "<br />");
    elements.previewFrame.innerHTML = renderDisclosureNote(payload) + `<div class="preview-empty-state"><h3>Preview unavailable</h3><p>${fallback}</p></div>`;
    setPreviewStatus(formatError(error, "Preview endpoint unavailable."), "error");
  } finally {
    if (requestId === state.requestNonce) {
      state.previewLoading = false;
      renderPreviewState();
    }
  }
}

function renderPreviewMarkup(responseData, payload) {
  const html = normalizePreviewHtml(responseData);
  const disclosure = renderDisclosureNote(payload);
  elements.previewFrame.innerHTML = `${disclosure}${html || "<div class='preview-empty-state'><h3>Empty preview</h3><p>No HTML was returned from the preview endpoint.</p></div>"}`;
}

function renderPreviewState() {
  if (!state.activeDocument) {
    elements.previewFrame.innerHTML = `
      <div class="preview-empty-state">
        <h3>No document selected</h3>
        <p>Create a draft or choose one from the sidebar to begin editing.</p>
      </div>
    `;
    elements.previewStatus.textContent = "Waiting for content";
    elements.previewStateSummary.textContent = "Waiting for content";
    return;
  }

  if (!state.previewLoading && elements.previewFrame.childElementCount === 0) {
    elements.previewFrame.innerHTML = `
      <div class="preview-empty-state">
        <h3>Preview pending</h3>
        <p>Use the refresh button or edit the document to render the current Markdown.</p>
      </div>
    `;
  }

  elements.previewStateSummary.textContent = state.previewLoading ? "Rendering" : state.dirty ? "Unsaved changes" : "Ready";
}

function setPreviewStatus(message, tone = "info") {
  elements.previewStatus.textContent = message;
  if (tone === "error") {
    elements.previewStatus.classList.add("is-error");
  } else {
    elements.previewStatus.classList.remove("is-error");
  }
}

function renderDisclosureNote(payload) {
  if (!shouldShowDisclosure(payload)) {
    return "";
  }

  const label = humanizeOrigin(payload.origin);
  return `
    <aside class="studio-disclosure-note" aria-label="AI disclosure">
      <strong>${escapeHtml(label)} content</strong>
      <p>This post is marked for public disclosure in the frontmatter and will show the label on the published page.</p>
    </aside>
  `;
}

function shouldShowDisclosure(payload) {
  return payload.showOriginLabel && payload.origin !== "human";
}

function normalizePreviewHtml(data) {
  if (typeof data === "string") {
    return data;
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const candidateKeys = [
    "html",
    "previewHtml",
    "bodyHtml",
    "contentHtml",
    "renderedHtml",
    "documentHtml",
  ];

  for (const key of candidateKeys) {
    if (typeof data[key] === "string" && data[key].trim()) {
      return data[key];
    }
  }

  if (typeof data.markdown === "string" && data.markdown.trim()) {
    return `<pre>${escapeHtml(data.markdown)}</pre>`;
  }

  return "";
}

function parseMarkdownDocument(markdown) {
  const source = String(markdown ?? "");
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!frontmatterMatch) {
    return {
      frontmatter: {},
      body: source.trimStart(),
    };
  }

  return {
    frontmatter: parseFrontmatterBlock(frontmatterMatch[1]),
    body: frontmatterMatch[2].replace(/^\s*\n/, ""),
  };
}

function parseFrontmatterBlock(block) {
  const lines = String(block ?? "").split(/\r?\n/);
  const frontmatter = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (rawValue === "") {
      const collected = [];
      while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        index += 1;
        collected.push(parseScalar(lines[index].replace(/^\s*-\s+/, "")));
      }
      frontmatter[key] = collected;
      continue;
    }

    frontmatter[key] = parseScalar(rawValue);
  }

  return frontmatter;
}

function parseScalar(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return "";
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    return normalized.slice(1, -1);
  }

  if (/^\[(.*)\]$/.test(normalized)) {
    const inner = normalized.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return inner.split(",").map((part) => stripQuotes(part.trim())).filter(Boolean);
  }

  return normalized;
}

function stripQuotes(value) {
  const text = String(value ?? "").trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function buildMarkdownFromFrontmatter(frontmatter, body) {
  const lines = ["---"];
  const orderedKeys = ["title", "slug", "description", "author", "date", "origin", "showOriginLabel"];

  for (const key of orderedKeys) {
    const value = frontmatter[key];
    if (typeof value === "undefined" || value === null || value === "") {
      continue;
    }

    if (typeof value === "boolean") {
      lines.push(`${key}: ${value ? "true" : "false"}`);
      continue;
    }

    lines.push(`${key}: ${JSON.stringify(String(value))}`);
  }

  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.filter(Boolean) : [];
  if (tags.length) {
    lines.push("tags:");
    tags.forEach((tag) => {
      lines.push(`  - ${JSON.stringify(String(tag))}`);
    });
  }

  lines.push("---", "");
  const normalizedBody = String(body ?? "").replace(/^\n+/, "");
  lines.push(normalizedBody || "# Untitled draft", "");
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function normalizeDocumentGroups(payload) {
  const drafts = [];
  const published = [];

  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      const document = normalizeDocument(item, item?.status ?? "draft");
      if (document.status === "published") {
        published.push(document);
      } else {
        drafts.push(document);
      }
    });
  } else if (payload && typeof payload === "object") {
    const candidates = [
      ["draft", payload.drafts],
      ["published", payload.published],
      ["draft", payload.draftPosts],
      ["published", payload.publishedPosts],
    ];

    let handled = false;
    candidates.forEach(([status, items]) => {
      if (!Array.isArray(items)) {
        return;
      }
      handled = true;
      items.forEach((item) => {
        const document = normalizeDocument(item, status);
        if (document.status === "published") {
          published.push(document);
        } else {
          drafts.push(document);
        }
      });
    });

    if (!handled && Array.isArray(payload.documents)) {
      payload.documents.forEach((item) => {
        const document = normalizeDocument(item, item?.status ?? "draft");
        if (document.status === "published") {
          published.push(document);
        } else {
          drafts.push(document);
        }
      });
    }
  }

  return {
    draft: sortDocuments(drafts),
    published: sortDocuments(published),
  };
}

function normalizeDocument(item, fallbackStatus = "draft") {
  const frontmatter = extractFrontmatter(item);
  const status = normalizeStatus(item?.status ?? frontmatter.status ?? fallbackStatus);
  const slug = String(item?.slug ?? frontmatter.slug ?? "").trim() || slugify(item?.title ?? frontmatter.title ?? "untitled-draft");
  const title = String(item?.title ?? frontmatter.title ?? slug).trim() || slug;
  const description = String(item?.description ?? frontmatter.description ?? "").trim();
  const author = String(item?.author ?? frontmatter.author ?? "Daliso Ngoma").trim();
  const date = String(item?.date ?? item?.dateStamp ?? frontmatter.date ?? item?.updatedAt ?? new Date().toISOString()).trim();
  const origin = normalizeOrigin(item?.origin ?? frontmatter.origin ?? "human");
  const showOriginLabel = Boolean(item?.showOriginLabel ?? frontmatter.showOriginLabel ?? false);
  const tags = normalizeTags(item?.tags ?? frontmatter.tags);
  const markdown = String(item?.markdown ?? item?.content ?? item?.body ?? buildMarkdownFromFrontmatter({
    title,
    slug,
    description,
    author,
    date,
    tags,
    origin,
    showOriginLabel,
  }, item?.body ?? item?.contentBody ?? item?.text ?? `# ${title}\n\nWrite your opening paragraph here.\n`));
  const parsed = parseMarkdownDocument(markdown);

  return {
    status,
    slug,
    title,
    description,
    author,
    date,
    dateStamp: date,
    origin,
    showOriginLabel,
    tags,
    rawMarkdown: markdown,
    body: parsed.body,
    frontmatter: {
      ...parsed.frontmatter,
      title,
      slug,
      description,
      author,
      date,
      tags,
      origin,
      showOriginLabel,
    },
    updatedAt: String(item?.updatedAt ?? item?.modifiedAt ?? item?.date ?? date),
  };
}

function extractFrontmatter(item) {
  if (!item || typeof item !== "object") {
    return {};
  }

  if (item.frontmatter && typeof item.frontmatter === "object") {
    return item.frontmatter;
  }

  return item;
}

function upsertDocumentInGroups(groups, document) {
  const next = {
    draft: groups.draft.filter((item) => item.slug !== document.slug),
    published: groups.published.filter((item) => item.slug !== document.slug),
  };

  next[document.status === "published" ? "published" : "draft"].unshift(document);
  return {
    draft: sortDocuments(next.draft),
    published: sortDocuments(next.published),
  };
}

function sortDocuments(documents) {
  return [...documents].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt || left.dateStamp || left.date || "");
    const rightTime = Date.parse(right.updatedAt || right.dateStamp || right.date || "");

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return right.title.localeCompare(left.title);
  });
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return splitTags(value);
  }

  return [];
}

function splitTags(value) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function serializeTags(primaryValue, fallbackValue) {
  const tags = normalizeTags(primaryValue);
  if (tags.length) {
    return tags.join(", ");
  }

  return normalizeTags(fallbackValue).join(", ");
}

function pickStringValue(primary, secondary, fallback = "") {
  const values = [primary, secondary, fallback];

  for (const value of values) {
    const normalized = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function pickBooleanValue(primary, secondary, fallback = false) {
  if (typeof primary === "boolean") {
    return primary;
  }

  if (typeof secondary === "boolean") {
    return secondary;
  }

  return fallback;
}

function normalizeStatus(status) {
  return String(status ?? "draft").toLowerCase() === "published" ? "published" : "draft";
}

function normalizeOrigin(origin) {
  const value = String(origin ?? "human").toLowerCase();
  return ORIGIN_OPTIONS.some((option) => option.value === value) ? value : "human";
}

function humanizeOrigin(origin) {
  const option = ORIGIN_OPTIONS.find((entry) => entry.value === normalizeOrigin(origin));
  return option ? option.label : "Human-written";
}

function capitalize(value) {
  const text = String(value ?? "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatReadableDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function setEditorLocked(isLocked) {
  [
    elements.fieldTitle,
    elements.fieldSlug,
    elements.fieldDescription,
    elements.fieldAuthor,
    elements.fieldDate,
    elements.fieldTags,
    elements.fieldOrigin,
    elements.fieldShowOrigin,
    elements.markdownInput,
  ].forEach((control) => {
    if (!control) {
      return;
    }
    if ("disabled" in control) {
      control.disabled = isLocked;
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatError(error, fallbackMessage) {
  const detail = error instanceof Error ? error.message : String(error ?? "");
  return detail ? `${fallbackMessage} ${detail}` : fallbackMessage;
}
