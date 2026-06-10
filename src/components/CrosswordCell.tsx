type Props = {
  value: string | null;
  solution: string | null;
  number?: number;
  row: number;
  col: number;
  selected: boolean;
  active: boolean;
  revealed: boolean;
  incorrect: boolean;
  onSelect: () => void;
};

export function CrosswordCell({ value, solution, number, row, col, selected, active, revealed, incorrect, onSelect }: Props) {
  if (solution === null) {
    return <div className="cell blocked" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className={`cell ${selected ? "selected" : ""} ${active ? "active" : ""} ${revealed ? "revealed" : ""} ${
        incorrect ? "incorrect" : ""
      }`}
      onClick={onSelect}
      aria-label={`Row ${row + 1}, column ${col + 1}, ${value || "blank"}`}
    >
      {number && <span className="cell-number">{number}</span>}
      <span className="cell-letter">{value}</span>
    </button>
  );
}
