import {
  createRef,
  forwardRef,
  MouseEventHandler,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CanParsePeer } from "../../App";
import { DEFAULT_HEIGHT, DEFAULT_LINE_WIDTH, DEFAULT_WIDTH } from "./constants";

const Drawer = forwardRef<
  CanParsePeer,
  { onAction: (message: string) => void }
>(({ onAction }: { onAction: (message: string) => void }, ref) => {
  const canvasRef: RefObject<HTMLCanvasElement> = createRef();

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [color, setColor] = useState("#000");

  const stroke = useRef<Array<number>>([]);
  const isPainting = useRef(false);

  useEffect(() => {
    if (!canvasRef?.current) return;

    setCtx(canvasRef.current.getContext("2d"));
  }, []);

  /**
   * Helper function for @function parsePeer , draws a path based on provided coordinates
   * @param givenColor string color of the stroke.
   * @param values array of values representing coordinates of each point.
   */
  function drawFromArray(givenColor: string, values: Array<number>) {
    if (!ctx || values.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = givenColor;

    ctx.moveTo(values[0], values[1]);

    for (let index = 2; index + 1 < values.length; index += 2) {
      ctx.lineTo(values[index], values[index + 1]);
    }

    ctx.stroke();
    ctx.beginPath();
  }

  /**
   * Performs an action (drawing, erasing etc.) from an array
   * @param message String to be parsed, comma separated. format: action,values
   */
  function parsePeer(message: string) {
    const values = message.split(",");
    const type = values[0];
    if (type === "draw") {
      drawFromArray(values[1], values.slice(2, values.length).map(parseFloat));
    }
  }

  /**
   * Starts a new path on the canvas
   * @param e: mouseEvent triggering the function
   */
  const startPainting: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!ctx) return;

    isPainting.current = true;
    ctx.beginPath();
    ctx.strokeStyle = color;

    stroke.current = [];
  };

  /**
   * Stops the path on the canvas and calls the onAction callback if provided.
   * @param e: mouseEvent triggering the function
   */
  const stopPainting: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!ctx) return;

    isPainting.current = false;
    ctx.stroke();
    ctx.beginPath();

    if (onAction) onAction(`draw,${color},${stroke.current.join(",")}`);
  };

  /**
   * Adds a new point to the path. Also saves the coordinates to be passed to the callback.
   * @param e: mouseEvent triggering the function
   */
  const onPaint: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!ctx || !canvasRef?.current) return;

    if (!isPainting.current) {
      return;
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    // TODO: We need to get rect each time since user might scroll during drawing.
    let rect = canvasRef.current.getBoundingClientRect();

    // Save to stroke to send to peer
    stroke.current.push(e.pageX - (rect.left + window.scrollX));
    stroke.current.push(e.pageY - (rect.top + window.scrollY));

    ctx.lineTo(
      e.pageX - (rect.left + window.scrollX),
      e.pageY - (rect.top + window.scrollY)
    );

    ctx.stroke();
  };

  useImperativeHandle(ref, () => {
    return {
      parsePeer,
    };
  });

  return (
    <canvas
      id="canvas"
      width={width}
      height={height}
      ref={canvasRef}
      onMouseDown={startPainting}
      onMouseMove={onPaint}
      onMouseUp={stopPainting}
      onMouseLeave={stopPainting}
    />
  );
});

export default Drawer;
