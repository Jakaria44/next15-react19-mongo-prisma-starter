'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {Button} from "@/components/ui/button";

type Theme = 'dark' | 'light'

const ThemeContext = createContext({
	theme: 'light' as Theme,
	toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light')

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') as Theme
		if (savedTheme) {
			setTheme(savedTheme)
			document.documentElement.classList.toggle('dark', savedTheme === 'dark')
		}
	}, [])

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
		localStorage.setItem('theme', newTheme)
		document.documentElement.classList.toggle('dark', newTheme === 'dark')
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => useContext(ThemeContext)



export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button variant="secondary" onClick={toggleTheme}>
			{theme === 'light' ? '🌞' : '🌜'}
		</Button>
	);
}

