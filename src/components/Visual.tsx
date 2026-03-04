export function Visual() {
  return (
    <div className="w-full h-full relative">
      <Memory height={50} width={200} top={0} left={150} />
      <BusLine height={750} width={30} top={10} left={465} />
      <BusLine height={750} width={30} top={10} left={1} />
      <BusLine height={30} width={496} top={730} left={0} />
    </div>
  );
}

function Memory({
  width,
  height,
  top,
  left,
}: {
  width: number;
  height: number;
  top: number;
  left: number;
}) {
  return (
    <div
      style={{ width, height, top, left }}
      className="bg-gray-800 absolute text-white flex items-center justify-center border-solid border-black border-2 rounded-sm"
    >
      Memory Unit
    </div>
  );
}

function BusLine({
  width,
  height,
  top,
  left,
}: {
  width: number;
  height: number;
  top: number;
  left: number;
}) {
  return (
    <div
      style={{ width, height, top, left }}
      className="bg-gray-800 absolute text-white flex items-center justify-center border-solid border-black border-2 rounded-sm"
    ></div>
  );
}
