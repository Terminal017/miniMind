import DocList from './doc-list'

export default function KnowledgePage() {
  return (
    <>
      <main
        className="w-full min-h-screen flex flex-row justify-center
      pt-16"
      >
        <div className="flex flex-col items-center w-7/10">
          <DocList />
        </div>
      </main>
    </>
  )
}
