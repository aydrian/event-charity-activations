import { clsx } from "clsx";
import { resetIdCounter, useCombobox, useMultipleSelection } from "downshift";
import React, { useCallback } from "react";

import type { CharityItem } from "~/models/charity.server.ts";

import { ColorSelector } from "./color-selector.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

export type CharityItemWithColor = CharityItem & { color?: string };

type CharitySelectorProps = {
  allCharities: CharityItemWithColor[];
  maxItems?: number;
  name?: string;
  selectedCharities?: CharityItemWithColor[];
};

export function CharitySelector({
  allCharities,
  maxItems = 4,
  name = "charities",
  selectedCharities = []
}: CharitySelectorProps) {
  const getFilteredCharities = useCallback(
    (selectedItems: CharityItemWithColor[], inputValue: string) => {
      const lowerCasedInputValue = inputValue.toLowerCase();

      return allCharities.filter(function filterCharity(charity) {
        return (
          !selectedItems.find((item) => item.id === charity.id) &&
          charity.name.toLowerCase().includes(lowerCasedInputValue)
        );
      });
    },
    [allCharities]
  );

  const [inputValue, setInputValue] = React.useState("");
  const [selectedItems, setSelectedItems] =
    React.useState<CharityItemWithColor[]>(selectedCharities);
  const items = React.useMemo(
    () => getFilteredCharities(selectedItems, inputValue),
    [selectedItems, inputValue, getFilteredCharities]
  );
  const { getDropdownProps, getSelectedItemProps, removeSelectedItem } =
    useMultipleSelection({
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
      },
      selectedItems
    });
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    selectedItem
  } = useCombobox({
    defaultHighlightedIndex: 0,
    itemToString(item) {
      return item ? item.name : "";
    },
    items,
    onStateChange({
      inputValue: newInputValue,
      selectedItem: newSelectedItem,
      type
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
    },
    selectedItem: null,
    stateReducer(_state, actionAndChanges) {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            highlightedIndex: 0, // with the first option highlighted.
            isOpen: true // keep the menu open after selection.
          };
        default:
          return changes;
      }
    }
  });
  resetIdCounter();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1.5">
        <Label className="w-fit" {...getLabelProps()}>
          Select up to {maxItems} charities:
        </Label>
        <div className="inline-flex flex-wrap items-center gap-2 bg-white">
          {selectedItems.map(
            function renderSelectedItem(selectedItemForRender, index) {
              return (
                <span
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-1"
                  key={`selected-item-${index}`}
                  {...getSelectedItemProps({
                    index,
                    selectedItem: selectedItemForRender
                  })}
                >
                  <ColorSelector
                    name={`${name}[${index}].color`}
                    selectedColor={selectedItemForRender.color}
                  />
                  <span className="font-medium">
                    {selectedItemForRender.name}
                  </span>
                  <input
                    name={`${name}[${index}].charityId`}
                    type="hidden"
                    value={selectedItemForRender.id}
                  />
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedItem(selectedItemForRender);
                    }}
                    className="cursor-pointer px-1"
                  >
                    &#10005;
                  </span>
                </span>
              );
            }
          )}
          <div
            className={`flex grow gap-1.5 ${
              selectedItems.length >= maxItems && "hidden"
            }`}
          >
            <Input
              className="!text-brand-gray w-full p-2 font-normal"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            />
            <Button
              aria-label="toggle menu"
              className="bg-brand-electric-purple px-2 duration-300 hover:bg-brand-electric-purple/90"
              type="button"
              {...getToggleButtonProps()}
            >
              &#8595;
            </Button>
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
              {...getItemProps({ index, item })}
            >
              <span>{item.name}</span>
              {/* <span className="text-sm text-gray-700">{item.author}</span> */}
            </li>
          ))}
      </ul>
    </div>
  );
}
