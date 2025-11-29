/**
 * Chat Application with AI Character
 * Handles character animation, chat interface, and modal interactions.
 */

/**
 * Tracks cursor position to update character direction.
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

        // Decide which direction based on cursor position (5 divisions)
        let direction;
        if (cursorPos.x < centerX * 0.5) {
            // Cursor is on the far left
            direction = 'look-left';
        }
        else if (cursorPos.x < centerX * 0.85) {
            // Cursor is on the left-center
            direction = 'look-down-left';
        }
        else if (cursorPos.x < centerX * 1.15) {
            // Cursor is in the center
            direction = 'look-down';
        }
        else if (cursorPos.x < centerX * 1.5) {
            // Cursor is on the right-center
            direction = 'look-down-right';
        }
        else {
            // Cursor is on the far right
            direction = 'look-right';
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
            const validDirections = ['idle', 'look-left', 'look-down-left', 'look-down', 'look-down-right', 'look-right'];
            if (!validDirections.includes(direction)) {
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

/**
 * Simulates typewriter effect for text.
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

/**
 * Auto-resizes textarea height based on content.
 * @param {HTMLTextAreaElement} textarea 
 */
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';  // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`;  // Set to content height
}
/**
 * Adds a message to the chat.
 * @param {'user'|'ai'} type 
 * @param {string} content 
 * @param {string} [avatar] 
 * @param {boolean} shouldScroll - Whether to auto-scroll to the bottom (default: true)
 * @returns {HTMLElement} The created message element
 */
function addMessage(type, content, avatar = null, shouldScroll = true) {
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
    contentDiv.innerHTML = content; // Use innerHTML to support formatting
    messageDiv.appendChild(contentDiv);

    // Add to chat and scroll to show the new message
    chatMessages.appendChild(messageDiv);

    if (shouldScroll) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    return messageDiv;
}

/**
 * Simulates AI thinking and response sequence.
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
    const aiResponse = `Since the launch of that feature, there has been a <strong>3% increase in MRR</strong> 📈. It appears a major contributing trend has been an average increase of <strong>1.3 months</strong> in subscription duration 🗓️.
    <br><br>
    Reading user opinions 🗣️:
    <ul style="margin-top: 8px; padding-left: 20px; list-style-type: none;">
        <li style="margin-bottom: 4px;">👥 <strong>Long-term users (>7 months)</strong> have praised the diagnostic tool for enabling more trustable agents.</li>
        <li style="margin-bottom: 4px;">⚡ <strong>Power users</strong> noted it allows them to create trusted agents for their clients.</li>
        <li>🛠️ <strong>Technical users</strong> appreciate the ability to debug and understand issues, setting Relevance AI apart from other builders.</li>
    </ul>`;

    // Add the AI response to the chat
    // Pass false for shouldScroll to prevent jumping to bottom, allowing smooth scroll to top
    const messageElement = addMessage('ai', aiResponse, 'assets/character/idle.png', false);

    // Scroll the message to the top of the view (respecting scroll-margin-top)
    // Scroll the message to the top of the view (respecting scroll-margin-top)
    // Use a small timeout to ensure the DOM is fully updated and layout is stable
    setTimeout(() => {
        smoothScrollTo(messageElement, 1500); // 1.5s duration for very smooth effect
    }, 100);

    // Add the "Verify truth" button after the AI message
    addVerifyButton();
}

/**
 * Adds the "Verify truth" button to chat.
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
}

/**
 * Opens the process modal.
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

// Prevents multiple submissions in this demo
let messageSubmitted = false;

/**
 * Initializes application logic on load.
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
        if (messageSubmitted) {
            submitButton.disabled = true;
            chatInput.disabled = true;
            chatInput.placeholder = "You cannot type now. Refresh the website to revisit from the start";
            return;
        }
        const hasText = chatInput.value.trim().length > 0;
        submitButton.disabled = !hasText;
        chatInput.disabled = false;
        chatInput.placeholder = "Type your message...";
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
    async function handleSubmit() {
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
            updateSubmitButton();

            // Animate intro text away if it exists
            const introText = document.getElementById('introText');
            if (introText) {
                const typeWriter = new TypeWriter(introText);
                typeWriter.text = introText.textContent;
                // Calculate speed to take approx 2 seconds
                // Speed = Duration / Character Count
                const duration = 2000; // 2 seconds
                const charCount = typeWriter.text.length;
                const speed = Math.max(10, Math.floor(duration / charCount));

                await typeWriter.delete(speed);
                // Remove the element after animation to prevent layout issues
                introText.style.display = 'none';
            }

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

                // If expanding the first expander, ensure graph is rendered
                if (expander.classList.contains('expanded') && expander.querySelector('#abTestGraph')) {
                    // Small delay to allow transition to start/finish so dimensions are correct
                    setTimeout(renderGraph, 300);
                }
            }
        });
    });

    // Initial render of graph (in case it's already visible or for readiness)
    renderGraph();

    // Re-render on window resize
    window.addEventListener('resize', () => {
        renderGraph();
    });
});

/**
 * Renders the A/B Test Result Graph using SVG.
 */
