/*
 * ========================================
 * CHAT APPLICATION WITH AI CHARACTER
 * ========================================
 * 
 * This script powers an interactive chat interface with an animated pixel character.
 * The character responds to user input by changing its direction based on where
 * the cursor is in the text input field.
 * 
 * Main Features:
 * 1. Character tracking - The pixel character looks in different directions based on cursor position
 * 2. Typing animation - Simulates AI "thinking" with animated thought bubbles
 * 3. Chat messages - Displays user and AI messages in a conversation format
 * 4. Modal dialog - Shows detailed process information when "Verify truth" button is clicked
 * 5. Expandable sections - Allows users to expand/collapse detailed SQL queries
 */

// ========================================
// CHARACTER DIRECTION TRACKING
// ========================================
/**
 * CharacterTracker Class
 * 
 * Purpose: Makes the pixel character look in different directions based on where
 * the user is typing in the text input field.
 * 
 * How it works:
 * - Monitors the cursor position in the textarea
 * - If cursor is on the left side → character looks left
 * - If cursor is on the right side → character looks right
 * - If cursor is in the middle → character looks down
 */
class CharacterTracker {
    constructor(characterElement, textarea) {
        this.currentDirection = 'idle';  // Current direction the character is facing
        this.lastUpdateTime = 0;         // Last time we updated the direction (for performance)
        this.UPDATE_THRESHOLD = 50;      // Only update every 50 milliseconds to avoid lag
        this.character = characterElement; // The pixel character image element
        this.textarea = textarea;         // The text input field
        this.mirrorDiv = document.createElement('div'); // Hidden div used to calculate cursor position
        this.initMirrorDiv();
        this.init();
    }

    /**
     * Initialize the mirror div
     * 
     * The mirror div is a hidden element that copies the textarea's content.
     * We use it to calculate exactly where the cursor is positioned on screen.
     */
    initMirrorDiv() {
        this.mirrorDiv.style.position = 'absolute';
        this.mirrorDiv.style.visibility = 'hidden';  // Make it invisible
        this.mirrorDiv.style.whiteSpace = 'pre-wrap'; // Match textarea text wrapping
        this.mirrorDiv.style.wordWrap = 'break-word';
        document.body.appendChild(this.mirrorDiv);
    }

    /**
     * Set up event listeners
     * 
     * Listen for when the user types, clicks, or moves the cursor
     * so we can update the character's direction
     */
    init() {
        this.textarea.addEventListener('input', () => this.updateDirection());
        this.textarea.addEventListener('click', () => this.updateDirection());
        this.textarea.addEventListener('keyup', () => this.updateDirection());
    }

    /**
     * Calculate the exact position of the cursor
     * 
     * Returns: An object with x and y coordinates of the cursor
     */
    getCursorPosition() {
        const textareaRect = this.textarea.getBoundingClientRect();
        const textareaStyles = window.getComputedStyle(this.textarea);

        // Copy all the textarea's styling to our mirror div so they match exactly
        this.mirrorDiv.style.width = textareaStyles.width;
        this.mirrorDiv.style.font = textareaStyles.font;
        this.mirrorDiv.style.padding = textareaStyles.padding;
        this.mirrorDiv.style.border = textareaStyles.border;
        this.mirrorDiv.style.lineHeight = textareaStyles.lineHeight;

        // Get all the text before the cursor position
        const cursorPos = this.textarea.selectionStart;
        const textBeforeCursor = this.textarea.value.substring(0, cursorPos);

        // Put that text in the mirror div
        this.mirrorDiv.textContent = textBeforeCursor;

        // Add a marker (|) at the cursor position so we can measure where it is
        const cursorSpan = document.createElement('span');
        cursorSpan.textContent = '|';
        this.mirrorDiv.appendChild(cursorSpan);

        // Measure where the marker is positioned
        const cursorSpanRect = cursorSpan.getBoundingClientRect();
        const mirrorDivRect = this.mirrorDiv.getBoundingClientRect();

        return {
            x: cursorSpanRect.left - mirrorDivRect.left,
            y: cursorSpanRect.top - mirrorDivRect.top
        };
    }

