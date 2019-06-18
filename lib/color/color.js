import { randomInt } from "../math/math.js";

/**
 * Represents RGBA colors.
 * @example
 * let color = new new Color(255, 255, 0, 1.0);
 */
export default class Color {
  /**
   * Constructor.
   * @param {number} r Red value of color, between 0 - 255.
   * @param {number} g Green value of color, between 0 - 255.
   * @param {number} b Red value of color, between 0 - 255.
   * @param {float} a Alpha value of color between 0.0 and 1.0.
   */
  constructor(r = 0, g = 0, b = 0, a = 1.0) {
    if (arguments.length === 1) {
      g = r;
      b = r;
    } else if (arguments.length === 2) {
      a = g;
      g = r;
      b = r;
    }

    this._red = r;
    this._green = g;
    this._blue = b;
    this._alpha = a;

    this._rgbaCSSIsDirty = true;
    this._rgbaCSS = undefined;
  }

  /** @type {number} Red value of RGB color as a value between 0 and 255. */
  get red() {
    return this._red;
  }

  /** @type {number} Red value of RGB color as a value between 0 and 255. */
  set red(r) {
    this._red = r;
    this._rgbaCSSIsDirty = true;
  }

  /** @type {number} Green value of RGB color as a value between 0 and 255. */
  get green() {
    return this._green;
  }

  /** @type {number} Green value of RGB color as a value between 0 and 255. */
  set green(g) {
    this._green = g;
    this._rgbaCSSIsDirty = true;
  }

  /** @type {number} Blue value of RGB color as a value between 0 and 255. */
  get blue() {
    return this._blue;
  }

  /** @type {number} Blue value of RGB color as a value between 0 and 255. */
  set blue(b) {
    this._blue = b;
    this._rgbaCSSIsDirty = true;
  }

  /** @type {float} Alpha value of RGB color as a value between 0.0 and 1.0. */
  get alpha() {
    return this._alpha;
  }

  /** @type {float} Alpha value of RGB color as a value between 0.0 and 1.0. */
  set alpha(a) {
    this._alpha = a;
    this._rgbaCSSIsDirty = true;
  }

  setToGrey(value) {
    this._red = value;
    this._green = value;
    this._blue = value;
    this._rgbaCSSIsDirty = true;
  }

  toCSS() {
    if (!this._rgbaCSSIsDirty) {
      return this._rgbaCSS;
    }

    this._rgbaCSSIsDirty = false;
    this._rgbaCSS = `rgba(${this._red}, ${this._green}, ${this._blue}, ${
      this._alpha
    })`;

    return this._rgbaCSS;
  }

  //todo: include alpha output support?
  toHex() {
    return (
      "#" +
      numberToHexString(this._red) +
      numberToHexString(this._green) +
      numberToHexString(this._blue)
    );
  }

  /**
   * Whether the two colors represent the same RGB color.
   * @param {Color} color - Color instance to compare for equality against this instance.
   * @param {Boolean} compareAlpha - If true, alpha value will be ignored when comparing
   * color equality. Otherwise alpha must also be equal.
   */
  isEqualTo(color, compareAlpha = false) {
    let isEqual =
      this._red === color.red &&
      this._green === color.green &&
      this._blue === color.blue;

    if (compareAlpha === true) {
      isEqual = isEqual && this._alpha === color.alpha;
    }
    return isEqual;
  }

  copy() {
    return new Color(this._red, this._green, this._blue, this._alpha);
  }

  //https://gist.github.com/mjackson/5311256
  toHSV() {
    let r = this._red;
    let g = this._green;
    let b = this._blue;
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return {"hue":h, "saturation":s, "value":v };
  }

  static get BLACK() {
    return new Color(0);
  }

  static get WHITE() {
    return new Color(255);
  }

  static get TRANSPARENT() {
    return new Color(0, 0, 0, 0);
  }


  static fromHex(value) {
    return hexToRgb(value);
  }

  //currently parses css rgba strings
  //https://regexr.com/3qdh3 (thanks to grant skinner for the regex)
  static fromCSS(css) {
    let regex = new RegExp(
      /rgba?\((\d+%?), ?(\d+%?), ?(\d+%?), (\d*\.?\d+)\)/,
      "g"
    );
    let match = regex.exec(css);

    if (match.length === 5) {
      return new Color(
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        parseFloat(match[4])
      );
    }

    return undefined;
  }

  static createRandom(alpha = 1.0) {
    return new Color(randomInt(255), randomInt(255), randomInt(255), alpha);
  }
}

function numberToHexString(num) {
  let hex = num.toString(16);

  if (hex.length == 1) {
    hex = `0${hex}`;
  }

  return hex;
}

//https://stackoverflow.com/a/5624139/10232
//todo: need to add support for RGBA
function hexToRgb(hex) {
  //todo: need to check if a number is being passed in:
  //0xFFFFFF

  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }

  //console.log(hex);

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return undefined;
  }

  let c = new Color(
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  );

  return c;
}
