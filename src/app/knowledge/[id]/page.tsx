import DocList from './doc-list'

export default function KnowledgePage() {
  return (
    <>
      <div className="w-full min-h-full flex flex-row justify-center pt-1">
        <div className="flex flex-col items-center w-7/10">
          <DocList />
        </div>
      </div>
    </>
  )
}