    /**
     * Update which direction the character should face
     * 
     * This is called whenever the user types or moves the cursor
     */
    updateDirection() {
        // Performance optimization: Don't update too frequently (only every 50ms)
        const now = Date.now();
        if (now - this.lastUpdateTime < this.UPDATE_THRESHOLD) {
            return;
        }
        this.lastUpdateTime = now;

        // Get the cursor position
        const cursorPos = this.getCursorPosition();
        const textareaRect = this.textarea.getBoundingClientRect();
        const centerX = textareaRect.width / 2;

        // Decide which direction based on cursor position
        let direction;
        if (cursorPos.x < centerX * 0.4) {
            // Cursor is on the left side
            direction = 'look-left';
        }
        else if (cursorPos.x > centerX * 1.6) {
            // Cursor is on the right side
            direction = 'look-right';
        }
        else {
            // Cursor is in the middle
            direction = 'look-down';
        }
        this.setDirection(direction);
    }

    /**
     * Change the character's sprite image to match the direction
     * 
     * Each direction has its own image file (idle.png, look-left.png, etc.)
     */
    setDirection(direction) {
        // Only update if the direction actually changed
        if (this.currentDirection !== direction) {
            this.currentDirection = direction;

            // Validate the direction name
            let spriteName = direction;
            if (direction !== 'idle' && direction !== 'look-left' && direction !== 'look-right' && direction !== 'look-down') {
                spriteName = 'idle';
            }

            // Build the path to the sprite image
            const spritePath = spriteName === 'idle'
                ? 'assets/character/idle.png'
                : `assets/character/${spriteName}.png`;

            // Update the character image
            this.character.src = spritePath;
        }
    }
}

// ========================================
// TYPING ANIMATION
// ========================================
/**
 * TypeWriter Class
 * 
 * Purpose: Creates a typewriter effect where text appears letter by letter
 * Used for the AI's "thinking" animation in the thought bubble
 * 
 * Example: "Thinking..." appears one letter at a time: T...Th...Thi...
 */
class TypeWriter {
    constructor(element) {
        this.element = element;  // The HTML element where text will appear
        this.text = '';          // The current text being displayed
        this.isTyping = false;   // Whether we're currently typing
    }

    /**
     * Type out text letter by letter
     * 
     * @param text - The text to type out
     * @param speed - How fast to type (milliseconds between each letter)
     */
    async type(text, speed = 50) {
        this.isTyping = true;
        this.text = '';
        this.element.textContent = '';

        // Add one letter at a time
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;  // Stop if typing was cancelled
            this.text += text[i];
            this.element.textContent = this.text;
            await this.sleep(speed);  // Wait before adding next letter
        }
    }

    /**
     * Delete text letter by letter (backspace effect)
     * 
     * @param speed - How fast to delete (milliseconds between each deletion)
     */
    async delete(speed = 30) {
        this.isTyping = true;

        // Remove one letter at a time from the end
        while (this.text.length > 0) {
            if (!this.isTyping) break;
            this.text = this.text.slice(0, -1);  // Remove last character
            this.element.textContent = this.text;
            await this.sleep(speed);
        }
    }

    /**
     * Helper function to pause/wait for a specified time
     * 
     * @param ms - Milliseconds to wait
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Stop the typing animation
     */
    stop() {
        this.isTyping = false;
    }
}

// ========================================
// TEXTAREA AUTO-RESIZE
// ========================================
/**
 * Auto-resize the textarea as the user types
 * 
 * Purpose: Makes the text input field grow taller when the user types multiple lines
 * This prevents scrolling inside the input field
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';  // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`;  // Set to content height
}

// ========================================
// CHAT MESSAGE DISPLAY
// ========================================
/**
 * Add a message to the chat conversation
 * 
 * @param type - Either 'user' or 'ai' to determine styling and layout
 * @param content - The message text to display
 * @param avatar - Optional avatar image for AI messages
 */
