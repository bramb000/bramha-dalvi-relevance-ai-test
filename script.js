// Character direction tracking class
class CharacterTracker {
    constructor(characterElement, textarea) {
        this.currentDirection = 'idle';
        this.lastUpdateTime = 0;
        this.UPDATE_THRESHOLD = 50; // ms between updates
        this.character = characterElement;
        this.textarea = textarea;
        this.mirrorDiv = document.createElement('div');
        this.initMirrorDiv();
        this.init();
    }

    initMirrorDiv() {
        // Create a mirror div to calculate cursor position
        this.mirrorDiv.style.position = 'absolute';
        this.mirrorDiv.style.visibility = 'hidden';
        this.mirrorDiv.style.whiteSpace = 'pre-wrap';
        this.mirrorDiv.style.wordWrap = 'break-word';
        document.body.appendChild(this.mirrorDiv);
    }

    init() {
        // Update on input
        this.textarea.addEventListener('input', () => this.updateDirection());
        this.textarea.addEventListener('click', () => this.updateDirection());
        this.textarea.addEventListener('keyup', () => this.updateDirection());
    }

    getCursorPosition() {
        const textareaRect = this.textarea.getBoundingClientRect();
        const textareaStyles = window.getComputedStyle(this.textarea);

        // Copy styles to mirror div
        this.mirrorDiv.style.width = textareaStyles.width;
        this.mirrorDiv.style.font = textareaStyles.font;
        this.mirrorDiv.style.padding = textareaStyles.padding;
        this.mirrorDiv.style.border = textareaStyles.border;
        this.mirrorDiv.style.lineHeight = textareaStyles.lineHeight;

        // Get text before cursor
        const cursorPos = this.textarea.selectionStart;
        const textBeforeCursor = this.textarea.value.substring(0, cursorPos);

        // Set mirror div content
        this.mirrorDiv.textContent = textBeforeCursor;

        // Add a span to measure cursor position
        const cursorSpan = document.createElement('span');
        cursorSpan.textContent = '|';
        this.mirrorDiv.appendChild(cursorSpan);

        const cursorSpanRect = cursorSpan.getBoundingClientRect();
        const mirrorDivRect = this.mirrorDiv.getBoundingClientRect();

        return {
            x: cursorSpanRect.left - mirrorDivRect.left,
            y: cursorSpanRect.top - mirrorDivRect.top
        };
    }

    updateDirection() {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.UPDATE_THRESHOLD) {
            return;
        }
        this.lastUpdateTime = now;

        const cursorPos = this.getCursorPosition();
        const textareaRect = this.textarea.getBoundingClientRect();
        const centerX = textareaRect.width / 2;
        const centerY = textareaRect.height / 2;

        let direction;
        if (cursorPos.x < centerX * 0.4) {
            direction = 'look-left';
        }
        else if (cursorPos.x > centerX * 1.6) {
            direction = 'look-right';
        }
        else {
            direction = 'look-down';
        }
        this.setDirection(direction);
    }

    setDirection(direction) {
        if (this.currentDirection !== direction) {
            this.currentDirection = direction;
            let spriteName = direction;
            if (direction !== 'idle' && direction !== 'look-left' && direction !== 'look-right' && direction !== 'look-down') {
                spriteName = 'idle';
            }
            const spritePath = spriteName === 'idle'
                ? 'assets/character/idle.png'
                : `assets/character/${spriteName}.png`;
            this.character.src = spritePath;
        }
    }
}

// Typing animation class
class TypeWriter {
    constructor(element) {
        this.element = element;
        this.text = '';
        this.isTyping = false;
    }

