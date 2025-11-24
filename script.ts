/**
 * Chat Interface with Text-Tracking Character
 */

// Character tracking class
class CharacterTracker {
    private character: HTMLImageElement;
    private textarea: HTMLTextAreaElement;
    private mirrorDiv: HTMLDivElement;
    private currentDirection: string = 'idle';
    private lastUpdateTime: number = 0;
    private readonly UPDATE_THRESHOLD = 50; // ms between updates

    constructor(characterElement: HTMLImageElement, textarea: HTMLTextAreaElement) {
        this.character = characterElement;
        this.textarea = textarea;
        // Create mirror div for calculating cursor position
        this.mirrorDiv = document.createElement('div');
        this.initMirrorDiv();
        this.init();
    }

    private initMirrorDiv(): void {
        // Style the mirror div to match textarea exactly
        const style = window.getComputedStyle(this.textarea);

        this.mirrorDiv.style.position = 'absolute';
        this.mirrorDiv.style.top = '-9999px';
        this.mirrorDiv.style.left = '-9999px';
        this.mirrorDiv.style.visibility = 'hidden';
        this.mirrorDiv.style.whiteSpace = 'pre-wrap';
        this.mirrorDiv.style.wordWrap = 'break-word';

        // Copy relevant styles
        const properties = [
            'width', 'padding', 'border', 'fontFamily', 'fontSize',
            'fontWeight', 'lineHeight', 'letterSpacing', 'boxSizing'
        ];

        properties.forEach(prop => {
            this.mirrorDiv.style[prop as any] = style[prop as any];
        });

        document.body.appendChild(this.mirrorDiv);

        // Update width on resize
        window.addEventListener('resize', () => {
            this.mirrorDiv.style.width = window.getComputedStyle(this.textarea).width;
        });
    }

    private init(): void {
        const update = () => this.updateCharacterDirection();

        this.textarea.addEventListener('input', update);
        this.textarea.addEventListener('keyup', update);
        this.textarea.addEventListener('click', update);
        this.textarea.addEventListener('scroll', update);

        // Return to idle when empty and blurred
        this.textarea.addEventListener('blur', () => {
            if (this.textarea.value.trim() === '') {
                this.setDirection('idle');
            }
        });
    }

    private updateCharacterDirection(): void {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.UPDATE_THRESHOLD) {
            return;
        }
        this.lastUpdateTime = now;

        const text = this.textarea.value;

        if (text.length === 0) {
            this.setDirection('idle');
            return;
        }

        // Get cursor position
        const cursorPosition = this.textarea.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPosition);

        // Update mirror div content
        // We add a span to track the cursor position
        this.mirrorDiv.textContent = textBeforeCursor;
        const span = document.createElement('span');
        span.textContent = '|'; // Cursor marker
        this.mirrorDiv.appendChild(span);

        // Calculate position relative to container width
        const containerWidth = this.textarea.clientWidth;
        const cursorLeft = span.offsetLeft;

        // Determine direction based on visual position
        // If cursor is in the left half of the input, look left
        // If cursor is in the right half, look right
        let direction = 'look-down'; // Default to looking down (center)

        const relativePos = cursorLeft / containerWidth;

        if (relativePos < 0.4) {
            direction = 'look-left';
        } else if (relativePos > 0.6) {
            direction = 'look-right';
        } else {
            // Middle zone (40% - 60%) -> Look down
            direction = 'look-down';
        }

        // Override: if we just started a new line (visual or hard), we should definitely be looking left
        // The relativePos check handles this automatically because offsetLeft will be small on a new line!

        this.setDirection(direction);
    }

    private setDirection(direction: string): void {
        if (this.currentDirection !== direction) {
            this.currentDirection = direction;

            // Map directions to available assets
            // We have: idle, look-left, look-right, look-down
            // If logic returns something else, fallback
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

// Auto-resize textarea functionality
function autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;
    const submitButton = document.getElementById('submitButton') as HTMLButtonElement;
    const pixelCharacter = document.getElementById('pixelCharacter') as HTMLImageElement;

    if (!chatInput || !submitButton || !pixelCharacter) {
        console.error('Required elements not found');
        return;
    }

    // Initialize character tracker
    new CharacterTracker(pixelCharacter, chatInput);

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        autoResizeTextarea(chatInput);
        updateSubmitButton();
    });

    // Update submit button state
    function updateSubmitButton(): void {
        const hasText = chatInput.value.trim().length > 0;
        submitButton.disabled = !hasText;
    }

    // Handle submit
    function handleSubmit(): void {
        const message = chatInput.value.trim();
        if (message) {
            console.log('Message submitted:', message);
            // Clear input
            chatInput.value = '';
            autoResizeTextarea(chatInput);
            updateSubmitButton();
        }
    }

    // Submit on button click
    submitButton.addEventListener('click', handleSubmit);

    // Submit on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    });

    // Initial state
    updateSubmitButton();
});
