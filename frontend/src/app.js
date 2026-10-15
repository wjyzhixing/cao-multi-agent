import {
  listBicycles,
  getBicycle,
  createBicycle,
  updateBicycle,
  deleteBicycle,
  getBaseUrl,
  setGlobalBaseUrl,
  ApiError
} from './api.js';

// Application state
const state = {
  bicycles: [],
  meta: { page: 1, pageSize: 10, total: 0 },
  loading: false,
  error: null,
  editingId: null,
  viewingItem: null,
  deletingItem: null,
  searchQuery: '',
};

// DOM Elements
const elements = {
  tableBody: document.getElementById('bicycle-table-body'),
  emptyState: document.getElementById('empty-state'),
  loadingState: document.getElementById('loading-state'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  errorCode: document.getElementById('error-code'),
  closeErrorBtn: document.getElementById('btn-close-error'),

  // Pagination
  paginationContainer: document.getElementById('pagination-container'),
  pageInfo: document.getElementById('page-info'),
  totalInfo: document.getElementById('total-info'),
  btnPrevPage: document.getElementById('btn-prev-page'),
  btnNextPage: document.getElementById('btn-next-page'),
  pageSizeSelect: document.getElementById('page-size-select'),

  // Search & Filter
  searchInput: document.getElementById('search-input'),
  btnRefresh: document.getElementById('btn-refresh'),
  btnOpenCreate: document.getElementById('btn-open-create'),

  // Modals
  formModal: document.getElementById('form-modal'),
  formModalTitle: document.getElementById('form-modal-title'),
  bicycleForm: document.getElementById('bicycle-form'),
  formErrorBanner: document.getElementById('form-error-banner'),
  formErrorMessage: document.getElementById('form-error-message'),
  btnCancelForm: document.getElementById('btn-cancel-form'),
  inputName: document.getElementById('input-name'),
  inputBrand: document.getElementById('input-brand'),
  inputType: document.getElementById('input-type'),
  inputPrice: document.getElementById('input-price'),
  btnSubmitForm: document.getElementById('btn-submit-form'),

  // Details Modal
  viewModal: document.getElementById('view-modal'),
  viewId: document.getElementById('view-id'),
  viewName: document.getElementById('view-name'),
  viewBrand: document.getElementById('view-brand'),
  viewType: document.getElementById('view-type'),
  viewPrice: document.getElementById('view-price'),
  viewCreatedAt: document.getElementById('view-created-at'),
  btnCloseView: document.getElementById('btn-close-view'),

  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  deleteTargetName: document.getElementById('delete-target-name'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),
  btnCancelDelete: document.getElementById('btn-cancel-delete'),

  // API Config
  apiBaseInput: document.getElementById('api-base-input'),
  btnApplyApiBase: document.getElementById('btn-apply-api-base'),

  // Toasts
  toastContainer: document.getElementById('toast-container'),
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

export function showToast(message, type = 'success') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showError(error) {
  state.error = error;
  if (!elements.errorBanner) return;
  if (error) {
    elements.errorMessage.textContent = error.message || 'An error occurred';
    elements.errorCode.textContent = error.code ? `[${error.code}]` : '';
    elements.errorBanner.classList.remove('hidden');
  } else {
    elements.errorBanner.classList.add('hidden');
  }
}

function showFormError(error) {
  if (!elements.formErrorBanner) return;
  if (error) {
    elements.formErrorMessage.textContent = error.message || 'Validation error';
    elements.formErrorBanner.classList.remove('hidden');
  } else {
    elements.formErrorBanner.classList.add('hidden');
  }
}

export async function loadBicycles(page = state.meta.page, pageSize = state.meta.pageSize) {
  state.loading = true;
  showError(null);
  renderLoadingState();

  try {
    const result = await listBicycles({ page, pageSize });
    state.bicycles = result.items || [];
    state.meta = result.meta || { page, pageSize, total: state.bicycles.length };
  } catch (err) {
    state.bicycles = [];
    showError(err);
    showToast(err.message, 'error');
  } finally {
    state.loading = false;
    render();
  }
}

function renderLoadingState() {
  if (elements.loadingState) {
    elements.loadingState.classList.toggle('hidden', !state.loading);
  }
  if (elements.tableBody && state.loading) {
    elements.tableBody.innerHTML = '';
  }
}

function render() {
  if (!elements.tableBody) return;
  renderLoadingState();

  // Filter based on search query
  const query = state.searchQuery.toLowerCase().trim();
  const filtered = query
    ? state.bicycles.filter(
        (b) =>
          b.name?.toLowerCase().includes(query) ||
          b.brand?.toLowerCase().includes(query) ||
          b.type?.toLowerCase().includes(query) ||
          b.id?.toLowerCase().includes(query)
      )
    : state.bicycles;

  elements.tableBody.innerHTML = '';

  if (filtered.length === 0 && !state.loading) {
    elements.emptyState?.classList.remove('hidden');
  } else {
    elements.emptyState?.classList.add('hidden');
  }

  for (const bicycle of filtered) {
    const tr = document.createElement('tr');
    tr.className = 'table-row';

    tr.innerHTML = `
      <td class="font-mono text-xs text-muted" title="${escapeHtml(bicycle.id)}">
        ${escapeHtml(bicycle.id.slice(0, 8))}...
      </td>
      <td class="font-medium">${escapeHtml(bicycle.name)}</td>
      <td><span class="badge badge-brand">${escapeHtml(bicycle.brand)}</span></td>
      <td><span class="badge badge-type">${escapeHtml(bicycle.type)}</span></td>
      <td class="font-semibold text-price">${formatCurrency(bicycle.price)}</td>
      <td class="text-xs text-muted">${formatDate(bicycle.createdAt)}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-ghost action-view" data-id="${bicycle.id}" title="View Details">
          View
        </button>
        <button class="btn btn-sm btn-outline action-edit" data-id="${bicycle.id}" title="Edit">
          Edit
        </button>
        <button class="btn btn-sm btn-danger action-delete" data-id="${bicycle.id}" title="Delete">
          Delete
        </button>
      </td>
    `;

    tr.querySelector('.action-view').addEventListener('click', () => handleOpenView(bicycle.id));
    tr.querySelector('.action-edit').addEventListener('click', () => handleOpenEdit(bicycle));
    tr.querySelector('.action-delete').addEventListener('click', () => handleOpenDelete(bicycle));

    elements.tableBody.appendChild(tr);
  }

  // Update pagination info
  const total = state.meta.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / state.meta.pageSize));
  const currentPage = state.meta.page;

  if (elements.pageInfo) {
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
  if (elements.totalInfo) {
    elements.totalInfo.textContent = `Total: ${total} ${total === 1 ? 'item' : 'items'}`;
  }
  if (elements.btnPrevPage) {
    elements.btnPrevPage.disabled = currentPage <= 1 || state.loading;
  }
  if (elements.btnNextPage) {
    elements.btnNextPage.disabled = currentPage >= totalPages || state.loading;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function handleOpenView(id) {
  try {
    const bicycle = await getBicycle(id);
    state.viewingItem = bicycle;
    if (elements.viewId) elements.viewId.textContent = bicycle.id;
    if (elements.viewName) elements.viewName.textContent = bicycle.name;
    if (elements.viewBrand) elements.viewBrand.textContent = bicycle.brand;
    if (elements.viewType) elements.viewType.textContent = bicycle.type;
    if (elements.viewPrice) elements.viewPrice.textContent = formatCurrency(bicycle.price);
    if (elements.viewCreatedAt) elements.viewCreatedAt.textContent = formatDate(bicycle.createdAt);
    elements.viewModal?.classList.remove('hidden');
  } catch (err) {
    showToast(`Failed to load details: ${err.message}`, 'error');
  }
}

function handleOpenCreate() {
  state.editingId = null;
  showFormError(null);
  if (elements.formModalTitle) elements.formModalTitle.textContent = 'Add New Bicycle';
  if (elements.btnSubmitForm) elements.btnSubmitForm.textContent = 'Create Bicycle';
  elements.bicycleForm?.reset();
  elements.formModal?.classList.remove('hidden');
  elements.inputName?.focus();
}

function handleOpenEdit(bicycle) {
  state.editingId = bicycle.id;
  showFormError(null);
  if (elements.formModalTitle) elements.formModalTitle.textContent = 'Edit Bicycle';
  if (elements.btnSubmitForm) elements.btnSubmitForm.textContent = 'Save Changes';
  if (elements.inputName) elements.inputName.value = bicycle.name;
  if (elements.inputBrand) elements.inputBrand.value = bicycle.brand;
  if (elements.inputType) elements.inputType.value = bicycle.type;
  if (elements.inputPrice) elements.inputPrice.value = bicycle.price;
  elements.formModal?.classList.remove('hidden');
  elements.inputName?.focus();
}

function handleCloseForm() {
  state.editingId = null;
  elements.formModal?.classList.add('hidden');
  showFormError(null);
}

function handleCloseView() {
  state.viewingItem = null;
  elements.viewModal?.classList.add('hidden');
}

function handleOpenDelete(bicycle) {
  state.deletingItem = bicycle;
  if (elements.deleteTargetName) {
    elements.deleteTargetName.textContent = `"${bicycle.name}" (${bicycle.brand} ${bicycle.type})`;
  }
  elements.deleteModal?.classList.remove('hidden');
}

function handleCloseDelete() {
  state.deletingItem = null;
  elements.deleteModal?.classList.add('hidden');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  showFormError(null);

  const name = elements.inputName?.value?.trim() || '';
  const brand = elements.inputBrand?.value?.trim() || '';
  const type = elements.inputType?.value?.trim() || '';
  const priceVal = elements.inputPrice?.value;
  const price = priceVal !== '' ? Number(priceVal) : NaN;

  // Client validation
  if (!name) {
    showFormError(new Error('Name cannot be empty'));
    return;
  }
  if (!brand) {
    showFormError(new Error('Brand cannot be empty'));
    return;
  }
  if (!type) {
    showFormError(new Error('Type cannot be empty'));
    return;
  }
  if (Number.isNaN(price) || price < 0) {
    showFormError(new Error('Price must be a valid number greater than or equal to 0'));
    return;
  }

  const payload = { name, brand, type, price };

  try {
    elements.btnSubmitForm.disabled = true;
    if (state.editingId) {
      await updateBicycle(state.editingId, payload);
      showToast('Bicycle updated successfully', 'success');
    } else {
      await createBicycle(payload);
      showToast('Bicycle created successfully', 'success');
    }
    handleCloseForm();
    await loadBicycles();
  } catch (err) {
    showFormError(err);
  } finally {
    if (elements.btnSubmitForm) elements.btnSubmitForm.disabled = false;
  }
}

async function handleConfirmDelete() {
  if (!state.deletingItem) return;
  try {
    elements.btnConfirmDelete.disabled = true;
    await deleteBicycle(state.deletingItem.id);
    showToast('Bicycle deleted successfully', 'success');
    handleCloseDelete();
    // If last item on page > 1 was deleted, go back 1 page
    if (state.bicycles.length === 1 && state.meta.page > 1) {
      state.meta.page -= 1;
    }
    await loadBicycles(state.meta.page, state.meta.pageSize);
  } catch (err) {
    showToast(`Failed to delete: ${err.message}`, 'error');
    handleCloseDelete();
  } finally {
    if (elements.btnConfirmDelete) elements.btnConfirmDelete.disabled = false;
  }
}

// Bind event listeners
export function initApp() {
  // Search
  elements.searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    render();
  });

  // Refresh
  elements.btnRefresh?.addEventListener('click', () => {
    loadBicycles();
  });

  // Open Create
  elements.btnOpenCreate?.addEventListener('click', handleOpenCreate);

  // Form actions
  elements.bicycleForm?.addEventListener('submit', handleFormSubmit);
  elements.btnCancelForm?.addEventListener('click', handleCloseForm);

  // View Modal actions
  elements.btnCloseView?.addEventListener('click', handleCloseView);

  // Delete Modal actions
  elements.btnConfirmDelete?.addEventListener('click', handleConfirmDelete);
  elements.btnCancelDelete?.addEventListener('click', handleCloseDelete);

  // Pagination actions
  elements.btnPrevPage?.addEventListener('click', () => {
    if (state.meta.page > 1) {
      loadBicycles(state.meta.page - 1, state.meta.pageSize);
    }
  });

  elements.btnNextPage?.addEventListener('click', () => {
    const totalPages = Math.ceil(state.meta.total / state.meta.pageSize);
    if (state.meta.page < totalPages) {
      loadBicycles(state.meta.page + 1, state.meta.pageSize);
    }
  });

  elements.pageSizeSelect?.addEventListener('change', (e) => {
    const newPageSize = parseInt(e.target.value, 10);
    state.meta.pageSize = newPageSize;
    loadBicycles(1, newPageSize);
  });

  // Close Error Banner
  elements.closeErrorBtn?.addEventListener('click', () => {
    showError(null);
  });

  // API Config
  if (elements.apiBaseInput) {
    elements.apiBaseInput.value = getBaseUrl();
  }
  elements.btnApplyApiBase?.addEventListener('click', () => {
    const newBase = elements.apiBaseInput?.value?.trim();
    if (newBase) {
      setGlobalBaseUrl(newBase);
      showToast(`API Base URL updated to ${newBase}`, 'info');
      loadBicycles(1, state.meta.pageSize);
    }
  });

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === elements.formModal) handleCloseForm();
    if (e.target === elements.viewModal) handleCloseView();
    if (e.target === elements.deleteModal) handleCloseDelete();
  });

  // Initial load
  loadBicycles();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initApp);
}