    async type(text, speed = 50) {
        this.isTyping = true;
        this.text = '';
        this.element.textContent = '';

        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;
            this.text += text[i];
            this.element.textContent = this.text;
            await this.sleep(speed);
        }
    }

    async delete(speed = 30) {
        this.isTyping = true;

        while (this.text.length > 0) {
            if (!this.isTyping) break;
            this.text = this.text.slice(0, -1);
            this.element.textContent = this.text;
            await this.sleep(speed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        this.isTyping = false;
    }
}

// Auto-resize textarea functionality
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// Add message to chat
function addMessage(type, content, avatar = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (type === 'ai' && avatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = 'AI Avatar';
        avatarImg.className = 'message-avatar';
        messageDiv.appendChild(avatarImg);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate AI conversation
async function simulateAIConversation() {
    const thoughtBubble = document.getElementById('thoughtBubble');
    const thoughtContent = thoughtBubble.querySelector('.thought-bubble-content');
    const characterWrapper = document.querySelector('.character-wrapper');
    const chatContainer = document.querySelector('.chat-container');
    const typeWriter = new TypeWriter(thoughtContent);

    // Show thought bubble
    thoughtBubble.style.display = 'block';

    // Thought sequence
    const thoughts = [
        "Thinking...",
        "Writing a SQL query to get numbers and facts...",
        "Listening to what users have said..."
    ];

    for (let i = 0; i < thoughts.length; i++) {
        // Type the thought
        await typeWriter.type(thoughts[i], 50);

        // Wait 3 seconds
        await typeWriter.sleep(3000);

        // Delete the thought (except for the last one)
        if (i < thoughts.length - 1) {
            await typeWriter.delete(30);
        }
    }

    // Wait a moment before exit animations
    await typeWriter.sleep(500);

    // Start exit animations
    thoughtBubble.classList.add('bubble-float-up');
    characterWrapper.classList.add('character-slide-down');

    // Wait for animations to complete
    await typeWriter.sleep(1000);

    // Hide character wrapper
    characterWrapper.classList.add('hidden');

    // Add AI response
    const aiResponse = `Since launch of that feature, there is 3% increase in MRR. It appears a major contributing trend has been an average increase of 1.3 months of increased subscription by users.

Reading opinions, I can see many users subscribed over 7 months have praised the diagnostic tool to allow them to create more trustable agents. Some power user, qualified by the number of agents they have, said that this allows them to create trusted agents that service their clients. New users with technical backgrounds have said this feature sets Relevance AI apart from other workforce builders as it's possible to understand where things go wrong while and after building.`;

    addMessage('ai', aiResponse, 'assets/character/idle.png');

    // Add verify truth button after AI message
    addVerifyButton();
}

// Add verify truth button
function addVerifyButton() {
    const chatMessages = document.getElementById('chatMessages');

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'verify-button-container';

    const button = document.createElement('button');
    button.className = 'verify-button';
    button.textContent = 'Verify truth';

    button.addEventListener('click', () => {
        openModal();
    });

    buttonContainer.appendChild(button);
    chatMessages.appendChild(buttonContainer);

    // Scroll to show the new button
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Open modal
function openModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Track if message has been submitted
let messageSubmitted = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const submitButton = document.getElementById('submitButton');
    const pixelCharacter = document.getElementById('pixelCharacter');

    if (!chatInput || !submitButton || !pixelCharacter) {
        console.error('Required elements not found');
        return;
    }

    // Initialize character tracker
    new CharacterTracker(pixelCharacter, chatInput);

    // Update submit button state
    function updateSubmitButton() {
        const hasText = chatInput.value.trim().length > 0;
        submitButton.disabled = !hasText;
    }

    // Handle submit
    function handleSubmit() {
        // Prevent submission if already submitted
        if (messageSubmitted) {
            return;
        }

        const message = chatInput.value.trim();
        if (message) {
            // Always use the fixed message
            const fixedMessage = "Hey DataSage, I released a new diagnostics tools on the 11th of October 2025. What is the impact of this change on the revenue";

            // Add user message to chat
            addMessage('user', fixedMessage);

            // Clear input
            chatInput.value = '';
            autoResizeTextarea(chatInput);
            updateSubmitButton();

            // Mark as submitted to prevent further submissions
            messageSubmitted = true;

            // Start AI conversation simulation
            simulateAIConversation();
        }
    }

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        autoResizeTextarea(chatInput);
        updateSubmitButton();
    });

    // Submit on button click
    submitButton.addEventListener('click', handleSubmit);

    // Submit on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    });

    // Initial state
    updateSubmitButton();

    // Track input container height for character positioning
    function updateInputHeight() {
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            const height = inputContainer.offsetHeight;
            // Add bottom margin (1rem = 16px) to the height
            const totalHeight = height + 16;
            document.documentElement.style.setProperty('--input-height', `${totalHeight}px`);
        }
    }

    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        new ResizeObserver(updateInputHeight).observe(inputContainer);
        // Also update on window resize
        window.addEventListener('resize', updateInputHeight);
        // Initial update
        updateInputHeight();
    }

    // Modal close handlers
    const modal = document.getElementById('processModal');
    const closeBtn = document.getElementById('closeModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
