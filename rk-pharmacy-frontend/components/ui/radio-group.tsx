'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupContextValue {
  value: string | undefined
  onChange: (value: string) => void
}

const RadioGroupContext = React.createContext<
  RadioGroupContextValue | undefined
>(undefined)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState<
      string | undefined
    >(value || defaultValue)

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    const handleChange = React.useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setSelectedValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [value, onValueChange]
    )

    return (
      <RadioGroupContext.Provider
        value={{ value: selectedValue, onChange: handleChange }}
      >
        <div className={cn('grid gap-2', className)} ref={ref} {...props} />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    if (!context) {
      throw new Error('RadioGroupItem must be used within a RadioGroup')
    }

    const { value: groupValue, onChange } = context

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onChange(value)
      }
    }

    return (
      <input
        type="radio"
        className={cn(
          'h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        value={value}
        checked={groupValue === value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
