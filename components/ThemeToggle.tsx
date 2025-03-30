// src/components/ThemeToggle.tsx
'use client'

import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '@radix-ui/react-icons'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 初始化时从 localStorage 或系统偏好读取
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(savedTheme ? savedTheme === 'dark' : prefersDark)
  }, [])

  useEffect(() => {
    // 更新DOM类名和localStorage
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  )
}