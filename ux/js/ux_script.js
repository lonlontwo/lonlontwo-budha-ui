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
                loadSettingsData();
            } else {
                document.getElementById('buttonManagementView').classList.add('active');
                loadButtonList(tabName);
            }
        });
    });
}

// ===================================
// == 列表渲染 ==
// ===================================
function loadButtonList(type) {
    console.log(`載入列表: ${type}`);
    const container = document.getElementById('listContainer');
    if (!container) return;

    container.innerHTML = ''; // 清空

    let data = [];

    // 根據類型選擇資料來源
    if (type === 'common') {
        // 檢查 commonButtonData 是否存在
        if (typeof commonButtonData !== 'undefined') {
            data = commonButtonData.map(item => ({
                name: item.name,
                image: item.imageUrl,
                url: item.linkUrl,
                desc: '', // 常用按鈕無說明
                active: true,
                locked: false
            }));

            // 更新計數
            const badge = document.querySelector(`.tab-btn[data-tab="common"] .badge`);
            if (badge) badge.textContent = data.length;
        } else {
            console.error('找不到 commonButtonData');
            container.innerHTML = '<div class="empty-state">無法讀取常用按鈕資料</div>';
            return;
        }
    } else if (type === 'tools') {
        // 檢查 mainButtonData 是否存在
        if (typeof mainButtonData !== 'undefined') {
            data = mainButtonData.map(item => ({
                name: item.name,
                image: item.imageUrl,
                url: item.linkUrl,
                desc: item.description || '', // 工具按鈕有說明
                active: true,
                locked: false
            }));

            // 更新計數
            const count = document.querySelector(`.tab-btn[data-tab="tools"] .count`);
            if (count) count.textContent = data.length;
        } else {
            console.error('找不到 mainButtonData');
            container.innerHTML = '<div class="empty-state">無法讀取工具按鈕資料</div>';
            return;
        }
    } else {
        console.log('尚未實作此類型的資料讀取');
        container.innerHTML = '<div class="empty-state">此分類暫無資料</div>';
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">暫無資料</div>';
        return;
    }

    // 渲染列表
    data.forEach((item, index) => {
        // 將說明文字加入顯示 (如果有)
        const descHtml = item.desc ? `<div class="info-row desc" style="font-size: 0.8rem; color: #888; margin-top: 4px;">📝 ${item.desc}</div>` : '';

        const itemHTML = `
            <div class="list-item">
                <div class="item-img-box">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60?text=No+Img'">
                </div>
                <div class="item-info">
                    <div class="info-row start">
                        ${item.locked ? '<span class="lock-icon">🔒</span>' : ''}
                        <span class="item-name">${item.name}</span>
                        <span class="status-badge ${item.active ? 'active' : ''}">${item.active ? '啟用' : '停用'}</span>
                    </div>
                    ${descHtml}
                    <div class="info-row link">
                        <span class="link-icon">🔗</span>
                        <span class="item-link"><a href="${item.url}" target="_blank" style="color: inherit; text-decoration: none;">${item.url}</a></span>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="alert('編輯功能開發中: ${item.name}')">編輯</button>
                        <button class="action-btn delete" onclick="alert('刪除功能開發中')">刪除</button>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${item.active ? 'checked' : ''} onchange="console.log('切換狀態: ${item.name}')">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
}

// ===================================
// == 設定資料載入 ==
// ===================================
function loadSettingsData() {
    console.log('載入系統設定...');

    // 檢查 uiConfig 是否存在
    if (typeof uiConfig !== 'undefined') {
        const marqueeInput = document.getElementById('marqueeInput');
        const logoLinkInput = document.getElementById('logoLinkInput');

        // 填入跑馬燈文字
        if (uiConfig.marquee && uiConfig.marquee.text) {
            marqueeInput.value = uiConfig.marquee.text;
            // 更新提示文字
            const marqueeHint = marqueeInput.nextElementSibling;
            if (marqueeHint) marqueeHint.textContent = `目前設置：${uiConfig.marquee.text.substring(0, 30)}...`;
        }

        // 填入 LOGO 圖片網址 (作為暫時的 LOGO 連結欄位)
        if (uiConfig.logo && uiConfig.logo.imageUrl) {
            logoLinkInput.value = uiConfig.logo.imageUrl;
            const logoHint = logoLinkInput.nextElementSibling;
            if (logoHint) logoHint.textContent = `目前設置：${uiConfig.logo.imageUrl}`;
        }
    } else {
        console.warn('uiConfig 未定義');
    }
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
    loadButtonList,
    loadSettingsData,
    showNotification
};
