"use strict";
// Chat Interface TypeScript
// UI-only implementation with no backend/API integration
/**
 * Auto-resize textarea based on content
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}
/**
 * Handle message submission
 */
function handleSubmit() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message) {
        // Log to console for demonstration (no actual chat functionality)
        console.log('Message submitted:', message);
        // Clear the input
        chatInput.value = '';
        // Reset textarea height
        chatInput.style.height = 'auto';
        // You can add visual feedback here in the future
        // For now, this is just UI demonstration
    }
}
/**
 * Initialize the chat interface
 */
function initializeChatInterface() {
    const chatInput = document.getElementById('chatInput');
    const submitButton = document.getElementById('submitButton');
    if (!chatInput || !submitButton) {
        console.error('Required elements not found');
        return;
    }
    // Auto-resize textarea as user types
    chatInput.addEventListener('input', () => {
        autoResizeTextarea(chatInput);
    });
    // Handle Enter key (submit) and Shift+Enter (new line)
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
        // Shift+Enter allows new line (default behavior)
    });
    // Handle submit button click
    submitButton.addEventListener('click', () => {
        handleSubmit();
    });
    // Disable submit button when input is empty
    chatInput.addEventListener('input', () => {
        submitButton.disabled = chatInput.value.trim().length === 0;
    });
    // Initial state - disable submit button
    submitButton.disabled = true;
    console.log('Chat interface initialized');
}
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatInterface);
}
else {
    initializeChatInterface();
}
