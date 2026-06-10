const rows = ["QWERTYUIOP", "ASDFGHJKL"];

type Props = {
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  hidden?: boolean;
};

export function OnScreenKeyboard({ onLetter, onBackspace, hidden = false }: Props) {
  return (
    <div className={`keyboard ${hidden ? "keyboard-hidden" : ""}`} aria-label="On-screen keyboard" aria-hidden={hidden}>
      {rows.map((row) => (
        <div className="keyboard-row" key={row}>
          {row.split("").map((letter) => (
            <button type="button" key={letter} onClick={() => onLetter(letter)} aria-label={`Enter ${letter}`}>
              {letter}
            </button>
          ))}
        </div>
      ))}
      <div className="keyboard-row bottom-row">
        {"ZXCVBNM".split("").map((letter) => (
          <button type="button" key={letter} onClick={() => onLetter(letter)} aria-label={`Enter ${letter}`}>
            {letter}
          </button>
        ))}
        <button type="button" className="backspace-key" onClick={onBackspace} aria-label="Backspace">
          ⌫
        </button>
      </div>
    </div>
  );
}
