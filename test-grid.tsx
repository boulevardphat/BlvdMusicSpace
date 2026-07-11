export default function Test() {
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      <div className="col-span-2 row-span-2 bg-red-500 aspect-square">Large</div>
      <div className="col-span-1 bg-blue-500 aspect-square">Small 1</div>
      <div className="col-span-1 bg-blue-500 aspect-square">Small 2</div>
      <div className="col-span-1 bg-blue-500 aspect-square">Small 3</div>
    </div>
  )
}
