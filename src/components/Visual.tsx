import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const toHex16 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(4, "0");

const toHex12 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(3, "0");

const toHex8 = (num: number): string =>
  num.toString(16).toUpperCase().padStart(2, "0");

type DataPacketProps = {
  points: { x: number; y: number }[];
  data: string;
  onComplete: () => void;
  duration?: number;
};

function getPathLength(points: { x: number; y: number }[]) {
  let length = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;

    length += Math.sqrt(dx * dx + dy * dy);
  }

  return length;
}

function computeTimes(points: { x: number; y: number }[]) {
  const distances: number[] = [0];
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const d = Math.sqrt(dx * dx + dy * dy);

    total += d;
    distances.push(total);
  }

  return distances.map((d) => d / total);
}

function buildKeyframes(points: { x: number; y: number }[], pause = 0.1) {
  const x: number[] = [];
  const y: number[] = [];
  const times: number[] = [];

  const segment = 1 / (points.length - 1);

  let t = 0;

  points.forEach((p, i) => {
    x.push(p.x);
    y.push(p.y);
    times.push(t);

    if (i !== points.length - 1) {
      t += pause * segment;

      x.push(p.x);
      y.push(p.y);
      times.push(t);

      t += (1 - pause) * segment;
    }
  });

  return { x, y, times };
}

function DataPacket({
  points,
  data,
  onComplete,
  speed = 200,
}: DataPacketProps & { speed?: number }) {
  const pathLength = getPathLength(points);
  const duration = pathLength / speed;

  const { x, y, times } = buildKeyframes(points, 0.3); // 0.2 = %20 pause

  return (
    <motion.div
      initial={{ x: points[0].x, y: points[0].y }}
      animate={{ x, y }}
      transition={{
        duration,
        times,
        ease: "backInOut",
      }}
      className="absolute w-fit h-fit border border-green-500 rounded-sm z-50 overflow-visible flex items-center justify-center text-[10px] px-1"
      onAnimationComplete={onComplete}
    >
      <span className="font-bold text-white">{data}</span>
    </motion.div>
  );
}

