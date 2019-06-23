import Rectangle from "../geometry/rectangle.js";
import { downloadDataUrlAsFile, downloadBlob } from "../data/datautils.js";
import Context2D from "./context2d.js";
import Context from "./context.js";
import Color from "../color/color.js";
import {CONTEXT_2D, CONTEXT_WEBGL} from "../mesh.js";

let count = 0;
export default class Canvas {
  constructor(
    parentId,
    contextType,
    width,
    height,
    backgroundColor = Color.WHITE,
    batchDrawCommands = false,
    debugDrawCommands = false,
    filterDrawCommands = false
  ) {

    this._canvas = document.createElement("canvas");

    this._canvas.id = Canvas._createName();
    this._canvas.height = height;
    this._canvas.width = width;

    if(contextType == CONTEXT_2D) {
      this._context = new Context2D(
        //todo: we currently dont support transparent backgrounds
        //which should  improve rendering. If we need it, we can  add int
        //with a flag in the future
        this._canvas.getContext("2d", { alpha: false }),
        backgroundColor,
        batchDrawCommands,
        debugDrawCommands,
        filterDrawCommands
      );
      } else if (contextType == CONTEXT_WEBGL) {

        //todo: can move some of these options to config
        this._context = new Context(this._canvas.getContext("webgl", 
          {
            preserveDrawingBuffer: true,
            antialias:true,
            powerPreference:"high-performance"}));
      }

    let container = document.getElementById(parentId);
    container.appendChild(this._canvas);

    this._bounds = new Rectangle(0, 0, width, height);
  }

  get bounds() {
    return this._bounds;
  }

  get canvas() {
    return this._canvas;
  }

  get context() {
    return this._context;
  }

  render() {
    this._context.render();
  }

  clear() {
    this._context.clear();
  }

  static _createName() {
    return `mesh_canvas_${count++}`;
  }

  /************* video capture ******************/

  //todo: can you export, restart?
  stopRecord() {
    if (!this._recorder) {
      return;
    }

    this._recorder.stop();
  }

  /*

	Info on video capture
	https://developers.google.com/web/updates/2016/10/capture-stream

	(may need to set some experimental flags in Chrome)

	Supported Codecs in Chrome
	https://zhirzh.github.io/2017/09/02/mediarecorder/

	# audio codecs
	audio/webm
	audio/webm;codecs=opus

	# video codecs
	video/webm
	video/webm;codecs=avc1

	video/webm;codecs=h264
	video/webm;codecs=h264,opus

	video/webm;codecs=vp8
	video/webm;codecs=vp8,opus

	video/webm;codecs=vp9
	video/webm;codecs=vp9,opus

	video/webm;codecs=h264,vp9,opus
	video/webm;codecs=vp8,vp9,opus

	video/x-matroska
	video/x-matroska;codecs=avc1

	*/
  startRecord(mimeString = "video/webm;codecs=h264", frameRate = 60.0) {
    this._chunks = [];
    let o = this;

    let stream = this._canvas.captureStream(frameRate);
    //let stream = this._canvas.captureStream();

    //default to 5Mbps
    this._recorder = new MediaRecorder(stream, {
      mimeType: mimeString,
      videoBitsPerSecond: 5000000
    });

    this._recorder.ondataavailable = function(event) {
      if (event.data.size) {
        o._chunks.push(event.data);
      }
    };

    this._recorder.start(10);
  }

  get recorder() {
    return this._recorder;
  }

  downloadVideo(fileName) {
    if (this._chunks && this._chunks.length) {
      var blob = new Blob(this._chunks);

      downloadBlob(blob, fileName);
    } else {
      console.info(`canvas.downloadVideo was called but no video recorded.
        make sure that config.CAPTURE_VIDEO is set to true. If that does
        not fix the issue, then restart your browser.`);
    }
  }

  /***************** image capture ******************/

  downloadPNG(filename) {
    const format = "image/png";
    console.log(this._canvas);
    let blob = this._canvas.toBlob(function(blob) {
      downloadBlob(blob, filename);
    }, format);
  }
}
