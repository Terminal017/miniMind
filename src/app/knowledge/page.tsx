import DocList from './doc-list'

export default function KnowledgePage() {
  return (
    <>
      <main
        className="w-full min-h-screen flex bg-secondary flex-row justify-center
      text-secondary-foreground pt-16"
      >
        <div className="flex flex-col items-center w-7/10">
          <DocList />
        </div>
      </main>
    </>
  )
}
