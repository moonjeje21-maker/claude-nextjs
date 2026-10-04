import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// 설치한 shadcn/ui 컴포넌트가 제대로 보이는지 확인하는 예시 모음
export function ComponentDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>컴포넌트 미리보기</CardTitle>
        <CardDescription>
          src/components/ui 에 들어 있는 기본 컴포넌트입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Button>
            <Sparkles aria-hidden />
            기본 버튼
          </Button>
          <Button variant="secondary">보조 버튼</Button>
          <Button variant="outline">테두리 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">테두리</Badge>
          <Badge variant="destructive">경고</Badge>
        </div>

        <Separator />

        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="demo-email">이메일</Label>
          <Input id="demo-email" type="email" placeholder="you@example.com" />
        </div>
      </CardContent>
    </Card>
  )
}
