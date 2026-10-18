export class InputManager {
  private heldKeys = new Set<string>();
  private justPressedKeys = new Set<string>();
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
  }

  public attach(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
    this.heldKeys.clear();
    this.justPressedKeys.clear();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const code = e.code;
    const preventCodes = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyR', 'KeyE'];
    if (preventCodes.includes(code)) {
      e.preventDefault();
    }

    if (!this.heldKeys.has(code)) {
      this.justPressedKeys.add(code);
    }
    this.heldKeys.add(code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.heldKeys.delete(e.code);
  }

  private handleBlur(): void {
    this.heldKeys.clear();
    this.justPressedKeys.clear();
  }

  public isHeld(code: string): boolean {
    return this.heldKeys.has(code);
  }

  public isLeft(): boolean {
    return this.isHeld('KeyA') || this.isHeld('ArrowLeft');
  }

  public isRight(): boolean {
    return this.isHeld('KeyD') || this.isHeld('ArrowRight');
  }

  public isJumpHeld(): boolean {
    return this.isHeld('Space') || this.isHeld('KeyW') || this.isHeld('ArrowUp');
  }

  public consumePress(code: string): boolean {
    if (this.justPressedKeys.has(code)) {
      this.justPressedKeys.delete(code);
      return true;
    }
    return false;
  }

  public consumeJumpPress(): boolean {
    return this.consumePress('Space') || this.consumePress('KeyW') || this.consumePress('ArrowUp');
  }

  public updateFrameEnd(): void {
    this.justPressedKeys.clear();
  }

  public reset(): void {
    this.heldKeys.clear();
    this.justPressedKeys.clear();
  }
}
