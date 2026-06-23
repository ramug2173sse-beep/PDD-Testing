/* ============================================================
   SMAT AI - JavaScript Main
   ============================================================ */

// === Flash Alert Auto-dismiss ===
document.addEventListener('DOMContentLoaded', () => {
    // Auto-dismiss alerts after 5 seconds
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => { alert.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => alert.remove(), 300); }, 5000);
        const closeBtn = alert.querySelector('.alert-close');
        if (closeBtn) closeBtn.addEventListener('click', () => alert.remove());
    });

    // Mobile nav toggle
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
        document.addEventListener('click', e => {
            if (!navLinks.contains(e.target) && !toggle.contains(e.target)) navLinks.classList.remove('open');
        });
    }

    // Password show/hide
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.previousElementSibling || document.getElementById(this.dataset.target);
            if (!target) return;
            const isPass = target.type === 'password';
            target.type = isPass ? 'text' : 'password';
            this.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });

    // Password strength indicator
    const passInput = document.getElementById('password');
    const strengthBar = document.getElementById('passwordStrength');
    if (passInput && strengthBar) {
        passInput.addEventListener('input', () => {
            const val = passInput.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;
            strengthBar.className = 'password-strength';
            if (score <= 1) strengthBar.classList.add('weak');
            else if (score <= 3) strengthBar.classList.add('medium');
            else strengthBar.classList.add('strong');
        });
    }

    // Confidence bar animation
    document.querySelectorAll('.confidence-fill, .mini-fill').forEach(bar => {
        const target = bar.getAttribute('data-width') || bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = target; }, 100);
    });

    // Category accordion in checker
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function () {
            const grid = this.nextElementSibling;
            const icon = this.querySelector('.cat-toggle-icon i');
            if (grid) {
                const isOpen = grid.style.display !== 'none';
                grid.style.display = isOpen ? 'none' : 'grid';
                if (icon) { icon.classList.toggle('fa-chevron-down', isOpen); icon.classList.toggle('fa-chevron-up', !isOpen); }
            }
        });
    });

    // Set current date default for date inputs
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = new Date().toISOString().split('T')[0];
    });
});

// === Symptom Checker Functions ===
const selectedSymptoms = new Set();

function initChecker() {
    // Initial sync
    updateSelectedUI();

    // Attach change listeners to all checkboxes
    document.querySelectorAll('.symptom-checkbox').forEach(cb => {
        const item = cb.closest('.symptom-item');

        // Use change event - labels take care of the click
        cb.addEventListener('change', function () {
            toggleSymptom(this.value, this.checked, item);
        });

        // If the checkbox was pre-selected (e.g. browser autofill), update state
        if (cb.checked) {
            selectedSymptoms.add(cb.value);
            item?.classList.add('selected');
        }
    });

    // Final UI sync after initialization
    updateSelectedUI();
}

function toggleSymptom(name, checked, item) {
    if (checked) {
        selectedSymptoms.add(name);
        item?.classList.add('selected');
    } else {
        selectedSymptoms.delete(name);
        item?.classList.remove('selected');
    }
    updateSelectedUI();
    updateCategoryCount(item?.closest('.symptom-category'));
}

function updateSelectedUI() {
    const container = document.getElementById('selectedPills');
    const countEl = document.getElementById('selectedCount');
    const submitBtn = document.getElementById('predictBtn');
    const floatingBar = document.getElementById('floatingBar');
    const floCountEl = document.getElementById('floCount');
    const predictBtnFlo = document.getElementById('predictBtnFlo');

    if (!container) return;

    container.innerHTML = '';
    selectedSymptoms.forEach(s => {
        const pill = document.createElement('span');
        pill.className = 'selected-pill';
        pill.innerHTML = `${s.replace(/_/g, ' ')} <span onclick="removeSymptom('${s}')">&times;</span>`;
        container.appendChild(pill);
    });

    const count = selectedSymptoms.size;
    if (countEl) countEl.textContent = count;
    if (floCountEl) floCountEl.textContent = count;

    // Toggle floating bar visibility
    if (floatingBar) {
        floatingBar.classList.toggle('visible', count > 0);
    }

    const minSymptoms = 3;
    const isReady = count >= minSymptoms;
    const remaining = minSymptoms - count;

    if (submitBtn) {
        submitBtn.disabled = !isReady;
        if (!isReady) {
            submitBtn.innerHTML = `<i class="fas fa-info-circle"></i> Select ${remaining} more symptom${remaining > 1 ? 's' : ''}`;
        } else {
            submitBtn.innerHTML = `<i class="fas fa-robot"></i> Predict Disease Now (${count})`;
        }
    }

    if (predictBtnFlo) {
        predictBtnFlo.disabled = !isReady;
        predictBtnFlo.innerHTML = isReady ? `Predict Now (${count})` : `Select ${remaining} more`;
    }

    // Sync UI classes
    document.querySelectorAll('.symptom-item').forEach(item => {
        const cb = item.querySelector('.symptom-checkbox');
        if (cb) {
            item.classList.toggle('selected', cb.checked);
        }
    });
}

function removeSymptom(name) {
    selectedSymptoms.delete(name);
    const cb = document.querySelector(`.symptom-checkbox[value="${name}"]`);
    if (cb) {
        cb.checked = false;
        cb.closest('.symptom-item')?.classList.remove('selected');
    }
    updateSelectedUI();
}

function updateCategoryCount(categoryEl) {
    if (!categoryEl) return;
    const total = categoryEl.querySelectorAll('.symptom-checkbox').length;
    const selected = categoryEl.querySelectorAll('.symptom-checkbox:checked').length;
    const countEl = categoryEl.querySelector('.cat-count');
    if (countEl) countEl.textContent = selected > 0 ? `${selected}/${total} selected` : `${total} symptoms`;
}

function searchSymptoms() {
    const q = document.getElementById('symptomSearch')?.value?.toLowerCase() || '';
    document.querySelectorAll('.symptom-item').forEach(item => {
        const name = item.querySelector('.symptom-name')?.textContent?.toLowerCase() || '';
        item.style.display = name.includes(q) ? 'flex' : 'none';
    });
    // Expand all categories when searching
    if (q) {
        document.querySelectorAll('.symptoms-grid').forEach(g => g.style.display = 'grid');
    }
}

function filterBySeverity(severity) {
    document.querySelectorAll('.symptom-item').forEach(item => {
        if (!severity) { item.style.display = 'flex'; return; }
        const dot = item.querySelector('.severity-dot');
        item.style.display = dot?.classList.contains(severity) ? 'flex' : 'none';
    });
}

async function submitPrediction() {
    if (selectedSymptoms.size < 3) {
        showToast('Please select at least 3 symptoms', 'warning');
        return;
    }
    const btn = document.getElementById('predictBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    try {
        const resp = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: Array.from(selectedSymptoms) })
        });
        const data = await resp.json();
        if (data.success) {
            window.location.href = `/results/${data.prediction_id}`;
        } else {
            showToast(data.error || 'Prediction failed. Please try again.', 'danger');
            btn.disabled = false;
            btn.textContent = `Analyze ${selectedSymptoms.size} Symptoms`;
        }
    } catch (err) {
        showToast('Network error. Please try again.', 'danger');
        btn.disabled = false;
        btn.textContent = `Analyze ${selectedSymptoms.size} Symptoms`;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('flashContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'flashContainer'; c.className = 'flash-container';
        document.body.appendChild(c); return c;
    })();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>${message}`;
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Inject slideOut animation
const style = document.createElement('style');
style.textContent = '@keyframes slideOut { to { transform: translateX(120%); opacity: 0; } }';
document.head.appendChild(style);
