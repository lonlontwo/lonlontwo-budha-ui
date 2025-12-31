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

console.log('UX 後台系統已載入');
console.log('Firebase 已初始化');