function addMessage(type, content, avatar = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    // Add avatar for AI messages
    if (type === 'ai' && avatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = 'AI Avatar';
        avatarImg.className = 'message-avatar';
        messageDiv.appendChild(avatarImg);
    }

    // Add the message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);

    // Add to chat and scroll to show the new message
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// AI CONVERSATION SIMULATION
// ========================================
/**
 * Simulate the AI "thinking" and responding
 * 
 * This creates the animated sequence where:
 * 1. The thought bubble appears above the character
 * 2. Different thoughts are typed and deleted
 * 3. The character and bubble animate away
 * 4. The AI response appears in the chat
 * 
 * Note: This is all hardcoded/simulated - no real AI is being called
 */
async function simulateAIConversation() {
    // Get references to the elements we'll animate
    const thoughtBubble = document.getElementById('thoughtBubble');
    const thoughtContent = thoughtBubble.querySelector('.thought-bubble-content');
    const characterWrapper = document.querySelector('.character-wrapper');
    const typeWriter = new TypeWriter(thoughtContent);

    // Show the thought bubble
    thoughtBubble.style.display = 'block';

    // The sequence of thoughts to display
    const thoughts = [
        "Thinking...",
        "Writing a SQL query to get numbers and facts...",
        "Listening to what users have said..."
    ];

    // Display each thought one by one
    for (let i = 0; i < thoughts.length; i++) {
        // Type out the thought letter by letter
        await typeWriter.type(thoughts[i], 50);

        // Keep it visible for 3 seconds
        await typeWriter.sleep(3000);

        // Delete the thought (except the last one)
        if (i < thoughts.length - 1) {
            await typeWriter.delete(30);
        }
    }

    // Brief pause before exit animations
    await typeWriter.sleep(500);

    // Animate the thought bubble floating up and character sliding down
    thoughtBubble.classList.add('bubble-float-up');
    characterWrapper.classList.add('character-slide-down');

    // Wait for animations to finish
    await typeWriter.sleep(1000);

    // Hide the character completely
    characterWrapper.classList.add('hidden');

    // The AI's response (hardcoded for this demo)
    const aiResponse = `Since launch of that feature, there is 3% increase in MRR. It appears a major contributing trend has been an average increase of 1.3 months of increased subscription by users.

Reading opinions, I can see many users subscribed over 7 months have praised the diagnostic tool to allow them to create more trustable agents. Some power user, qualified by the number of agents they have, said that this allows them to create trusted agents that service their clients. New users with technical backgrounds have said this feature sets Relevance AI apart from other workforce builders as it's possible to understand where things go wrong while and after building.`;

    // Add the AI response to the chat
    addMessage('ai', aiResponse, 'assets/character/idle.png');

    // Add the "Verify truth" button after the AI message
    addVerifyButton();
}

// ========================================
// VERIFY TRUTH BUTTON
// ========================================
/**
 * Add the "Verify truth" button after the AI response
 * 
 * Purpose: This button allows users to see the detailed process/data
 * that the AI used to generate its response
 */
function addVerifyButton() {
    const chatMessages = document.getElementById('chatMessages');

    // Create a container for the button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'verify-button-container';

    // Create the button
    const button = document.createElement('button');
    button.className = 'verify-button';
    button.textContent = 'Verify truth';

    // When clicked, open the modal with process details
    button.addEventListener('click', () => {
        openModal();
    });

    // Add button to the chat
    buttonContainer.appendChild(button);
    chatMessages.appendChild(buttonContainer);

    // Scroll to show the new button
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================
// MODAL DIALOG CONTROLS
// ========================================
/**
 * Open the modal dialog
 * 
 * The modal shows the detailed SQL queries and analysis process
 */
function openModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.style.display = 'flex';  // Show the modal
    }
}

/**
 * Close the modal dialog
 */
function closeModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.style.display = 'none';  // Hide the modal
    }
}

// ========================================
// MESSAGE SUBMISSION TRACKING
// ========================================
/**
 * Track whether a message has been submitted
 * 
 * This prevents the user from submitting multiple messages
 * (since this is a demo with hardcoded responses)
 */
let messageSubmitted = false;

// ========================================
// INITIALIZATION - RUNS WHEN PAGE LOADS
// ========================================
/**
 * Set up all the interactive features when the page finishes loading
 * 
 * This is the main entry point that:
 * 1. Finds all the HTML elements we need
 * 2. Sets up event listeners (click, type, etc.)
 * 3. Initializes the character tracker
 * 4. Handles form submission
 */
