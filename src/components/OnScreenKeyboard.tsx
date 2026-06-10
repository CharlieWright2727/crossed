const rows = ["QWERTYUIOP", "ASDFGHJKL"];

type Props = {
  onLetter: (letter: string) => void;
  onBackspace: () => void;
};

export function OnScreenKeyboard({ onLetter, onBackspace }: Props) {
  return (
    <div className="keyboard" aria-label="On-screen keyboard">
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
        <button type="button" className="ball-key" aria-hidden="true" tabIndex={-1}>🏀</button>
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
