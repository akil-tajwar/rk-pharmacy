'use client'
import { Fragment, useState, useRef } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { Check, ChevronsUpDown } from 'lucide-react'

export interface ComboboxItem {
  id: string | number
  name: string
}

interface CustomComboboxProps<T extends ComboboxItem> {
  items: T[]
  value: T | null
  onChange: (item: T | null) => void
  placeholder?: string
  disabled?: boolean
}

export function CustomCombobox<T extends ComboboxItem>({
  items,
  value,
  onChange,
  placeholder = 'Select an item...',
}: CustomComboboxProps<T>) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) =>
          item.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  const handleContainerMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if ((event.target as HTMLElement).closest('.combobox-option')) {
      // If an option was clicked, do not trigger our custom behavior.
      return
    }
    if (inputRef.current) {
      // Focus the input element.
      inputRef.current.focus()
      // Dispatch an ArrowDown key event to open the dropdown.
      const arrowDownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      })
      inputRef.current.dispatchEvent(arrowDownEvent)
    }
  }

  return (
    <div onMouseDown={handleContainerMouseDown} className="w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden border rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              ref={inputRef}
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-3 text-gray-900 focus:ring-0"
              displayValue={(item: T | null) => item?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 top-2 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-20 mt-1 h-24 min-w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
              {filteredItems.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Combobox.Option
                    key={item.id}
                    value={item}
                    className={({ active }) =>
                      `combobox-option relative cursor-default select-none py-1 px-10 mx-2 rounded-md ${
                        active ? 'bg-slate-200 text-black' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center">
                        {selected && (
                          <span
                            className={`inset-y-0 left-0 flex items-center ${
                              active ? 'text-teal-600' : 'text-teal-600'
                            }`}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                        <span
                          className={`block truncate px-3 ${selected ? 'font-bold' : 'font-normal'}`}
                        >
                          {item.name}
                        </span>
                      </div>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
