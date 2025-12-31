// ===================================
// == UI 初始化腳本 ==
// ===================================
// 負責根據配置動態設置 UI 元素

$(document).ready(function () {
    // 初始化 UI 配置
    initUIConfig();
});

/**
 * 初始化 UI 配置
 * 根據 uiConfig 設定 LOGO 和跑馬燈
 */
function initUIConfig() {
    // 設定 LOGO
    if (uiConfig.logo.visible) {
        const $logo = $('.header-logo');
        $logo.attr('src', uiConfig.logo.imageUrl);
        $logo.attr('alt', uiConfig.logo.altText);
        $logo.show();
    } else {
        $('.header-logo').hide();
    }

    // 設定跑馬燈
    if (uiConfig.marquee.visible) {
        const $marquee = $('.marquee');
        $marquee.text(uiConfig.marquee.text);

        // 動態設定動畫速度（如果有指定）
        if (uiConfig.marquee.animationDuration) {
            $marquee.css('animation-duration', `${uiConfig.marquee.animationDuration}s`);
        }

        $('.marquee-container').show();
    } else {
        $('.marquee-container').hide();
    }

    // 設定網站標題（如果需要）
    if (uiConfig.siteTitle && uiConfig.siteTitle.visible) {
        $('title').text(uiConfig.siteTitle.text);
    }
}

/**
 * 未來可以用這個函數從後台 API 載入配置
 * 並重新初始化 UI
 */
async function loadConfigFromAPI() {
    try {
        // 範例 API 端點
        const response = await fetch('/api/ui-config');
        const config = await response.json();

        // 更新全局配置
        Object.assign(uiConfig, config);

        // 重新初始化 UI
        initUIConfig();

        console.log('UI 配置已更新');
    } catch (error) {
        console.error('載入 UI 配置失敗：', error);
    }
}

/**
 * 即時更新 LOGO
 * @param {string} imageUrl - 新的圖片 URL
 */
function updateLogo(imageUrl) {
    uiConfig.logo.imageUrl = imageUrl;
    $('.header-logo').attr('src', imageUrl);
}

/**
 * 即時更新跑馬燈文字
 * @param {string} text - 新的跑馬燈文字
 */
function updateMarqueeText(text) {
    uiConfig.marquee.text = text;
    $('.marquee').text(text);
}

/**
 * 即時更新跑馬燈速度
 * @param {number} duration - 動畫持續時間（秒）
 */
function updateMarqueeSpeed(duration) {
    uiConfig.marquee.animationDuration = duration;
    $('.marquee').css('animation-duration', `${duration}s`);
}
