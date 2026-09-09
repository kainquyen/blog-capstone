import { Moon, Sun } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTheme } from "~/components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")

  return (
    <Button onClick={toggleTheme} variant="outline" size="icon" aria-label="Submit">
        {theme === 'light' ? 
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        : 
        <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    }
    </Button>
  )
}