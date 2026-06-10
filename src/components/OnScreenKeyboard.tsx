const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

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
      <button type="button" className="wide-key" onClick={onBackspace}>
        Backspace
      </button>
    </div>
  );
}
