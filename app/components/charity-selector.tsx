import React from "react";
import { useCombobox, useMultipleSelection } from "downshift";
import { clsx } from "clsx";
import type { CharityItem } from "~/models/charity.server";

type CharitySelectorProps = {
  charities: CharityItem[];
};

export function CharitySelector({ charities }: CharitySelectorProps) {
  function getFilteredCharities(
    selectedItems: CharityItem[],
    inputValue: string
  ) {
    const lowerCasedInputValue = inputValue.toLowerCase();

    return charities.filter(function filterCharity(charity) {
      return (
        !selectedItems.includes(charity) &&
        charity.name.toLowerCase().includes(lowerCasedInputValue)
      );
    });
  }

  const [inputValue, setInputValue] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<CharityItem[]>([]);
  const items = React.useMemo(
    () => getFilteredCharities(selectedItems, inputValue),
    [selectedItems, inputValue]
  );
  const { getSelectedItemProps, getDropdownProps, removeSelectedItem } =
    useMultipleSelection({
      selectedItems,
      onStateChange({ selectedItems: newSelectedItems, type }) {
        switch (type) {
          case useMultipleSelection.stateChangeTypes
            .SelectedItemKeyDownBackspace:
          case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
          case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
          case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
            setSelectedItems(newSelectedItems || []);
            break;
          default:
            break;
        }
      }
    });
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem
  } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.name : "";
    },
    defaultHighlightedIndex: 0,
    selectedItem: null,
    stateReducer(_state, actionAndChanges) {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
            highlightedIndex: 0 // with the first option highlighted.
          };
        default:
          return changes;
      }
    },
    onStateChange({
      inputValue: newInputValue,
      type,
      selectedItem: newSelectedItem
    }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (newSelectedItem) {
            setSelectedItems([...selectedItems, newSelectedItem]);
          }
          break;

        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(newInputValue || "");

          break;
        default:
          break;
      }
    }
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <label className="w-fit" {...getLabelProps()}>
          Select some charities:
        </label>
        <div className="inline-flex flex-wrap items-center gap-2 bg-white p-1.5 shadow-sm">
          {selectedItems.map(function renderSelectedItem(
            selectedItemForRender,
            index
          ) {
            return (
              <span
                className="flex items-center gap-1 rounded-md bg-gray-100 px-1"
                key={`selected-item-${index}`}
                {...getSelectedItemProps({
                  selectedItem: selectedItemForRender,
                  index
                })}
              >
                <span>{selectedItemForRender.name}</span>
                <input
                  type="hidden"
                  name={`charities[${index}][charityId]`}
                  value={selectedItemForRender.id}
                />
                <input type="color" name={`charities[${index}][color]`} />
                <span
                  className="cursor-pointer px-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedItem(selectedItemForRender);
                  }}
                >
                  &#10005;
                </span>
              </span>
            );
          })}
          <div className="flex grow gap-0.5">
            <input
              className="w-full rounded-none border-b border-b-brand-deep-purple p-2 font-normal !text-brand-gray"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            />
            <button
              aria-label="toggle menu"
              className="px-2"
              type="button"
              {...getToggleButtonProps()}
            >
              &#8595;
            </button>
          </div>
        </div>
      </div>
      <ul
        className={`w-inherit absolute mt-1 max-h-80 overflow-scroll bg-white p-0 shadow-md ${
          !(isOpen && items.length) && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              className={clsx(
                highlightedIndex === index && "bg-blue-300",
                selectedItem === item && "font-bold",
                "flex flex-col px-3 py-2 shadow-sm"
              )}
              key={item.id}
              {...getItemProps({ item, index })}
            >
              <span>{item.name}</span>
              {/* <span className="text-sm text-gray-700">{item.author}</span> */}
            </li>
          ))}
      </ul>
    </div>
  );
}
