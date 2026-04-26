import { ElectionTabs } from "./components/ElectionTabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-12">
      <div className="mx-auto flex w-full max-w-[1048px] flex-col gap-8">
        <ElectionTabs />
      </div>
    </main>
  );
}
