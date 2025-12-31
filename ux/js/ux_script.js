// ===================================
// == UX 後台腳本 ==
// ===================================

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDMfZOGJWN-dWBl-Ium_Ism_SQfA_rPA-HMUI",
    authDomain: "lonlontwo-1d9de.firebaseapp.com",
    projectId: "lonlontwo-1d9de",
    storageBucket: "lonlontwo-1d9de.firebasestorage.app",
    messagingSenderId: "268283503569",
    appId: "1:268283503569:web:a9c0a8f7b0e0a3c8e8a0a0"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ===================================
// == 全域變數 ==
// ===================================
const ADMIN_PASSWORD = 'csmcsm46'; // 管理員密碼
let isLoggedIn = false;

// ===================================
// == DOM 元素 ==
// ===================================
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');
const backToFrontendBtn = document.getElementById('backToFrontendBtn');

// ===================================
// == 登入功能 ==
// ===================================
function handleLogin() {
    const password = passwordInput.value.trim();

    if (password === '') {
        showLoginError('請輸入密碼');
        return;
    }

    if (password === ADMIN_PASSWORD) {
        // 登入成功
        isLoggedIn = true;
        sessionStorage.setItem('ux_logged_in', 'true');
        showDashboard();
        loginError.textContent = '';
        passwordInput.value = '';
    } else {
        // 登入失敗
        showLoginError('密碼錯誤,請重試');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showLoginError(message) {
    loginError.textContent = message;
    passwordInput.classList.add('error');
    setTimeout(() => {
        passwordInput.classList.remove('error');
    }, 500);
}

function handleLogout() {
    // 導向回前台
    window.location.href = '../ui/index.html';
}

function showLogin() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
}

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    initTabs();
    // 預設載入常用按鈕
    loadButtonList('common');
}

// ===================================
// == 標籤切換功能 ==
// ===================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));

            // 啟用當前
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');

            if (tabName === 'settings') {
                document.getElementById('settingsView').classList.add('active');
            } else {
                document.getElementById('buttonManagementView').classList.add('active');
                loadButtonList(tabName);
            }
        });
    });
}

// ===================================
// == 列表渲染 (模擬資料) ==
// ===================================
function loadButtonList(type) {
    console.log(`載入列表: ${type}`);
    const container = document.getElementById('listContainer');
    if (!container) return;

    container.innerHTML = ''; // 清空

    // 模擬資料
    const mockData = [
        {
            name: "chatgpt",
            image: "https://i.ibb.co/6Jv2qS2p/chatgpt.jpg",
            url: "https://chat.openai.com/chat",
            active: true,
            locked: true
        },
        {
            name: "claude",
            image: "https://i.ibb.co/P2hQFNQ/claude.jpg",
            url: "https://claude.ai/chat/",
            active: true,
            locked: false
        }
    ];

    mockData.forEach(item => {
        const itemHTML = `
            <div class="list-item">
                <div class="item-img-box">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <div class="info-row start">
                        ${item.locked ? '<span class="lock-icon">🔒</span>' : ''}
                        <span class="item-name">${item.name}</span>
                        <span class="status-badge ${item.active ? 'active' : ''}">${item.active ? '啟用' : '停用'}</span>
                    </div>
                    <div class="info-row link">
                        <span class="link-icon">🔗</span>
                        <span class="item-link">${item.url}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="action-buttons">
                        <button class="action-btn edit">編輯</button>
                        <button class="action-btn delete">刪除</button>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${item.active ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
}

// ===================================
// == 事件監聽器 ==
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('UX 後台系統已載入');

    // 檢查登入狀態並顯示介面
    const savedLoginState = sessionStorage.getItem('ux_logged_in');

    // 初始化返回按鈕事件 (如果有)
    const backBtn = document.getElementById('backToFrontendBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../ui/index.html';
        });
    }

    if (savedLoginState === 'true') {
        isLoggedIn = true;
        showDashboard();
    } else {
        showLogin();
    }

    // 登入按鈕事件
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }

    // 密碼輸入框 Enter 鍵事件
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
});

// ===================================
// == 工具函數 ==
// ===================================
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW');
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // 預留通知功能
}

// ===================================
// == 匯出函數供外部使用 ==
// ===================================
window.uxAdmin = {
    switchView,
    loadViewData,
    showNotification
};
