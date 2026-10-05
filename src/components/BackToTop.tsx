"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <Button
      size="icon"
      className={cn(
        "fixed bottom-8 right-8 z-50 rounded-full shadow-md transition-opacity duration-300 bg-foreground text-background hover:bg-foreground p-5",
        isVisible ? "back-to-top" : "hide-back-to-top"
      )}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp className="size-8" />
    </Button>
  )
}
