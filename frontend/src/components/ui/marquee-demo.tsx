import { Marquee } from "@/components/ui/marquee"

export default function Demo() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <Marquee>
        <span className="mx-8 text-2xl font-medium">React</span>
        <span className="mx-8 text-2xl font-medium">Next.js</span>
        <span className="mx-8 text-2xl font-medium">Tailwind</span>
        <span className="mx-8 text-2xl font-medium">TypeScript</span>
        <span className="mx-8 text-2xl font-medium">Supabase</span>
      </Marquee>
    </div>
  )
}
