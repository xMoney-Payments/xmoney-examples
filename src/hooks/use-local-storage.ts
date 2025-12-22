import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue
        }
    })

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value
            // Save state
            setStoredValue(valueToStore)
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
            // Dispatch a custom event so other components know the value has changed
            window.dispatchEvent(new Event('local-storage'))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const item = window.localStorage.getItem(key)
                setStoredValue(item ? JSON.parse(item) : initialValue)
            } catch (error) {
                console.log(error)
            }
        }

        // Listen for changes in other tabs/windows
        window.addEventListener('storage', handleStorageChange)
        // Listen for changes in the same tab/window
        window.addEventListener('local-storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('local-storage', handleStorageChange)
        }
    }, [key, initialValue])

    return [storedValue, setValue] as const
}
