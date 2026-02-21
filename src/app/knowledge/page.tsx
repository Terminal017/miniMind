import LibList from './lib-list'

export default function KnowledgePage() {
  return (
    <>
      <div className="w-full min-h-full flex flex-row justify-center">
        <div className="flex flex-col items-center w-7/10">
          <LibList />
        </div>
      </div>
    </>
  )
}
