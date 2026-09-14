import { useEffect, useRef, useState } from "react"
import { useRouterState } from "@tanstack/react-router"

export function RouterProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoading) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
      setVisible(true)
      setProgress((prev) => (prev > 0 ? prev : 15))

      // Hiệu ứng "trickle" (tăng dần): giúp người dùng cảm nhận trang đang tải liên tục
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 60) return prev + Math.random() * 12
          if (prev < 85) return prev + Math.random() * 4
          if (prev < 95) return prev + 0.5
          return prev
        })
      }, 200)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(100)

      // Giữ hiển thị 100% trong chốc lát rồi fade-out mượt mà
      fadeTimeoutRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 350)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[100] h-[3px] w-full overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-primary transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionDuration: progress === 100 ? "300ms" : "200ms",
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  )
}

