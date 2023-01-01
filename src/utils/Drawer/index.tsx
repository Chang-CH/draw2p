import {
  DeleteOutlined,
  HighlightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Popover, Slider, Tooltip } from "antd";
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
import {
  DEFAULT_ERASER_COLOR,
  DEFAULT_ERASER_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_LINE_WIDTH,
  DEFAULT_WIDTH,
} from "./constants";
import "./drawer.css";
//@ts-ignore
import { SketchPicker } from "react-color";

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
  const oldBrush = useRef({
    color: "#000",
    lineWidth: DEFAULT_LINE_WIDTH,
  });

  useEffect(() => {
    if (!canvasRef?.current) return;

    setCtx(canvasRef.current.getContext("2d"));
  }, []);

  /**
   * Helper function for @function parsePeer , draws a path based on provided coordinates
   * @param givenColor string color of the stroke.
   * @param values array of values representing coordinates of each point.
   */
  function drawFromArray(
    givenColor: string,
    stroke: number,
    values: Array<number>
  ) {
    if (!ctx || values.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = givenColor;
    ctx.lineWidth = stroke;

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
      drawFromArray(
        values[1],
        parseFloat(values[2]),
        values.slice(3, values.length).map(parseFloat)
      );
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

    if (onAction)
      onAction(`draw,${color},${lineWidth},${stroke.current.join(",")}`);
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

    // We need to get rect each time since user might scroll during drawing.
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
    <>
      <div className="div-brushes">
        <Tooltip title="brush">
          <Button
            shape="circle"
            icon={<HighlightOutlined />}
            className="buttons"
            size="large"
            onClick={() => {
              setColor(oldBrush.current.color);
              setLineWidth(oldBrush.current.lineWidth);
            }}
          />
        </Tooltip>
        <Tooltip title="eraser">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            className="buttons"
            size="large"
            onClick={() => {
              oldBrush.current.color = color;
              oldBrush.current.lineWidth = lineWidth;
              setColor(DEFAULT_ERASER_COLOR);
              setLineWidth(DEFAULT_ERASER_WIDTH);
            }}
          />
        </Tooltip>
      </div>
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
      <div className="div-controls">
        <Popover
          title="Brush settings"
          placement="left"
          content={
            <div>
              <p>Brush color</p>
              <SketchPicker
                onChange={(newColor: { hex: string }) => {
                  setColor(newColor.hex);
                }}
                color={color}
              />
              <p>Brush size</p>
              <Slider
                value={lineWidth}
                min={1}
                max={50}
                onChange={(value: number) => setLineWidth(value)}
              />
            </div>
          }
          trigger="click"
        >
          <Button
            shape="circle"
            className="buttons"
            size="large"
            icon={<SettingOutlined />}
          />
        </Popover>
      </div>
    </>
  );
});

export default Drawer;
