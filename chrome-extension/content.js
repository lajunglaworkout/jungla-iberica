console.log("🦍 Jungla Iberica Bridge cargado.");

// Escuchar mensajes del popup por si acaso cambiamos a message passing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
        sendResponse({ status: "pong" });
    }
});
