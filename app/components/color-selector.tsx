import { clsx } from "clsx";
import { resetIdCounter, useSelect } from "downshift";

import appConfig from "~/app.config";

type Item = {
  hex: string;
  name: string;
};

type ColorSelectorProps = {
  name?: string;
  selectedColor?: string;
};

const colors = appConfig.charity.colors;

function itemToString(item: Item | null) {
  return item ? item.name : "";
}

function getColorByHex(hex?: string) {
  if (!hex) return colors[0];
  return colors.find((item) => item.hex === hex) || colors[0];
}

export function ColorSelector({
  name = "color",
  selectedColor
}: ColorSelectorProps) {
  const {
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    selectedItem
  } = useSelect({
    defaultSelectedItem: getColorByHex(selectedColor),
    itemToString,
    items: colors
  });
  resetIdCounter();

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
              <input name={name} type="hidden" value={selectedItem.hex} />
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
              {...getItemProps({ index, item })}
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