document.addEventListener('DOMContentLoaded', () => {
    // Find the main elements we need
    const chatInput = document.getElementById('chatInput');
    const submitButton = document.getElementById('submitButton');
    const pixelCharacter = document.getElementById('pixelCharacter');

    // Safety check: Make sure all required elements exist
    if (!chatInput || !submitButton || !pixelCharacter) {
        console.error('Required elements not found');
        return;
    }

    // ========================================
    // CHARACTER TRACKING SETUP
    // ========================================
    // Initialize the character tracker so it responds to cursor position
    new CharacterTracker(pixelCharacter, chatInput);

    // ========================================
    // SUBMIT BUTTON STATE
    // ========================================
    /**
     * Enable/disable the submit button based on whether there's text
     * 
     * The button is disabled (grayed out) when the input is empty
     */
    function updateSubmitButton() {
        const hasText = chatInput.value.trim().length > 0;
        submitButton.disabled = !hasText;
    }

    // ========================================
    // MESSAGE SUBMISSION HANDLER
    // ========================================
    /**
     * Handle when the user submits a message
     * 
     * Note: The actual message is ignored and replaced with a hardcoded one
     * This is because the demo has a pre-scripted conversation
     */
    function handleSubmit() {
        // Prevent multiple submissions
        if (messageSubmitted) {
            return;
        }

        const message = chatInput.value.trim();
        if (message) {
            // Use a fixed message for the demo (ignoring what user actually typed)
            const fixedMessage = "Hey DataSage, I released a new diagnostics tools on the 11th of October 2025. What is the impact of this change on the revenue";

            // Add the user's message to the chat
            addMessage('user', fixedMessage);

            // Clear the input field
            chatInput.value = '';
            autoResizeTextarea(chatInput);
            updateSubmitButton();

            // Mark as submitted to prevent further submissions
            messageSubmitted = true;

            // Start the AI's animated response sequence
            simulateAIConversation();
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    // Auto-resize the textarea as user types
    chatInput.addEventListener('input', () => {
        autoResizeTextarea(chatInput);
        updateSubmitButton();
    });

    // Submit when button is clicked
    submitButton.addEventListener('click', handleSubmit);

    // Submit when Enter key is pressed (Shift+Enter adds a new line)
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();  // Prevent adding a new line
            handleSubmit();
        }
    });

    // Set initial button state
    updateSubmitButton();

    // ========================================
    // CHARACTER POSITIONING
    // ========================================
    /**
     * Keep the character positioned correctly above the input field
     * 
     * As the input field grows/shrinks, we need to adjust the character's position
     * This uses CSS custom properties to dynamically update the position
     */
    function updateInputHeight() {
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            const height = inputContainer.offsetHeight;
            // Add bottom margin (1rem = 16px) to the height
            const totalHeight = height + 16;
            // Update CSS variable that controls character position
            document.documentElement.style.setProperty('--input-height', `${totalHeight}px`);
        }
    }

    // Watch for size changes to the input container
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        // Use ResizeObserver to detect when the input container changes size
        new ResizeObserver(updateInputHeight).observe(inputContainer);
        // Also update when window is resized
        window.addEventListener('resize', updateInputHeight);
        // Do initial update
        updateInputHeight();
    }

    // ========================================
    // MODAL CLOSE HANDLERS
    // ========================================
    const modal = document.getElementById('processModal');
    const closeBtn = document.getElementById('closeModal');

    // Close modal when X button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the modal content (on the dark overlay)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // ========================================
    // MODAL EXPANDER TOGGLE
    // ========================================
    /**
     * Handle expanding/collapsing the SQL query sections in the modal
     * 
     * Each section can be clicked to show or hide its content
     */
    const expanderHeaders = document.querySelectorAll('.modal-expander-header');
    expanderHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Find the expander container
            const expander = header.closest('.modal-expander');
            if (expander) {
                // Toggle the 'expanded' class to show/hide content
                expander.classList.toggle('expanded');
            }
        });
    });
});
