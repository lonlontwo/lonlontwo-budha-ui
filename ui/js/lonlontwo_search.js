// ===================================
// == 搜尋功能 ==
// ===================================

// 搜尋功能初始化
function initSearch() {
    const searchInput = document.getElementById('searchInput');

    if (!searchInput) return;

    // 監聽輸入事件
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        performSearch(searchTerm);
    });

    // 監聽 Enter 鍵
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim().toLowerCase();
            performSearch(searchTerm);
        }
    });
}

// 執行搜尋
function performSearch(searchTerm) {
    // 如果搜尋詞為空,顯示所有按鈕
    if (searchTerm === '') {
        showAllButtons();
        return;
    }

    // 搜尋常用按鈕
    filterCommonButtons(searchTerm);

    // 搜尋主要按鈕
    filterMainButtons(searchTerm);
}

// 過濾常用按鈕
function filterCommonButtons(searchTerm) {
    const commonButtons = document.querySelectorAll('.common-button');

    commonButtons.forEach(button => {
        const name = button.getAttribute('data-name') || '';
        const matches = name.toLowerCase().includes(searchTerm);

        if (matches) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// 過濾主要按鈕
function filterMainButtons(searchTerm) {
    const mainButtons = document.querySelectorAll('.image-button');

    mainButtons.forEach(button => {
        const name = button.getAttribute('data-name') || '';
        const description = button.getAttribute('data-description') || '';

        // 搜尋名稱或說明
        const matchesName = name.toLowerCase().includes(searchTerm);
        const matchesDescription = description.toLowerCase().includes(searchTerm);

        if (matchesName || matchesDescription) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });
}

// 顯示所有按鈕
function showAllButtons() {
    // 顯示所有常用按鈕
    const commonButtons = document.querySelectorAll('.common-button');
    commonButtons.forEach(button => {
        button.style.display = 'block';
    });

    // 顯示所有主要按鈕
    const mainButtons = document.querySelectorAll('.image-button');
    mainButtons.forEach(button => {
        button.style.display = 'flex';
    });
}

// 當 DOM 載入完成後初始化搜尋
document.addEventListener('DOMContentLoaded', function () {
    // 等待按鈕生成後再初始化搜尋
    setTimeout(initSearch, 500);
});
