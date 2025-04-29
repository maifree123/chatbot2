'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal, MessageCircle, Settings, Loader2, UploadCloud, X } from 'lucide-react'
import axios from 'axios'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { FileModal } from '@/db/schema'
import { usePathname } from 'next/navigation'

const UploadContainer = () => {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const queryClient = useQueryClient()
  const editContainerRef = useRef<HTMLDivElement>(null)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('') // 重命名
  const [userId, setUserId] = useState<string | null>(null)
  
  // 从路径中提取当前聊天ID
  const currentChatId = pathname.split('/')[2]
  
  // 用于显示三个点按钮（当鼠标悬停时）
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
  // 控制哪个聊天项的选项菜单正在显示（保存 chat 的 id）
  const [showOptions, setShowOptions] = useState<string | null>(null)
  // 保存菜单的位置（用于 portal 定位）
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  // 保存触发菜单的三个点按钮的引用
  const [buttonElement, setButtonElement] = useState<HTMLElement | null>(null)
  // 菜单容器的引用，用于判断鼠标是否在菜单内
  const menuRef = useRef<HTMLDivElement>(null)
  
  // 新增状态控制上传弹窗
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  //补丁，获取路由参数判断是否需要动画
  const skipAnimation = new URLSearchParams(window.location.search).has('noAnimation');
  // 文件相关状态
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null)
  const [showFileOptions, setShowFileOptions] = useState<string | null>(null)
  const [fileMenuPosition, setFileMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [fileButtonElement, setFileButtonElement] = useState<HTMLElement | null>(null)

  // 获取文件列表
  const { data: files, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => axios.post('/api/get-files')
  })

  // 文件上传逻辑
  const { mutate, isLoading: isUploading } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return axios.post('/api/upload', formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })

  // 处理拖拽上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    mutate(acceptedFiles[0])
    setIsUploadModalOpen(false) // 上传后关闭弹窗
  }, [mutate])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  // 侧边栏展开/折叠
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // 获取聊天记录
  useEffect(() => {
    setUserId(localStorage.getItem('user_id'))
  }, [])

  const { data: chats } = useQuery({
    queryKey: ['chats', userId],
    queryFn: async () => {
      const res = await axios.get('/api/get-chats', { 
        headers: { 'X-User-ID': userId! }
      })
      return res.data
    },
    enabled: !!userId,
    refetchInterval: 10000 // 每10秒刷新一次
  })

  // 删除聊天记录
  const handleDeleteChat = async (chatId: string) => {
    console.log('Delete function triggered with chatId:', chatId)
    if (!chatId) {
      console.error('Chat ID is missing!')
      return
    }
  
    try {
      const response = await axios.delete('/api/delete-chat', {
        headers: { 'Content-Type': 'application/json' },
        data: { chatId },
      })
  
      console.log('Response from API:', response.data)
  
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['chats'] })
        alert('聊天删除成功')
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除聊天失败', error)
      alert('删除聊天失败')
    }
  }
  
  // 重命名 mutation
  const { mutate: renameChat } = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const res = await axios.put('/api/rename-chat', { chatId, newTitle: title })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chats'])
      setEditingChatId(null)
    }
  })

  // 全局监听鼠标移动，关闭不在按钮和菜单区域内的菜单
  useEffect(() => {
    if (!showOptions) return

    const handleMouseMove = (e: MouseEvent) => {
      if (buttonElement && buttonElement.contains(e.target as Node)) return
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      setShowOptions(null)
      setButtonElement(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [showOptions, buttonElement])

  // 点击空白处取消重命名状态
  useEffect(() => {
    if (!editingChatId) return

    const handleClick = (e: MouseEvent) => {
      if (!editContainerRef.current?.contains(e.target as Node)) {
        setEditingChatId(null)
      }
    }
  
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [editingChatId])

  // 时间轴逻辑，将聊天记录按日期分组
  const groupChats = (chats: any[]) => {
    const groups: { [key: string]: any[] } = {}
    
    chats?.forEach(chat => {
      const date = new Date(chat.createdAt)
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24))
      
      let group = '更早'
      if (diffDays === 0) group = '今天'
      else if (diffDays === 1) group = '昨天'
      else if (diffDays <= 7) group = '过去7天'
      else if (diffDays <= 30) group = '过去30天'
      
      groups[group] = groups[group] || []
      groups[group].push(chat)
    })
    
    return groups
  }
  
  // 删除文件 mutation
  const { mutate: deleteFile } = useMutation({
    mutationFn: async (fileId: number) => {
      await axios.delete('/api/delete-file', { data: { fileId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })

  // 文件列表项鼠标事件
  const handleFileMouseEnter = (fileId: string) => setHoveredFileId(fileId)
  const handleFileMouseLeave = () => setHoveredFileId(null)

  // 全局点击关闭菜单逻辑
  useEffect(() => {
    if (!showFileOptions) return

    const handleMouseMove = (e: MouseEvent) => {
      if (fileButtonElement && fileButtonElement.contains(e.target as Node)) return
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      setShowFileOptions(null)
      setFileButtonElement(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [showFileOptions, fileButtonElement])
  
  return (
    <motion.div
      className={`h-full flex flex-col bg-card transition-all duration-300
      ${isCollapsed ? 'w-[56px]' : 'w-64 lg:w-72'}`}
      initial={skipAnimation ? false : { x: -300, opacity: 0 }}  // 初始状态：从左侧外面进入，透明度为0
      animate={skipAnimation ? false : { x: 0, opacity: 1 }} // 动画结束时，恢复到原位置，透明度变为1
      exit={skipAnimation ? {} : { x: -300, opacity: 0 }} // 退出时的状态：从左侧滑出，透明度为0
      transition={{ duration: skipAnimation ? 0 : 0.5 }}  // 设置动画持续时间
    >
      {/* 顶部工具栏 */}
      <div className="flex items-center w-full p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Link href="/chat">
              <Button size="lg" className="w-auto mr-2 rounded-full bg-primary hover:bg-primary-dark">
                新建聊天
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg text-mute-foreground dark:text-mute-foreground hover:bg-primary  dark:hover:text-primary-foreground"
                title="设置"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}

        {/* 折叠/展开按钮 */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="m-0 ml-auto rounded-lg rounded-lg text-mute-foreground dark:text-mute-foreground hover:bg-primary  dark:hover:text-primary-foreground"
        >
          {isCollapsed 
          ? <ChevronRight className="h-5 w-5" /> 
          : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* 聊天记录列表 */}
          <div className="mt-0 w-full flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 dark:scrollbar-thumb-mute max-h-[calc(100vh-200px)] p-4">
            {isLoading ? (
              <p className="text-sm text-center text-gray-500">加载中...</p>
            ) : (
              Object.entries(groupChats(chats || [])).map(([groupName, groupChats]) => (
                <div key={groupName}>
                  <div className="text-xs text-muted-foreground font-medium mb-2 mt-4 first:mt-0 hidden">
                    {groupName}
                  </div>
                  {groupChats.map((chat: any) => {
                    const isActive = pathname.startsWith(`/chat/${chat.id}`)
                    return (
                      <div
                        key={chat.id}
                        className={`animate-in fade-in-50 slide-in-from-left-4 duration-200 
                          group relative mb-1.5 rounded-lg p-1.5 transition-colors
                          ${isActive || hoveredChatId === chat.id ? 'bg-primary/5' : ''}`}
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                      >
                        <div className="relative flex items-center gap-2">
                          <div className="flex-shrink-0 text-primary"></div>
                          <div className="min-w-0 flex-1">
                            {editingChatId === chat.id ? (
                              <div ref={editContainerRef} className="flex items-center gap-2">
                                <input
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") renameChat({ chatId: chat.id, title: newTitle })
                                    if (e.key === "Escape") setEditingChatId(null)
                                  }}
                                  className="block w-full truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => renameChat({ chatId: chat.id, title: newTitle })}
                                >
                                  保存
                                </Button>
                              </div>
                            ) : (
                              <Link
                                href={`/chat/${chat.id}`}
                                className="block w-full overflow-visible group-hover:text-primary"
                              >
                                <p className={`text-sm font-medium 
                                  ${isActive ? 'text-primary' : 'text-foreground'}
                                  whitespace-nowrap pr-8 transition-colors overflow-hidden`}>
                                  {chat.title}
                                </p>
                              </Link>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 
                            ${(isActive || hoveredChatId === chat.id) ? 'opacity-100' : 'opacity-0'}
                            transition-opacity`}>
                            <button
                              className="rounded hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                const rect = e.currentTarget.getBoundingClientRect()
                                setMenuPosition({ top: rect.bottom, left: rect.left })
                                setShowOptions(prev => prev === chat.id ? null : chat.id)
                                setButtonElement(e.currentTarget)
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="absolute inset-0 -z-10 rounded-lg 
                        shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] 
                        transition-all 
                        group-hover:shadow-[0_1px_4px_-1px_rgba(0,0,0,0.1)]" />
                      </div>           
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* 在原来的上传区域位置添加分隔线 */}
          <hr className="my-4 mx-4 border-t border-border" />

          {/* 文件列表 */}
          <div className="mt-0 w-full flex-1 overflow-y-auto max-h-[calc(100vh-200px)] p-2">
            {files?.data.map((file: FileModal) => {
              const isActive = pathname.startsWith(`/file/${file.id}`)
              return (
                <div
                  key={file.id}
                  className="animate-in fade-in-50 slide-in-from-left-4 duration-200 
                  group relative mb-1.5 rounded-lg p-1.5 transition-colors 
                  hover:bg-primary/5"
                  onMouseEnter={() => handleFileMouseEnter(file.id)}
                  onMouseLeave={handleFileMouseLeave}
                >
                  <div className="relative flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Link 
                        href={`/file/${file.id}`} 
                        className="block w-full overflow-visible group-hover:text-primary"
                      >
                        <p className={`text-sm font-medium 
                          ${isActive ? 'text-primary' : 'text-foreground'}
                          whitespace-nowrap pr-8 transition-colors overflow-hidden`}>
                          {file.file_name}
                        </p>
                      </Link>
                    </div>
                    <div className={`flex items-center gap-1 
                      ${(isActive || hoveredFileId === file.id) ? 'opacity-100' : 'opacity-0'}
                      transition-opacity`}>
                      <button
                        className="rounded hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          setFileMenuPosition({ top: rect.bottom, left: rect.left })
                          setShowFileOptions(prev => prev === file.id ? null : file.id)
                          setFileButtonElement(e.currentTarget)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 -z-10 rounded-lg 
                  shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] 
                  transition-all 
                  group-hover:shadow-[0_1px_4px_-1px_rgba(0,0,0,0.1)]" />
                </div>
              )
            })}
          </div>

          {/* 文件选项菜单 */}
          {showFileOptions && fileMenuPosition && createPortal(
            <div
              ref={menuRef}
              style={{ position: 'fixed', top: fileMenuPosition.top, left: fileMenuPosition.left }}
              className="bg-card shadow-md p-2 rounded-lg z-50 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <ul>
                <li 
                  className="hover:bg-primary/10 dark:hover:bg-primary/20 p-2 cursor-pointer rounded-sm"
                  onClick={() => {
                    deleteFile(showFileOptions)
                    setShowFileOptions(null)
                  }}
                >
                  <span className="text-sm text-foreground">删除文件</span>
                </li>
              </ul>
            </div>,
            document.body
          )}

          {/* 新增的上传弹窗触发按钮 */}
          <div className="mt-auto p-4">
            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full bg-primary hover:bg-primary-dark transition-colors"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              上传文件
            </Button>
          </div>
        </>
      )}

      {/* 选项菜单，通过 createPortal 渲染到 document.body */}
      {showOptions && menuPosition && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left }}
          className="bg-card shadow-md p-2 rounded-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            <li 
              className="hover:bg-primary/10 dark:hover:bg-primary/20 p-2 cursor-pointer"
              onClick={() => {
                const currentChat = chats?.find((c: any) => c.id === showOptions)
                if (currentChat) {
                  setEditingChatId(currentChat.id)
                  setNewTitle(currentChat.title)
                  setShowOptions(null)
                }
              }}
            >
              <span className="text-black dark:text-white">重命名</span>
            </li>
            <li 
              className="hover:bg-primary/10 dark:hover:bg-primary/20 p-2 cursor-pointer"
              onClick={() => {
                if (showOptions) {
                  handleDeleteChat(showOptions)
                  setShowOptions(null)
                }
              }}
            >
              <span className="text-black dark:text-white">删除</span>
            </li>
          </ul>
        </div>,
        document.body
      )}

      {/* 上传弹窗，通过 createPortal 渲染到 document.body */}
      {isUploadModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-card rounded-xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary/10"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* 上传内容 */}
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center transition-all hover:border-primary/50">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">上传中...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 mx-auto text-primary mb-4" />
                    <p className="text-sm font-medium text-foreground mb-2">
                      拖拽文件到这里或点击上传
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 PDF 文档格式
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-4"
                      variant="outline"
                    >
                      选择文件
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 底部提示 */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              文件将安全存储，仅用于知识库分析
            </p>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
    
  )
}

export default UploadContainer
