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
const logoutButton = document.getElementById('logoutButton');

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
    isLoggedIn = false;
    sessionStorage.removeItem('ux_logged_in');
    showLogin();
}

function showLogin() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
}

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'grid';
    loadDashboardData();
}

// ===================================
// == 頁面切換功能 ==
// ===================================
function switchView(viewName) {
    // 隱藏所有視圖
    const allViews = document.querySelectorAll('.view-content');
    allViews.forEach(view => view.classList.remove('active'));

    // 移除所有選單項目的 active 狀態
    const allMenuItems = document.querySelectorAll('.menu-item');
    allMenuItems.forEach(item => item.classList.remove('active'));

    // 顯示選中的視圖
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // 設定選中的選單項目
    const targetMenuItem = document.querySelector(`[data-view="${viewName}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }

    // 載入對應頁面的資料
    loadViewData(viewName);
}

// ===================================
// == 資料載入功能 (預留) ==
// ===================================
function loadDashboardData() {
    console.log('載入儀表板資料...');
    // 這裡預留給您後續實作
}

function loadViewData(viewName) {
    console.log(`載入 ${viewName} 頁面資料...`);

    switch (viewName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'buttons':
            loadButtonsData();
            break;
        case 'records':
            loadRecordsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

function loadOverviewData() {
    console.log('載入總覽資料...');
    // 預留功能
}

function loadButtonsData() {
    console.log('載入按鈕資料...');
    // 預留功能
    const tableBody = document.getElementById('buttonTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">按鈕資料載入功能待實作</td></tr>';
    }
}

function loadRecordsData() {
    console.log('載入操作記錄...');
    // 預留功能
}

function loadSettingsData() {
    console.log('載入系統設定...');
    // 預留功能
}

// ===================================
// == 事件監聽器 ==
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('UX 後台系統已載入');
    console.log('Firebase 已初始化');

    // 檢查登入狀態
    const savedLoginState = sessionStorage.getItem('ux_logged_in');
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

    // 登出按鈕事件
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // 選單切換事件
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const viewName = this.getAttribute('data-view');
            switchView(viewName);
        });
    });
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
