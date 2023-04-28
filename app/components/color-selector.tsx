import { useSelect } from "downshift";
import { clsx } from "clsx";

type Item = {
  name: string;
  hex: string;
};

const colors = [
  { name: "pink", hex: "#f433ff" },
  { name: "orange", hex: "#ff5b00" },
  { name: "blue", hex: "#0165fc" },
  { name: "yellow", hex: "#fff917" }
];

function itemToString(item: Item | null) {
  return item ? item.name : "";
}

export function ColorSelector({ name = "color" }) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps
  } = useSelect({
    items: colors,
    itemToString,
    defaultSelectedItem: colors[0]
  });

  return (
    <div>
      <div className="flex flex-col gap-1">
        <label className="sr-only" {...getLabelProps()}>
          Choose a color:
        </label>
        <div
          className="flex cursor-pointer items-center justify-between gap-1 bg-transparent p-2"
          {...getToggleButtonProps()}
        >
          {selectedItem && (
            <>
              <div
                className={clsx(
                  "aspect-[4/3] h-6 border",
                  isOpen ? "border-2 border-brand-yellow" : "border-black"
                )}
                style={{ backgroundColor: selectedItem.hex }}
                title={selectedItem.name}
              />
              <input type="hidden" name={name} value={selectedItem.hex} />
            </>
          )}
          <span className="sr-only">
            {selectedItem ? selectedItem.name : ""}
          </span>
        </div>
      </div>
      <ul
        className={`absolute mt-1 max-h-80 overflow-scroll bg-white p-0 shadow-md ${
          !isOpen && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          colors.map((item, index) => (
            <li
              className={clsx(
                highlightedIndex === index && "bg-blue-300",
                selectedItem === item && "font-bold",
                "flex flex-row items-center gap-1 px-3 py-2 shadow-sm"
              )}
              key={`${item.name}${index}`}
              {...getItemProps({ item, index })}
            >
              <div
                className={clsx(
                  "aspect-[4/3] h-6 border border-black",
                  selectedItem === item
                    ? "border-2 border-brand-yellow"
                    : "border-black"
                )}
                style={{ backgroundColor: item.hex }}
                title={item.name}
              />
              <span className="sr-only">{item.name}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