export function Visual() {
  const { busTransfers, setBusTransfers } = useAppContext();

  return (
    <div className="w-full h-full relative overflow-hidden ">
      {busTransfers.map((transfer, index) => {
        if (transfer.from == "PC" && transfer.to == "AR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 250, y: 180 }, // PC
                { x: 440, y: 180 }, // BUS
                { x: 440, y: 730 }, // BUS vertical
                { x: 0, y: 730 },
                { x: 0, y: 115 }, // AR
                { x: 220, y: 115 }, // AR
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "ALU" && transfer.to == "E") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 100, y: 370 },
                { x: 50, y: 370 },
                { x: 50, y: 400 },
              ]}
              speed={100}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "ALU" && transfer.to == "AC") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 150, y: 350 },
                { x: 300, y: 350 },
              ]}
              speed={200}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "AC" && transfer.to == "ALU") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 320, y: 350 },
                { x: 320, y: 420 },
                { x: 150, y: 420 },
                { x: 150, y: 350 },
              ]}
              speed={200}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "INPR" && transfer.to == "ALU") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 200, y: 480 },
                { x: 120, y: 480 },
                { x: 120, y: 350 },
              ]}
              speed={200}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "MEMORY" && transfer.to == "IR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 400, y: 20 },
                { x: 450, y: 20 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 550 },
                { x: 230, y: 550 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "IR" && transfer.to == "AR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 230, y: 550 },
                { x: 450, y: 550 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 100 },
                { x: 230, y: 100 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "MEMORY" && transfer.to == "AR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 400, y: 20 },
                { x: 450, y: 20 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 100 },
                { x: 230, y: 100 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "PC" && transfer.to == "TR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 250, y: 180 }, // PC
                { x: 440, y: 180 }, // BUS
                { x: 440, y: 730 }, // BUS vertical
                { x: 0, y: 730 },
                { x: 0, y: 615 },
                { x: 220, y: 615 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "TR" && transfer.to == "MEMORY") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 240, y: 615 },
                { x: 440, y: 615 },
                { x: 440, y: 730 }, // BUS vertical
                { x: 0, y: 730 },
                { x: 0, y: 20 }, // MEMORY
                { x: 220, y: 20 }, // MEMORY
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "MEMORY" && transfer.to == "DR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 400, y: 20 },
                { x: 450, y: 20 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 250 },
                { x: 180, y: 250 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "DR" && transfer.to == "ALU") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 180, y: 250 },
                { x: 325, y: 250 },
                { x: 325, y: 300 },
                { x: 125, y: 300 },
                { x: 125, y: 350 },
              ]}
              speed={200}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "AC" && transfer.to == "MEMORY") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 320, y: 350 },
                { x: 430, y: 350 },
                { x: 430, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 20 },
                { x: 230, y: 20 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "AR" && transfer.to == "PC") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 220, y: 115 }, // AR
                { x: 430, y: 115 }, // AR
                { x: 430, y: 730 },
                { x: 0, y: 730 },
                { x: 0, y: 180 },
                { x: 225, y: 180 }, // PC
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "PC" && transfer.to == "MEMORY") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 250, y: 180 }, // PC
                { x: 440, y: 180 }, // BUS
                { x: 440, y: 730 }, // BUS vertical
                { x: 0, y: 730 },
                { x: 0, y: 20 }, // MEMORY
                { x: 220, y: 20 }, // MEMORY
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "MEMORY" && transfer.to == "DR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 400, y: 20 },
                { x: 450, y: 20 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 125, y: 300 },
                { x: 125, y: 350 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }
        if (transfer.from == "MEMORY" && transfer.to == "DR") {
          return (
            <DataPacket
              key={transfer.uuid}
              points={[
                { x: 400, y: 20 },
                { x: 450, y: 20 },
                { x: 450, y: 730 },
                { x: 0, y: 730 },
                { x: 125, y: 300 },
                { x: 125, y: 350 },
              ]}
              speed={300}
              onComplete={() => {
                setBusTransfers((prev) =>
                  prev.filter((x) => x.uuid !== transfer.uuid),
                );
              }}
              data={toHex16(transfer.data)}
            />
          );
        }

        return null;
      })}

      <Arrow length={100} direction="right" top={30} left={10} />
      <Memory height={80} width={300} top={0} left={100} />
      <Arrow length={80} direction="right" top={30} left={400} />

      <BusLine height={750} width={30} top={10} left={465} />
      <BusLine height={750} width={30} top={10} left={1} />
      <BusLine height={30} width={496} top={730} left={0} />

      <Arrow length={200} direction="right" top={105} left={10} />
      <AR height={30} width={100} top={100} left={200} />
      <Arrow length={180} direction="right" top={105} left={300} />

      <Arrow length={200} direction="right" top={185} left={10} />
      <PC height={30} width={100} top={180} left={200} />
      <Arrow length={180} direction="right" top={185} left={300} />

      <Arrow length={150} direction="right" top={265} left={10} />
      <DR height={30} width={125} top={260} left={150} />
      <Arrow length={200} direction="right" top={265} left={280} />

      <Line length={40} direction="down" top={265} left={350} />
      <Line length={200} direction="left" top={305} left={350} />
      <Arrow length={40} direction="down" top={305} left={150} />
      <ALU height={80} width={100} top={325} left={100} />
      <Arrow length={110} direction="up" top={490} left={150} />
      <Line length={50} direction="left" top={490} left={200} />

      <Arrow length={110} direction="right" top={355} left={200} />
      <Arrow length={80} direction="right" top={355} left={400} />

      <Line length={35} direction="left" top={375} left={100} />
      <Arrow length={40} direction="down" top={375} left={65} />
      <E height={30} width={30} top={425} left={50} />

      <Line length={40} direction="down" top={380} left={350} />
      <Line length={170} direction="left" top={420} left={350} />
      <Arrow length={40} direction="up" top={420} left={180} />
      <AC height={50} width={100} top={340} left={300} />

      <Arrow length={200} direction="right" top={505} left={10} />
      <INPR height={30} width={80} top={490} left={200} />
      <Arrow length={200} direction="right" top={495} left={280} />

      <Arrow length={200} direction="right" top={555} left={10} />
      <IR height={30} width={100} top={550} left={200} />
      <Arrow length={180} direction="right" top={555} left={300} />

      <Arrow length={200} direction="right" top={615} left={10} />
      <TR height={30} width={100} top={610} left={200} />
      <Arrow length={180} direction="right" top={615} left={300} />

      <Arrow length={200} direction="right" top={675} left={10} />
      <OUTR height={30} width={80} top={670} left={200} />
      <Arrow length={200} direction="right" top={675} left={280} />
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
      className="bg-gray-800 absolute text-white flex items-center justify-center border-solid border-black border-2 rounded-sm  flex-col font-bold"
    >
      <span>Memory Unit</span>
      <span>4096x16</span>
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

function AR({
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
      AR
    </div>
  );
}
function PC({
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
      PC
    </div>
  );
}

function DR({
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
      DR
    </div>
  );
}

function AC({
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
      AC
    </div>
  );
}

function INPR({
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
      INPR
    </div>
  );
}

function IR({
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
      IR
    </div>
  );
}

function TR({
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
      TR
    </div>
  );
}

function OUTR({
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
      OUTR
    </div>
  );
}

function ALU({
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
      ALU
    </div>
  );
}

function E({
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
      E
    </div>
  );
}

type ArrowProps = {
  length?: number;
  direction?: "right" | "left" | "up" | "down";
  thickness?: number;
  top?: number;
  left?: number;
};

export function Arrow({
  length = 100,
  direction = "right",
  thickness = 2,
  top = 0,
  left = 0,
}: ArrowProps) {
  const rotation = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  }[direction];

  return (
    <div
      className={`absolute z-10 origin-left ${rotation}`}
      style={{ top, left }}
    >
      <svg width={length} height={20}>
        <line
          x1="0"
          y1="10"
          x2={length - 10}
          y2="10"
          strokeWidth={thickness}
          className="stroke-gray-400"
        />

        <polygon
          points={`${length - 10},5 ${length},10 ${length - 10},15`}
          className="fill-gray-400"
        />
      </svg>
    </div>
  );
}

type LineProps = {
  length?: number;
  direction?: "right" | "left" | "up" | "down";
  thickness?: number;
  top?: number;
  left?: number;
};

export function Line({
  length = 100,
  direction = "right",
  thickness = 2,
  top = 0,
  left = 0,
}: LineProps) {
  const rotation = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  }[direction];

  return (
    <div
      className={`absolute z-10 origin-left ${rotation}`}
      style={{ top, left }}
    >
      <svg width={length} height={20}>
        <line
          x1="0"
          y1="10"
          x2={length}
          y2="10"
          strokeWidth={thickness}
          className="stroke-gray-400"
        />
      </svg>
    </div>
  );
}
