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
async function handleLogin() {
    const password = passwordInput.value.trim();

    if (password === '') {
        showLoginError('請輸入密碼');
        return;
    }

    // 顯示載入中... (可選)
    loginButton.textContent = '驗證中...';
    loginButton.disabled = true;

    try {
        // 從 Firebase 取得目前設定的密碼
        const doc = await db.collection('settings').doc('site_config').get();
        let currentPassword = ADMIN_PASSWORD; // 預設使用寫死密碼

        if (doc.exists && doc.data().admin_password) {
            currentPassword = doc.data().admin_password;
        }

        if (password === currentPassword) {
            // 登入成功
            isLoggedIn = true;
            // sessionStorage.setItem('ux_logged_in', 'true'); // 移除記憶功能
            showDashboard();
            loginError.textContent = '';
            passwordInput.value = '';
        } else {
            // 登入失敗
            showLoginError('密碼錯誤,請重試');
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        console.error("登入驗證錯誤:", error);
        // 如果連線失敗，暫時允許使用預設密碼備援 (視需求而定，為了安全也可以改成禁止登入)
        if (password === ADMIN_PASSWORD) {
            isLoggedIn = true;
            showDashboard();
        } else {
            showLoginError('系統錯誤或密碼不正確');
        }
    } finally {
        loginButton.textContent = '登入';
        loginButton.disabled = false;
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
// ===================================
// == 列表渲染 (改為 Firebase 即時監聽) ==
// ===================================
let currentUnsubscribe = null; // 用於儲存 Firebase 監聽器，切換分頁時取消

function loadButtonList(type) {
    console.log(`載入列表: ${type}`);
    const container = document.getElementById('listContainer');
    if (!container) return;

    // 清除舊的監聽器
    if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
    }

    container.innerHTML = '<div class="loading">載入資料中...</div>';

    // 定義集合名稱
    let collectionName = '';
    let staticData = [];

    if (type === 'common') {
        collectionName = 'common_buttons';
        staticData = (typeof commonButtonData !== 'undefined') ? commonButtonData : [];
    } else if (type === 'tools') {
        // 先專注處理常用按鈕，工具按鈕暫時維持原樣或之後接續開發
        collectionName = 'tool_buttons';
        staticData = (typeof mainButtonData !== 'undefined') ? mainButtonData : [];
    } else {
        container.innerHTML = '<div class="empty-state">此分類暫無資料</div>';
        return;
    }

    const collectionRef = db.collection(collectionName);

    // 建立監聽
    currentUnsubscribe = collectionRef.orderBy('createdAt', 'desc').onSnapshot(async (snapshot) => {
        // == 自動遷移邏輯 (通用: Common & Tools) ==
        if (snapshot.empty && staticData.length > 0) {
            console.log(`Firebase (${collectionName}) 無資料，開始執行自動遷移...`);
            container.innerHTML = '<div class="loading">正在初始化資料庫 (單次遷移)...</div>';

            // 由於 Firestore batch 限制 500 筆，需分批處理
            const BATCH_SIZE = 400;
            let batch = db.batch();
            let count = 0;
            let totalBatches = 0;

            for (let i = 0; i < staticData.length; i++) {
                const item = staticData[i];
                const newDocRef = collectionRef.doc();

                batch.set(newDocRef, {
                    name: item.name,
                    image: item.imageUrl || item.image, // 相容不同命名
                    url: item.linkUrl || item.url,      // 相容不同命名
                    desc: item.description || item.desc || '',
                    active: true,
                    locked: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                count++;
                if (count >= BATCH_SIZE) {
                    await batch.commit();
                    console.log(`已寫入批次 ${++totalBatches}`);
                    batch = db.batch();
                    count = 0;
                }
            }

            // 提交剩下的
            if (count > 0) {
                await batch.commit();
                console.log(`已寫入最後批次 ${++totalBatches}`);
            }

            console.log('自動遷移完成！');
            // 遷移後會自動觸發 onSnapshot 更新介面
            return;
        }

        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state">暫無資料，請新增按鈕</div>';
            // 更新計數
            updateCount(type, 0);
            return;
        }

        container.innerHTML = ''; // 清空準備渲染
        let count = 0;

        snapshot.forEach(doc => {
            count++;
            const item = doc.data();
            const id = doc.id;

            // 將說明文字加入顯示 (如果有)
            const descHtml = item.desc ? `<div class="info-row desc" style="font-size: 0.8rem; color: #888; margin-top: 4px;">📝 ${item.desc}</div>` : '';

            // 判斷按鈕狀態樣式
            const activeClass = item.active ? 'active' : 'inactive';
            const activeText = item.active ? '啟用' : '停用';
            const itemClass = item.active ? '' : 'opacity: 0.6;';

            const itemHTML = `
                <div class="list-item" style="${itemClass}" id="item-${id}">
                    <div class="item-img-box">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60?text=No+Img'">
                    </div>
                    <div class="item-info">
                        <div class="info-row start">
                            ${item.locked ? '<span class="lock-icon">🔒</span>' : ''}
                            <span class="item-name">${item.name}</span>
                            <span class="status-badge ${activeClass}">${activeText}</span>
                        </div>
                        ${descHtml}
                        <div class="info-row link">
                            <span class="link-icon">🔗</span>
                            <span class="item-link"><a href="${item.url}" target="_blank" style="color: inherit; text-decoration: none;">${item.url}</a></span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editButton('${collectionName}', '${id}')">編輯</button>
                            <button class="action-btn delete" onclick="deleteButton('${collectionName}', '${id}', '${item.name}')">刪除</button>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${item.active ? 'checked' : ''} onchange="toggleButtonStatus('${collectionName}', '${id}', this.checked)">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHTML);
        });

        // 更新計數
        updateCount(type, count);

    }, (error) => {
        console.error("讀取失敗:", error);
        container.innerHTML = `<div class="error">載入失敗: ${error.message}</div>`;
    });
}

function updateCount(type, count) {
    const badge = document.querySelector(`.tab-btn[data-tab="${type}"] .badge`) || document.querySelector(`.tab-btn[data-tab="${type}"] .count`);
    if (badge) badge.textContent = count;
}

// ===================================
// == 按鈕管理功能 (新增/編輯/刪除) ==
// ===================================

// 按鈕回饋提示
function showButtonFeedback(button, message, type) {
    const originalText = button.textContent;
    button.textContent = message;
    button.style.background = type === 'success' ? '#4CAF50' : '#F44336';
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

// 提交按鈕表單
async function handleButtonSubmit() {
    const nameInput = document.getElementById('btnNameInput');
    const imgInput = document.getElementById('btnImgInput');
    const urlInput = document.getElementById('btnUrlInput');
    const descInput = document.getElementById('btnDescInput');
    const pwdInput = document.getElementById('btnPwdInput');
    const editIdInput = document.getElementById('editingBtnId');
    const submitBtn = document.getElementById('btnSubmitBtn');

    // 取得當前激活的 Tab 來決定寫入哪個集合
    const activeTab = document.querySelector('.tab-btn.active');
    const type = activeTab ? activeTab.getAttribute('data-tab') : 'common';
    const collectionName = (type === 'tools') ? 'tool_buttons' : 'common_buttons';

    const data = {
        name: nameInput.value.trim(),
        image: imgInput.value.trim() || 'https://via.placeholder.com/100?text=No+Img', // 預設圖片
        url: urlInput.value.trim() || 'javascript:void(0)', // 預設無效連結
        desc: descInput.value.trim(),
        locked: pwdInput.value.trim() !== '', // 若有密碼則視為鎖定
        lockPassword: pwdInput.value.trim(), // 實務上建議加密，此處示範直接儲存
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!data.name) {
        alert('名稱為必填欄位！');
        return;
    }

    submitBtn.disabled = true;
    const isEdit = editIdInput.value !== '';

    try {
        if (isEdit) {
            // 更新
            await db.collection(collectionName).doc(editIdInput.value).update(data);
            showButtonFeedback(submitBtn, '✓ 已更新', 'success');
            resetButtonForm(); // 退出編輯模式
        } else {
            // 新增
            data.active = true; // 預設啟用
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(collectionName).add(data);
            showButtonFeedback(submitBtn, '✓ 已新增', 'success');
            // 清空表單以便繼續新增
            nameInput.value = '';
            imgInput.value = '';
            urlInput.value = '';
            descInput.value = '';
            pwdInput.value = '';
        }
    } catch (error) {
        console.error('儲存失敗:', error);
        showButtonFeedback(submitBtn, '✗ 儲存失敗', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

// 編輯按鈕
async function editButton(collectionName, id) {
    try {
        const doc = await db.collection(collectionName).doc(id).get();
        if (!doc.exists) {
            alert('找不到該按鈕資料');
            return;
        }
        const data = doc.data();

        // 填入表單
        document.getElementById('btnNameInput').value = data.name || '';
        document.getElementById('btnImgInput').value = data.image || '';
        document.getElementById('btnUrlInput').value = data.url || '';
        document.getElementById('btnDescInput').value = data.desc || '';
        document.getElementById('btnPwdInput').value = data.lockPassword || '';

        // 設定編輯模式
        document.getElementById('editingBtnId').value = id;
        document.getElementById('btnSubmitBtn').textContent = '確認更新';
        document.getElementById('btnSubmitBtn').classList.add('warning'); // 換個顏色提示

        // 滾動到頂部
        document.querySelector('.edit-form-card').scrollIntoView({ behavior: 'smooth' });

        // 顯示取消按鈕 (如果還沒建立的話，可以動態建立，這裡簡單用 alert 提示)
        // 為了 UX，我們加上一個取消機制：點擊其他分頁或按鈕時重置，或者在按鈕旁加一個取消鍵
        // 這裡簡單做：修改標題提示
        // alert('已進入編輯模式，修改完請按「確認更新」');

    } catch (error) {
        console.error('讀取資料失敗:', error);
        alert('讀取失敗');
    }
}

// 重置表單
function resetButtonForm() {
    document.getElementById('btnNameInput').value = '';
    document.getElementById('btnImgInput').value = '';
    document.getElementById('btnUrlInput').value = '';
    document.getElementById('btnDescInput').value = '';
    document.getElementById('btnPwdInput').value = '';
    document.getElementById('editingBtnId').value = '';

    const submitBtn = document.getElementById('btnSubmitBtn');
    submitBtn.textContent = '新增按鈕';
    submitBtn.classList.remove('warning');
}

// 刪除按鈕
async function deleteButton(collectionName, id, name) {
    try {
        await db.collection(collectionName).doc(id).delete();
        // 不需手動 refresh，onSnapshot 會處理
    } catch (error) {
        console.error('刪除失敗:', error);
    }
}

// 切換狀態
async function toggleButtonStatus(collectionName, id, isActive) {
    try {
        await db.collection(collectionName).doc(id).update({
            active: isActive
        });
        console.log(`狀態更新為: ${isActive}`);
    } catch (error) {
        console.error('狀態更新失敗:', error);
        // 如果失敗，最好把 checkbox 狀態改回來 (這裡省略 UI rollback)
        alert('切換狀態失敗');
    }
}

// ===================================
// == 設定資料載入 (優先從 Firebase) ==
// ===================================
async function loadSettingsData() {
    console.log('載入系統設定...');
    const marqueeInput = document.getElementById('marqueeInput');
    const logoLinkInput = document.getElementById('logoLinkInput');
    const marqueeHint = marqueeInput.nextElementSibling;
    const logoHint = logoLinkInput.nextElementSibling;

    try {
        // 1. 嘗試從 Firebase 讀取
        const doc = await db.collection('settings').doc('site_config').get();

        if (doc.exists) {
            const data = doc.data();
            console.log('從 Firebase 讀取到設定:', data);

            // 跑馬燈
            if (data.marquee) {
                marqueeInput.value = data.marquee;
                if (marqueeHint) marqueeHint.textContent = `目前設置 (Firebase)：${data.marquee.substring(0, 30)}...`;
            }

            // LOGO
            if (data.logo) {
                logoLinkInput.value = data.logo;
                if (logoHint) logoHint.textContent = `目前設置 (Firebase)：${data.logo}`;
            }
            return; // 成功讀取後就結束，不需 fallback
        }
    } catch (error) {
        console.error("讀取 Firebase 設定失敗:", error);
    }

    // 2. Fallback: 如果 Firebase 沒資料或失敗，讀取靜態 JS
    console.log('使用靜態 JS 設定作為備用');

    // 跑馬燈
    if (typeof marqueeSettings !== 'undefined' && marqueeSettings.text) {
        marqueeInput.value = marqueeSettings.text;
        if (marqueeHint) marqueeHint.textContent = `目前設置 (靜態 JS)：${marqueeSettings.text.substring(0, 30)}...`;
    }

    // LOGO
    if (typeof indexLogo !== 'undefined' && indexLogo.url) {
        logoLinkInput.value = indexLogo.url;
        if (logoHint) logoHint.textContent = `目前設置 (靜態 JS)：${indexLogo.url}`;
    }
}

// ===================================
// == 儲存設定到 Firebase ==
// ===================================
async function saveSettingsData() {
    const marqueeInput = document.getElementById('marqueeInput');
    const logoLinkInput = document.getElementById('logoLinkInput');
    const submitBtn = document.querySelector('#settingsView .submit-btn');

    // 密碼相關輸入框
    const oldPwInput = document.getElementById('oldPasswordInput');
    const newPwInput = document.getElementById('newPasswordInput');
    const confirmPwInput = document.getElementById('confirmPasswordInput');

    const newMarquee = marqueeInput.value.trim();
    const newLogo = logoLinkInput.value.trim();

    // 密碼變更邏輯
    const oldPw = oldPwInput.value.trim();
    const newPw = newPwInput.value.trim();
    const confirmPw = confirmPwInput.value.trim();
    let changePassword = false;

    if (oldPw || newPw || confirmPw) {
        // 如果有填寫任何密碼欄位，就要進行驗證
        if (!oldPw || !newPw || !confirmPw) {
            alert('修改密碼請完整填寫：舊密碼、新密碼與確認密碼');
            return;
        }
        if (newPw !== confirmPw) {
            alert('新密碼與確認密碼不符！');
            return;
        }
        changePassword = true;
    }

    if (!newMarquee && !newLogo && !changePassword) {
        alert('內容不能全空');
        return;
    }

    // UI 狀態更新
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = '儲存中...';
    submitBtn.disabled = true;

    try {
        const updateData = {
            marquee: newMarquee,
            logo: newLogo,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 如果要改密碼，先驗證舊密碼
        if (changePassword) {
            const doc = await db.collection('settings').doc('site_config').get();
            let currentDbPassword = ADMIN_PASSWORD;
            if (doc.exists && doc.data().admin_password) {
                currentDbPassword = doc.data().admin_password;
            }

            if (oldPw !== currentDbPassword) {
                alert('舊密碼錯誤！無法變更密碼');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // 驗證通過，加入新密碼
            updateData.admin_password = newPw;
        }

        await db.collection('settings').doc('site_config').set(updateData, { merge: true });

        // 成功提示 (直接顯示在按鈕上，不彈出視窗)
        submitBtn.textContent = '✅ 設定完成';
        submitBtn.style.backgroundColor = '#4CAF50'; // 綠色表示成功

        // 更新 Hint 文字
        const marqueeHint = marqueeInput.nextElementSibling;
        const logoHint = logoLinkInput.nextElementSibling;
        if (marqueeHint) marqueeHint.textContent = `目前設置 (Firebase)：${newMarquee.substring(0, 30)}...`;
        if (logoHint) logoHint.textContent = `目前設置 (Firebase)：${newLogo}`;

        // 清空密碼欄位
        oldPwInput.value = '';
        newPwInput.value = '';
        confirmPwInput.value = '';

        // 2秒後自動恢復按鈕原狀
        setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error("儲存失敗:", error);
        alert('儲存失敗：' + error.message);
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

// ===================================
// == 事件監聽器 ==
// ===================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('UX 後台系統已載入');

    // 檢查登入狀態並顯示介面
    // const savedLoginState = sessionStorage.getItem('ux_logged_in'); // 移除記憶功能

    // 初始化返回按鈕事件 (如果有)
    const backBtn = document.getElementById('backToFrontendBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../ui/index.html';
        });
    }

    // 總是顯示登入畫面 (不記憶狀態)
    showLogin();

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
    showNotification,
    handleButtonSubmit,
    editButton,
    deleteButton,
    toggleButtonStatus,
    resetButtonForm,
    handleLogout
};
