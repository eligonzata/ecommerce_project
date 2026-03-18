export default function Button({
  text,
  size = 1,
  hasBg = true,
  onClick = () => {},
}) {
  return (
    <button
      type="button"
      className={`${["px-4 py-1", "px-6 py-3"][size]} ${hasBg ? "bg-linear-to-r from-[#ffb03b] to-[#ff1f1b] hover:from-[#ffbd5a] hover:to-[#ff8e5a] text-white" : ""} font-bold rounded hover:cursor-pointer`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
