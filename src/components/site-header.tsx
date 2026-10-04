import { Rocket } from "lucide-react"

import { Button } from "@/components/ui/button"

// 페이지 맨 위에 고정되는 머리글
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold">
          <Rocket className="size-5" aria-hidden />
          Starter Kit
        </span>
        <Button asChild variant="outline" size="sm">
          <a
            href="https://ui.shadcn.com/docs/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            컴포넌트 둘러보기
          </a>
        </Button>
      </div>
    </header>
  )
}
