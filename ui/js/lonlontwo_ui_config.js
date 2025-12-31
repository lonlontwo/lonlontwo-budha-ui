// ===================================
// == UI 配置檔案 ==
// ===================================
// 此檔案用於集中管理可由後台控制的 UI 元素
// 未來可以改為從 API 動態載入

const uiConfig = {
    // LOGO 設定
    logo: {
        imageUrl: "https://i.ibb.co/KxTkk34/Lonely-Rabbit-logo.jpg",
        altText: "兔兔網LOGO",
        // 可選：是否顯示 LOGO
        visible: true
    },

    // 跑馬燈設定
    marquee: {
        text: "歡迎來到兔兔網 - 精選實用網站集合 | 點擊按鈕快速訪問您喜愛的網站 | 安全、便捷、高效",
        // 可選：是否顯示跑馬燈
        visible: true,
        // 可選：動畫速度（秒）
        animationDuration: 18
    },

    // 網站標題（可選）
    siteTitle: {
        text: "兔兔網",
        visible: false  // 目前沒有顯示標題文字
    }
};

// 未來可以改為從 API 載入配置
// 範例：
// async function loadUIConfig() {
//     try {
//         const response = await fetch('/api/ui-config');
//         const config = await response.json();
//         return config;
//     } catch (error) {
//         console.error('載入配置失敗，使用預設配置', error);
//         return uiConfig;
//     }
// }
