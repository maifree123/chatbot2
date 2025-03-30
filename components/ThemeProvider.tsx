// src/components/ThemeProvider.tsx
'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
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

  return <>{children}</>
}