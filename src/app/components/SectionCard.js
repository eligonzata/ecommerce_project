"use client";
export default function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-lg font-semibold text-[#641414]">{title}</span>
        <span className="text-2xl text-gray-500">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 px-6 py-5">{children}</div>
      )}
    </div>
  );
}
