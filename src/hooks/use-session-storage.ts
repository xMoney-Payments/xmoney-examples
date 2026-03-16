import { useEffect, useState } from 'react'

export function useSessionStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.sessionStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue
        }
    })

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
            window.dispatchEvent(new Event('session-storage'))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const item = window.sessionStorage.getItem(key)
                setStoredValue(item ? JSON.parse(item) : initialValue)
            } catch (error) {
                console.log(error)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('session-storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('session-storage', handleStorageChange)
        }
    }, [key, initialValue])

    return [storedValue, setValue] as const
}