function renderGraph() {
    const container = document.getElementById('abTestGraph');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Dimensions
    const width = container.offsetWidth || 500;
    const height = container.offsetHeight || 250;
    const padding = { top: 40, right: 20, bottom: 40, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "graph-svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    container.appendChild(svg);

    // Group for graph content
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${padding.left}, ${padding.top})`);
    svg.appendChild(g);

    // Data generation for Normal Distribution
    // Formula: (1 / (sigma * sqrt(2*PI))) * exp(-0.5 * ((x - mu) / sigma)^2)
    function normalDistribution(x, mu, sigma) {
        const twoPi = 2 * Math.PI;
        const exp = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        return (1 / (sigma * Math.sqrt(twoPi))) * exp;
    }

    // X-axis range (months)
    const xMin = 4.5;
    const xMax = 12.5;
    const xScale = (val) => ((val - xMin) / (xMax - xMin)) * graphWidth;

    // Y-axis scale (normalized for height)
    // Max peak for sigma=0.5 is approx 0.8. We map 0.85 to 0 (top) and 0 to graphHeight (bottom)
    const maxVal = 0.85;
    const yScale = (val) => graphHeight - (val / maxVal) * graphHeight;

    // Generate points for Curve A (Control/Group A) - Blue
    // Mean = 8.8, Sigma = 0.6
    const pointsA = [];
    for (let x = xMin; x <= xMax; x += 0.1) {
        const y = normalDistribution(x, 8.8, 0.6);
        pointsA.push(`${xScale(x)},${yScale(y)}`);
    }

    // Generate points for Curve B (Variant/Group B) - Green
    // Mean = 9.6, Sigma = 0.5 (Slightly tighter distribution)
    const pointsB = [];
    for (let x = xMin; x <= xMax; x += 0.1) {
        const y = normalDistribution(x, 9.6, 0.5);
        pointsB.push(`${xScale(x)},${yScale(y)}`);
    }

    // Draw Axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", graphHeight);
    xAxis.setAttribute("x2", graphWidth);
    xAxis.setAttribute("y2", graphHeight);
    xAxis.setAttribute("class", "axis-line");
    g.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", graphHeight);
    yAxis.setAttribute("class", "axis-line");
    g.appendChild(yAxis);

    // Y-axis Label
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", -graphHeight / 2);
    yLabel.setAttribute("y", -30);
    yLabel.setAttribute("transform", "rotate(-90)");
    yLabel.setAttribute("class", "axis-label");
    yLabel.textContent = "users";
    g.appendChild(yLabel);

    // X-axis Label
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", graphWidth / 2);
    xLabel.setAttribute("y", graphHeight + 35);
    xLabel.setAttribute("class", "axis-label");

    // Styled X-axis label with colored A and B
    const tspan1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan1.textContent = "months suscribed between user in ";
    xLabel.appendChild(tspan1);

    const tspanA = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspanA.textContent = "A";
    tspanA.setAttribute("class", "legend-a");
    xLabel.appendChild(tspanA);

    const tspan2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan2.textContent = " vs in ";
    xLabel.appendChild(tspan2);

    const tspanB = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspanB.textContent = "B";
    tspanB.setAttribute("class", "legend-b");
    xLabel.appendChild(tspanB);

    g.appendChild(xLabel);

    // X-axis Ticks
    const ticks = [5, 6, 7, 8, 9, 10, 11, 12];
    ticks.forEach(tick => {
        const x = xScale(tick);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", graphHeight + 15);
        text.setAttribute("class", "axis-tick-label");
        text.textContent = tick;
        g.appendChild(text);
    });

    // Draw Curves
    const pathA = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathA.setAttribute("d", `M ${pointsA.join(' L ')}`);
    pathA.setAttribute("class", "curve-a");
    g.appendChild(pathA);

    const pathB = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathB.setAttribute("d", `M ${pointsB.join(' L ')}`);
    pathB.setAttribute("class", "curve-b");
    g.appendChild(pathB);

    // Vertical Lines for Means
    const meanAX = xScale(8.8);
    const meanBX = xScale(9.6);
    const peakAY = yScale(normalDistribution(8.8, 8.8, 0.6));
    const peakBY = yScale(normalDistribution(9.6, 9.6, 0.5));

    const lineA = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineA.setAttribute("x1", meanAX);
    lineA.setAttribute("y1", peakAY);
    lineA.setAttribute("x2", meanAX);
    lineA.setAttribute("y2", graphHeight);
    lineA.setAttribute("class", "vertical-line-a");
    g.appendChild(lineA);

    const lineB = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineB.setAttribute("x1", meanBX);
    lineB.setAttribute("y1", peakBY);
    lineB.setAttribute("x2", meanBX);
    lineB.setAttribute("y2", graphHeight);
    lineB.setAttribute("class", "vertical-line-b");
    g.appendChild(lineB);

    // Difference Annotation
    const diffText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    diffText.setAttribute("x", (meanAX + meanBX) / 2);
    diffText.setAttribute("y", Math.min(peakAY, peakBY) - 10);
    diffText.setAttribute("class", "graph-title");
    diffText.textContent = "1.3 months";
    g.appendChild(diffText);

    // Tooltip Elements
    const tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    tooltip.innerHTML = 'Some dynamic data<br>information here';
    container.appendChild(tooltip);

    const connector = document.createElement('div');
    connector.className = 'tooltip-connector';
    container.appendChild(connector);

    const dot = document.createElement('div');
    dot.className = 'tooltip-dot';
    container.appendChild(dot);

    // Interaction Logic
    function handleInteraction(e) {
        // Get mouse/touch position relative to SVG
        const rect = svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left - padding.left;
        const y = clientY - rect.top - padding.top;

        // Check if close to either curve
        // Simple approximation: check if x is within range and y is somewhat close
        // For a robust implementation, we'd find the closest point on the path
        // Here we just show it if hovering over the graph area for simplicity as requested "hover or touch any part of the graph curve"
        // But let's make it slightly smarter: show if within graph bounds

        if (x >= 0 && x <= graphWidth && y >= 0 && y <= graphHeight) {
            // Show tooltip
            tooltip.style.opacity = '1';
            connector.style.opacity = '1';
            dot.style.opacity = '1';

            // Position Dot at the cursor x, but snapped to the closest curve Y
            // Let's snap to Curve A for x < midpoint, Curve B for x > midpoint to simulate "hovering curve"
            // Or just follow mouse

            // Re-calculate Y on curve for current X
            const graphXValue = xMin + (x / graphWidth) * (xMax - xMin);
            const yA = yScale(normalDistribution(graphXValue, 8.8, 0.6));
            const yB = yScale(normalDistribution(graphXValue, 9.6, 0.5));

            // Find which curve is closer to mouse Y
            const distA = Math.abs(y - yA);
            const distB = Math.abs(y - yB);

            let targetY = distA < distB ? yA : yB;

            // Position dot
            const dotX = x + padding.left;
            const dotY = targetY + padding.top;
            dot.style.left = `${dotX}px`;
            dot.style.top = `${dotY}px`;

            // Position Tooltip (top left of dot usually)
            const tooltipX = dotX - 120; // Shift left
            const tooltipY = dotY - 60;  // Shift up
            tooltip.style.left = `${tooltipX}px`;
            tooltip.style.top = `${tooltipY}px`;

            // Position Connector
            // Draw line from tooltip to dot
            // Simplified: just a horizontal line or similar? 
            // The design shows a line from tooltip box to the dot.
            // Let's use CSS transform to rotate the line
            const dx = dotX - (tooltipX + 100); // Center of tooltip approx
            const dy = dotY - (tooltipY + 30);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy);

            connector.style.width = `${length}px`;
            connector.style.left = `${tooltipX + 100}px`; // Start from tooltip center
            connector.style.top = `${tooltipY + 30}px`;
            connector.style.transform = `rotate(${angle}deg)`;

        } else {
            hideTooltip();
        }
    }

    function hideTooltip() {
        tooltip.style.opacity = '0';
        connector.style.opacity = '0';
        dot.style.opacity = '0';
    }

    svg.addEventListener('mousemove', handleInteraction);
    svg.addEventListener('mouseleave', hideTooltip);
    svg.addEventListener('touchstart', handleInteraction, { passive: true });
    svg.addEventListener('touchend', hideTooltip);
}

/**
 * Manages sidebar interactions and state.
 */

// Chat history data (hardcoded for demo)
const chatHistory = [
    { id: 1, title: "Research on marketing funnel", timestamp: "2 hours ago" },
    { id: 2, title: "Analysing pricing tiers and segments", timestamp: "Yesterday" }
];

// Initialize sidebar functionality when DOM is loaded
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const accountPanel = document.getElementById('accountPanel');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const chatHistoryList = document.getElementById('chatHistoryList');

    if (!sidebar || !sidebarToggle) {
        console.error('Sidebar elements not found');
        return;
    }

    // Initialize sidebar state based on screen size
    if (window.innerWidth >= 769) {
        // Desktop: start expanded
        sidebar.classList.add('open');
        document.body.classList.add('sidebar-open');
    } else {
        // Mobile: start collapsed (hidden)
        sidebar.classList.remove('open');
    }

    // Toggle sidebar
    function toggleSidebar() {
        const isOpen = sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open', isOpen);

        // On mobile, show/hide overlay
        if (window.innerWidth < 769) {
            sidebarOverlay.classList.toggle('active', isOpen);
        }
    }

    // Close sidebar (mobile only)
    function closeSidebar() {
        if (window.innerWidth < 769) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }

    // Toggle account panel
    function toggleAccountPanel(e) {
        e.stopPropagation();
        accountPanel.classList.toggle('open');
    }

    // Close account panel
    function closeAccountPanel() {
        accountPanel.classList.remove('open');
    }

    // Render chat history
    function renderChatHistory() {
        if (!chatHistoryList) return;

        chatHistoryList.innerHTML = chatHistory.map(chat => `
            <button class="chat-item" data-chat-id="${chat.id}">
                <svg class="chat-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="chat-item-content">
                    <div class="chat-item-title">${chat.title}</div>
                    <div class="chat-item-timestamp">${chat.timestamp}</div>
                </div>
            </button>
        `).join('');

        // Add click handlers to chat items (currently just visual)
        chatHistoryList.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                console.log('Chat item clicked:', item.dataset.chatId);
                // In a real app, this would load the chat conversation
            });
        });
    }

    // Event Listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleSidebar);
    }

    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', toggleAccountPanel);
    }

    // Close account panel when clicking outside
    document.addEventListener('click', (e) => {
        if (accountPanel.classList.contains('open') &&
            !accountPanel.contains(e.target) &&
            !userProfileBtn.contains(e.target)) {
            closeAccountPanel();
        }
    });

    // Close sidebar/account panel on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
            closeAccountPanel();
        }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth >= 769) {
                // Desktop: remove overlay
                sidebarOverlay.classList.remove('active');
            }
        }, 250);
    });

    // Initialize chat history
    renderChatHistory();

    console.log('Sidebar initialized');
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}


/**
 * Smoothly scrolls the container to the target element with custom duration and easing.
 * @param {HTMLElement} element - The target element to scroll to
 * @param {number} duration - Duration in milliseconds
 */
function smoothScrollTo(element, duration = 1000) {
    const container = document.getElementById('chatMessages');
    if (!container || !element) return;

    // Calculate target position
    // We want the element to be at the top, minus the margin (100px for header)
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top;
    const currentScroll = container.scrollTop;
    
    // Target is current scroll position + distance to element - margin
    // We use 100px as the margin (matching the CSS scroll-margin-top we tried to use)
    const targetScroll = currentScroll + relativeTop - 100;

    const startTime = performance.now();

    function scroll(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Ease out cubic function for smooth deceleration
        const ease = 1 - Math.pow(1 - progress, 3);
        
        container.scrollTop = currentScroll + (targetScroll - currentScroll) * ease;

        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }

    requestAnimationFrame(scroll);
}
