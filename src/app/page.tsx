import { ComponentDemo } from "@/components/component-demo"
import { SiteHeader } from "@/components/site-header"
import { StackCard } from "@/components/stack-card"
import { stackItems } from "@/lib/stack"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-12">
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            웹개발 스타터 킷
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Next.js, TypeScript, Tailwind CSS, shadcn/ui, lucide-react가 설정된
            상태로 바로 시작할 수 있습니다.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              src/app/page.tsx
            </code>{" "}
            를 고쳐서 시작하세요.
          </p>
        </section>

        {/* 기술 스택 카드: 휴대폰 1열 → 태블릿 2열 → 데스크톱 3열 */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stackItems.map((item) => (
            <StackCard key={item.name} item={item} />
          ))}
        </section>

        <ComponentDemo />
      </main>
    </>
  )
}
