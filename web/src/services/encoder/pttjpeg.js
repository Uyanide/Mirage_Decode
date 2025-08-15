/* @@--
 * Copyright (C) 2020 Alberto Vigata
 * All rights reserved
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the University of California, Berkeley nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE REGENTS AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const DEBUGMSG = console.log;

//-------------------------------------------------------------------------------------------
// petitoJPEG routines
//-------------------------------------------------------------------------------------------

/**
 * BitWriter class
 *
 * A class to write bits to a random output
 *
 * Provide a byte sink by providing an object like ByteWriter with the setByteWriter method
 *
 */
function BitWriter() {
  var _this = this;
  var bufsize = 1024;
  var buf = new Uint8Array(bufsize);
  var bufptr = 0;
  var bitcount = 0;
  var bitcache = 0;
  var byteswritten = 0;

  // private methods
  function reset_writer() {
    byteswritten = 0;
    bufptr = 0;
    bitcount = 0;
  }

  function output_buffer() {
    if (bw) {
      bw.write(buf, 0, bufptr);
    }
    byteswritten += bufptr;
    bufptr = 0;
  }

  function emptybitbuffer() {
    do {
      /* Check if we need to dump buffer*/
      if (bufptr >= bufsize) {
        output_buffer();
      }
      var b = (bitcache >> 24) & 0xff;

      if (b == 0xff) {
        /*Add 0x00 stuffing*/
        bitcache &= 0x00ffffff;
        buf[bufptr++] = 0xff;
        continue;
      }

      buf[bufptr++] = b;

      bitcache <<= 8; /* remove bits from bitcache*/
      bitcount -= 8;
    } while (bitcount >= 8);
  }

  // This ensures there is at least 16 free bits in the buffer
  function emptybitbuffer_16(pbs) {
    /* the following loop always adds two bytes at least. to the bitcache*/
    if (bitcount > 16) {
      emptybitbuffer();
    }
  }

  function shovebits(val, bits) {
    bitcache |= (val & ((1 << bits) - 1)) << (32 - bitcount - bits);
    bitcount += bits;
  }

  var flush_buffers = function () {
    align8();
    if (bitcount >= 8) {
      emptybitbuffer();
      output_buffer();
    }
  };

  var align8 = function () {
    _this.putbits(0xff, (32 - bitcount) & 0x7);
  };

  /**
   * Public API
   */
  var bw;
  this.getWrittenBytes = function () {
    return byteswritten;
  };

  this.end = function () {
    output_buffer();
  };

  this.putbits = function (val, bits) {
    emptybitbuffer_16();
    shovebits(val, bits);
  };

  this.align = function () {
    align8();
  };

  this.setByteWriter = function (bww) {
    bw = bww;
  };

  this.putshort = function (s) {
    flush_buffers();
    buf[bufptr++] = (s & 0xffff) >>> 8;
    buf[bufptr++] = s & 0xff;
  };

  this.putbyte = function (b) {
    flush_buffers();
    buf[bufptr++] = b;
  };
}

//-------------------------------------------------------------------------------------------
// encoding tables
//-------------------------------------------------------------------------------------------
var std_dc_luminance_nrcodes = new Uint32Array([0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]);
var std_dc_luminance_values = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
var std_ac_luminance_nrcodes = new Uint32Array([0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d]);
var std_ac_luminance_values = new Uint32Array([
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81,
  0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18,
  0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
  0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99,
  0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
  0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5,
  0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
]);

var std_dc_chrominance_nrcodes = new Uint32Array([0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
var std_dc_chrominance_values = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
var std_ac_chrominance_nrcodes = new Uint32Array([0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77]);
var std_ac_chrominance_values = new Uint32Array([
  0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08,
  0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25,
  0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47,
  0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74,
  0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
  0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba,
  0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4,
  0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa,
]);

var jpeg_natural_order = new Uint32Array([
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42,
  49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63, 63,
  63, 63, 63, 63, 63, 63, 63 /* extra entries for safety in decoder */, 63, 63, 63, 63, 63, 63, 63, 63,
]);

/* zig zag scan table */
var zz = new Uint32Array([
  0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19,
  23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63,
]);

/* aan dct scale factors */
var aasf = new Float64Array([1.0, 1.387039845, 1.306562965, 1.175875602, 1.0, 0.785694958, 0.5411961, 0.275899379]);

/* default quantization tables */
var YQT = new Uint32Array([
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80,
  62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98,
  112, 100, 103, 99,
]);

var UVQT = new Uint32Array([
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99,
]);

//-------------------------------------------------------------------------------------------
// PTTJPEG object
//-------------------------------------------------------------------------------------------
export function PTTJPEG() {
  /* private context variables */
  var fdtbl_Y = new Float64Array(64);
  var fdtbl_UV = new Float64Array(64);
  var YDU = new Float64Array(64);
  var YDU2 = new Float64Array(64); // filled in 420 mode
  var YDU3 = new Float64Array(64); // filled in 420 mode
  var YDU4 = new Float64Array(64); // filled in 420 mode

  var UDU = new Float64Array(64);
  var UDU1 = new Float64Array(64);
  var UDU2 = new Float64Array(64);
  var UDU3 = new Float64Array(64);
  var UDU4 = new Float64Array(64);

  var VDU = new Float64Array(64);
  var VDU1 = new Float64Array(64);
  var VDU2 = new Float64Array(64);
  var VDU3 = new Float64Array(64);
  var VDU4 = new Float64Array(64);

  var DU = new Int32Array(64);
  var YTable = new Int32Array(64);
  var UVTable = new Int32Array(64);
  var outputfDCTQuant = new Int32Array(64);

  var sf = 1; // int. the scale factor

  var inputImage;

  var bitwriter;

  /**
   * BitString class
   */
  function BitString() {
    this.val = 0;
    this.len = 0;
  }

  var YDC_HT = new Array(256);
  var UVDC_HT = new Array(256);
  var YAC_HT = new Array(256);
  var UVAC_HT = new Array(256);

  /**
   * var quality:int
   *
   */
  var init_quality_settings = function (quality) {
    if (quality <= 0) quality = 1;

    if (quality > 100) quality = 100;

    sf = quality < 50 ? (5000 / quality) | 0 : (200 - (quality << 1)) | 0;

    /* init quantization tables */
    init_quant_tables(sf);
  };

  /**
   * var sf:int: the scale factor
   * @returns
   */
  var init_quant_tables = function (sff) {
    var i;
    var I64 = 64;
    var I8 = 8;

    for (i = 0; i < I64; ++i) {
      var t = ((YQT[i] * sff + 50) * 0.01) | 0;
      if (t < 1) {
        t = 1;
      } else if (t > 255) {
        t = 255;
      }
      YTable[zz[i]] = t;
    }

    for (i = 0; i < I64; i++) {
      var u = ((UVQT[i] * sff + 50) * 0.01) | 0;
      if (u < 1) {
        u = 1;
      } else if (u > 255) {
        u = 255;
      }
      UVTable[zz[i]] = u;
    }
    i = 0;
    var row;
    var col;
    for (row = 0; row < I8; ++row) {
      for (col = 0; col < I8; ++col) {
        fdtbl_Y[i] = 1 / (YTable[zz[i]] * aasf[row] * aasf[col] * I8);
        fdtbl_UV[i] = 1 / (UVTable[zz[i]] * aasf[row] * aasf[col] * I8);
        i++;
      }
    }
  };

  /**
   * const int nrcodes[]
   * const int std_table[]
   * BitString HT, Array(BitsString)
   *
   */
  var computeHuffmanTbl = function (nrcodes, std_table, HT) {
    var codevalue = 0; //int
    var pos_in_table = 0; //int
    var k, j; //int
    var bs; //BitString object

    // initialize table
    for (k = 0; k < 256; k++) {
      bs = new BitString();
      bs.val = 0;
      bs.len = 0;
      HT[k] = bs;
    }

    for (k = 1; k <= 16; ++k) {
      for (j = 1; j <= nrcodes[k]; ++j) {
        var bs = new BitString();
        bs.val = codevalue;
        bs.len = k;
        HT[std_table[pos_in_table]] = bs;
        pos_in_table++;
        codevalue++;
      }
      codevalue <<= 1;
    }
  };

  /**
   * Initialize huffman tables
   */
  var init_huffman_tables = function () {
    computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values, YDC_HT);
    computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values, UVDC_HT);
    computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values, YAC_HT);
    computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values, UVAC_HT);
  };

  /**
   *
   * DCT and quantization core
   *
   * double data[]
   * double fdtbl[]
   *
   * returns quantized coefficients
   *
   */
  function fDCTQuant(data, fdtbl) {
    /* Pass 1: process rows. */
    var dataOff = 0;
    var d0, d1, d2, d3, d4, d5, d6, d7;
    var i;
    var I8 = 8;
    var I64 = 64;

    for (i = 0; i < I8; ++i) {
      d0 = data[dataOff];
      d1 = data[dataOff + 1];
      d2 = data[dataOff + 2];
      d3 = data[dataOff + 3];
      d4 = data[dataOff + 4];
      d5 = data[dataOff + 5];
      d6 = data[dataOff + 6];
      d7 = data[dataOff + 7];

      var tmp0 = d0 + d7;
      var tmp7 = d0 - d7;
      var tmp1 = d1 + d6;
      var tmp6 = d1 - d6;
      var tmp2 = d2 + d5;
      var tmp5 = d2 - d5;
      var tmp3 = d3 + d4;
      var tmp4 = d3 - d4;

      /* Even part */
      var tmp10 = tmp0 + tmp3; /* phase 2 */
      var tmp13 = tmp0 - tmp3;
      var tmp11 = tmp1 + tmp2;
      var tmp12 = tmp1 - tmp2;

      data[dataOff] = tmp10 + tmp11; /* phase 3 */
      data[dataOff + 4] = tmp10 - tmp11;

      var z1 = (tmp12 + tmp13) * 0.707106781; /* c4 */
      data[dataOff + 2] = tmp13 + z1; /* phase 5 */
      data[dataOff + 6] = tmp13 - z1;

      /* Odd part */
      tmp10 = tmp4 + tmp5; /* phase 2 */
      tmp11 = tmp5 + tmp6;
      tmp12 = tmp6 + tmp7;

      /* The rotator is modified from fig 4-8 to avoid extra negations. */
      var z5 = (tmp10 - tmp12) * 0.382683433; /* c6 */
      var z2 = 0.5411961 * tmp10 + z5; /* c2-c6 */
      var z4 = 1.306562965 * tmp12 + z5; /* c2+c6 */
      var z3 = tmp11 * 0.707106781; /* c4 */

      var z11 = tmp7 + z3; /* phase 5 */
      var z13 = tmp7 - z3;

      data[dataOff + 5] = z13 + z2; /* phase 6 */
      data[dataOff + 3] = z13 - z2;
      data[dataOff + 1] = z11 + z4;
      data[dataOff + 7] = z11 - z4;

      dataOff += 8; /* advance pointer to next row */
    }

    /* Pass 2: process columns. */
    dataOff = 0;
    for (i = 0; i < I8; ++i) {
      d0 = data[dataOff];
      d1 = data[dataOff + 8];
      d2 = data[dataOff + 16];
      d3 = data[dataOff + 24];
      d4 = data[dataOff + 32];
      d5 = data[dataOff + 40];
      d6 = data[dataOff + 48];
      d7 = data[dataOff + 56];

      var tmp0p2 = d0 + d7;
      var tmp7p2 = d0 - d7;
      var tmp1p2 = d1 + d6;
      var tmp6p2 = d1 - d6;
      var tmp2p2 = d2 + d5;
      var tmp5p2 = d2 - d5;
      var tmp3p2 = d3 + d4;
      var tmp4p2 = d3 - d4;

      /* Even part */
      var tmp10p2 = tmp0p2 + tmp3p2; /* phase 2 */
      var tmp13p2 = tmp0p2 - tmp3p2;
      var tmp11p2 = tmp1p2 + tmp2p2;
      var tmp12p2 = tmp1p2 - tmp2p2;

      data[dataOff] = tmp10p2 + tmp11p2; /* phase 3 */
      data[dataOff + 32] = tmp10p2 - tmp11p2;

      var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781; /* c4 */
      data[dataOff + 16] = tmp13p2 + z1p2; /* phase 5 */
      data[dataOff + 48] = tmp13p2 - z1p2;

      /* Odd part */
      tmp10p2 = tmp4p2 + tmp5p2; /* phase 2 */
      tmp11p2 = tmp5p2 + tmp6p2;
      tmp12p2 = tmp6p2 + tmp7p2;

      /* The rotator is modified from fig 4-8 to avoid extra negations. */
      var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433; /* c6 */
      var z2p2 = 0.5411961 * tmp10p2 + z5p2; /* c2-c6 */
      var z4p2 = 1.306562965 * tmp12p2 + z5p2; /* c2+c6 */
      var z3p2 = tmp11p2 * 0.707106781; /* c4 */

      var z11p2 = tmp7p2 + z3p2; /* phase 5 */
      var z13p2 = tmp7p2 - z3p2;

      data[dataOff + 40] = z13p2 + z2p2; /* phase 6 */
      data[dataOff + 24] = z13p2 - z2p2;
      data[dataOff + 8] = z11p2 + z4p2;
      data[dataOff + 56] = z11p2 - z4p2;

      dataOff++; /* advance po(int)er to next column */
    }

    // Quantize/descale the coefficients
    var fDCTQuant;
    for (i = 0; i < I64; ++i) {
      // Apply the quantization and scaling factor & Round to nearest (int)eger
      fDCTQuant = data[i] * fdtbl[i];
      outputfDCTQuant[i] = fDCTQuant > 0.0 ? (fDCTQuant + 0.5) | 0 : (fDCTQuant - 0.5) | 0;
    }
    return outputfDCTQuant;
  }

  //-------------------------------------------------------------------------------------------
  // chunk writing routines
  function writeAPP0() {
    bitwriter.putshort(0xffe0); // marker
    bitwriter.putshort(16); // length
    bitwriter.putbyte(0x4a); // J
    bitwriter.putbyte(0x46); // F
    bitwriter.putbyte(0x49); // I
    bitwriter.putbyte(0x46); // F
    bitwriter.putbyte(0); // = "JFIF"'\0'
    bitwriter.putbyte(1); // versionhi
    bitwriter.putbyte(1); // versionlo
    bitwriter.putbyte(0); // xyunits
    bitwriter.putshort(1); // xdensity
    bitwriter.putshort(1); // ydensity
    bitwriter.putbyte(0); // thumbnwidth
    bitwriter.putbyte(0); // thumbnheight
  }

  // width:int, height:int
  function writeSOF0(width, height, _444) {
    bitwriter.putshort(0xffc0); // marker
    bitwriter.putshort(17); // length, truecolor YUV JPG
    bitwriter.putbyte(8); // precision
    bitwriter.putshort(height);
    bitwriter.putshort(width);
    bitwriter.putbyte(3); // nrofcomponents

    bitwriter.putbyte(1); // IdY. id of Y
    bitwriter.putbyte(_444 ? 0x11 : 0x22); // HVY. sampling factor horizontal Y  | sampling factor vertical Y
    bitwriter.putbyte(0); // QTY. quantization table table

    bitwriter.putbyte(2); // IdU
    bitwriter.putbyte(_444 ? 0x11 : 0x11); // HVU sampling factor horizontal U  | sampling factor vertical U. 0x11 -> 4:4:4, 0x22 -> 4:2:0
    bitwriter.putbyte(1); // QTU

    bitwriter.putbyte(3); // IdV
    bitwriter.putbyte(_444 ? 0x11 : 0x11); // HVV sampling factor horizontal V  | sampling factor vertical V. 0x11 -> 4:4:4, 0x22 -> 4:2:0
    bitwriter.putbyte(1); // QTV
  }

  function writeDQT() {
    bitwriter.putshort(0xffdb); // marker
    bitwriter.putshort(132); // length
    bitwriter.putbyte(0);

    var i;
    var I64 = 64;
    for (i = 0; i < I64; ++i) bitwriter.putbyte(YTable[i]);

    bitwriter.putbyte(1);

    for (i = 0; i < I64; ++i) bitwriter.putbyte(UVTable[i]);
  }

  function writeDHT() {
    bitwriter.putshort(0xffc4); // marker
    bitwriter.putshort(0x01a2); // length

    bitwriter.putbyte(0); // HTYDCinfno
    var i;
    var I11 = 11;
    var I16 = 16;
    var I161 = 161;

    for (i = 0; i < I16; ++i) {
      bitwriter.putbyte(std_dc_luminance_nrcodes[i + 1]);
    }

    for (i = 0; i <= I11; ++i) bitwriter.putbyte(std_dc_luminance_values[i]);

    bitwriter.putbyte(0x10); // HTYACinfo

    for (i = 0; i < I16; ++i) bitwriter.putbyte(std_ac_luminance_nrcodes[i + 1]);

    for (i = 0; i <= I161; ++i) bitwriter.putbyte(std_ac_luminance_values[i]);

    bitwriter.putbyte(1); // HTUDCinfo

    for (i = 0; i < I16; ++i) bitwriter.putbyte(std_dc_chrominance_nrcodes[i + 1]);

    for (i = 0; i <= I11; ++i) bitwriter.putbyte(std_dc_chrominance_values[i]);

    bitwriter.putbyte(0x11); // HTUACinfo

    for (i = 0; i < I16; ++i) bitwriter.putbyte(std_ac_chrominance_nrcodes[i + 1]);

    for (i = 0; i <= I161; ++i) bitwriter.putbyte(std_ac_chrominance_values[i]);
  }

  function writeSOS() {
    bitwriter.putshort(0xffda); // marker
    bitwriter.putshort(12); // length
    bitwriter.putbyte(3); // nrofcomponents
    bitwriter.putbyte(1); // IdY
    bitwriter.putbyte(0); // HTY
    bitwriter.putbyte(2); // IdU
    bitwriter.putbyte(0x11); // HTU
    bitwriter.putbyte(3); // IdV
    bitwriter.putbyte(0x11); // HTV
    bitwriter.putbyte(0); // Ss
    bitwriter.putbyte(0x3f); // Se
    bitwriter.putbyte(0); // Bf
  }

  function writeEOI() {
    bitwriter.align();
    bitwriter.putshort(0xffd9); //EOI
    bitwriter.end();
  }

  //--------------------------------------------------------------------
  // Block Processing

  function huffman_extend(mag, size) {
    return mag < 1 << (size - 1) ? mag + ((-1 << size) + 1) : mag;
  }
  function huffman_compact(mag, size) {
    return mag < 0 ? mag + (1 << size) - 1 : mag;
  }
  function log2(x, res) {
    res = 0;
    while (x != 0) {
      x >>= 1;
      res++;
    }
    return res;
  }
  function abs(x) {
    return x > 0 ? x : -x;
  }

  /**
   * double CDU[]
   * double fdtbl[]
   * double DC
   * BitString HTDC[]
   * BitString HTAC[]
   *
   * Returns double
   */
  function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
    var DU_DCT = fDCTQuant(CDU, fdtbl);

    var dc_diff; //int
    var last_dc; // double

    // output
    // DC Bits
    dc_diff = (DU_DCT[0] - DC) | 0;
    last_dc = DU_DCT[0];
    ///////////////////////
    //DC CODING

    // DC Size
    var dc_size = 0,
      diffabs = abs(dc_diff);
    dc_size = log2(diffabs, dc_size);

    bitwriter.putbits(HTDC[dc_size].val, HTDC[dc_size].len);

    // DC Bits
    if (dc_size) {
      dc_diff = huffman_compact(dc_diff, dc_size);
      bitwriter.putbits(dc_diff, dc_size);
    }

    ////////////////////
    // AC CODING
    var run;
    var accoeff; //int16
    var lastcoeff_pos = 0; //ui32
    var maxcoeff = 64; // int

    var i = 0;
    while (1) {
      // find next coefficient to code
      i++;
      for (run = 0; (accoeff = DU_DCT[jpeg_natural_order[i]]) == 0 && i < maxcoeff; i++, run++);

      if (i >= maxcoeff) break;

      // Code runs greater than 16
      while (run >= 16) {
        // Write value
        bitwriter.putbits(HTAC[0xf0].val, HTAC[0xf0].len);
        run -= 16;
      }
      // AC Size
      var acsize = 0;
      var acabs = abs(accoeff);
      acsize = log2(acabs, acsize);

      // Write value
      var hv = (run << 4) | acsize;
      bitwriter.putbits(HTAC[hv].val, HTAC[hv].len);

      // AC Bits
      if (acsize) {
        accoeff = huffman_compact(accoeff, acsize);
        bitwriter.putbits(accoeff, acsize);
      }

      // Keep position of last encoded coefficient
      lastcoeff_pos = i;
    }

    // Write EOB
    if (lastcoeff_pos != 63) bitwriter.putbits(HTAC[0].val, HTAC[0].len);

    return last_dc;
  }

  /**
   * xpos:int
   * ypos:int
   *
   * This functions calls the getpixels() object to obtain an McuImg object that contains
   * an Uint8Array() buffer with pixel data in RGBA byte order. McuImg includes an offset
   * to the beginning of the requested area as well as the stride in bytes.
   *
   * The method converts the RGB pixels into YUV ready for further processing. The destination
   * pixels are written to the local private PTTJPEG fields YDU,UDU,VDU
   *
   */
  function rgb2yuv_444(xpos, ypos, YDU, UDU, VDU) {
    // RGBA format in unpacked bytes
    var mcuimg = inputImage.getPixels(xpos, ypos, 8, 8);

    // DEBUGMSG(sprintf("getpixels() xpos:%d ypos:%d retw:%d reth:%d", xpos, ypos, mcuimg.w, mcuimg.h ));

    var buf = mcuimg.buf;
    var pel;
    var P = 0;
    var x,
      y,
      off,
      off_1 = 0,
      R,
      G,
      B;

    if (mcuimg.w == 8 && mcuimg.h == 8) {
      /* block is 8x8 */
      for (y = 0; y < 8; y++) {
        for (x = 0; x < 8; x++) {
          off = mcuimg.offset + y * mcuimg.stride + x * 4;

          R = buf[off];
          G = buf[off + 1];
          B = buf[off + 2];

          YDU[off_1] = 0.299 * R + 0.587 * G + 0.114 * B - 0x80;
          UDU[off_1] = -0.16874 * R + -0.33126 * G + 0.5 * B;
          VDU[off_1++] = 0.5 * R + -0.41869 * G + -0.08131 * B;
        }
      }
    } else {
      /* we separate the borderline conditions to avoid having to branch out
       * on every mcu */
      for (y = 0; y < 8; y++) {
        for (x = 0; x < 8; x++) {
          var xx = x,
            yy = y;
          if (x >= mcuimg.w) {
            xx = mcuimg.w - 1;
          }

          if (y >= mcuimg.h) {
            yy = mcuimg.h - 1;
          }

          off = mcuimg.offset + yy * mcuimg.stride + xx * 4;

          R = buf[off];
          G = buf[off + 1];
          B = buf[off + 2];

          YDU[off_1] = 0.299 * R + 0.587 * G + 0.114 * B - 0x80;
          UDU[off_1] = -0.16874 * R + -0.33126 * G + 0.5 * B;
          VDU[off_1++] = 0.5 * R + -0.41869 * G + -0.08131 * B;
        }
      }
    }
  }

  // takes 4 DU units and downsamples them 2:1 using simple averaging

  function downsample_8_line(DU, outoff, DU1, DU2, inoff) {
    DU[outoff + 0] = (DU1[inoff + 0] + DU1[inoff + 1] + DU1[inoff + 8] + DU1[inoff + 9] + 2) >> 2;
    DU[outoff + 1] = (DU1[inoff + 2] + DU1[inoff + 3] + DU1[inoff + 10] + DU1[inoff + 11] + 2) >> 2;
    DU[outoff + 2] = (DU1[inoff + 4] + DU1[inoff + 5] + DU1[inoff + 12] + DU1[inoff + 13] + 2) >> 2;
    DU[outoff + 3] = (DU1[inoff + 6] + DU1[inoff + 7] + DU1[inoff + 14] + DU1[inoff + 15] + 2) >> 2;

    DU[outoff + 4] = (DU2[inoff + 0] + DU2[inoff + 1] + DU2[inoff + 8] + DU2[inoff + 9] + 2) >> 2;
    DU[outoff + 5] = (DU2[inoff + 2] + DU2[inoff + 3] + DU2[inoff + 10] + DU2[inoff + 11] + 2) >> 2;
    DU[outoff + 6] = (DU2[inoff + 4] + DU2[inoff + 5] + DU2[inoff + 12] + DU2[inoff + 13] + 2) >> 2;
    DU[outoff + 7] = (DU2[inoff + 6] + DU2[inoff + 7] + DU2[inoff + 14] + DU2[inoff + 15] + 2) >> 2;
  }

  function downsample_DU(DU, DU1, DU2, DU3, DU4) {
    downsample_8_line(DU, 0, DU1, DU2, 0);
    downsample_8_line(DU, 8, DU1, DU2, 16);
    downsample_8_line(DU, 16, DU1, DU2, 32);
    downsample_8_line(DU, 24, DU1, DU2, 48);

    downsample_8_line(DU, 32, DU3, DU4, 0);
    downsample_8_line(DU, 40, DU3, DU4, 16);
    downsample_8_line(DU, 48, DU3, DU4, 32);
    downsample_8_line(DU, 56, DU3, DU4, 48);
  }

  /**
   * xpos:int
   * ypos:int
   *
   * This functions calls the getpixels() object to obtain an McuImg object that contains
   * an Uint8Array() buffer with pixel data in RGBA byte order. McuImg includes an offset
   * to the beginning of the requested area as well as the stride in bytes.
   *
   * The method converts the RGB pixels into YUV ready for further processing. The destination
   * pixels are written to the local private PTTJPEG fields YDU[2,3,4],UDU,VDU
   *
   *
   * output: for luma blocks. YDU, YDU2, YDU3, YDU4
   *         2 chroma blocks, UDU, VDU
   *
   */
  function rgb2yuv_420(xpos, ypos) {
    rgb2yuv_444(xpos, ypos, YDU, UDU1, VDU1);
    rgb2yuv_444(xpos + 8, ypos, YDU2, UDU2, VDU2);
    rgb2yuv_444(xpos, ypos + 8, YDU3, UDU3, VDU3);
    rgb2yuv_444(xpos + 8, ypos + 8, YDU4, UDU4, VDU4);

    downsample_DU(UDU, UDU1, UDU2, UDU3, UDU4);
    downsample_DU(VDU, VDU1, VDU2, VDU3, VDU4);
  }

  //--------------------------------------------------------------------
  // exported functions
  this.version = function () {
    return 'petitóJPEG 0.4';
  };

  this.setVerbosity = function (flagVerbose) {
    flagQuiet = !flagVerbose;
  };

  this.ByteWriter = function () {
    var bufsize = 1024 * 1024 * 10;
    var buf = new Uint8Array(bufsize);
    var bufptr = 0;

    /**
     * Base64 encoding.
     * input:Uint8Array
     * output:String
     */
    var base64EncodeFromUint8Array = function (input) {
      var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

      var output = '';
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : 0;
        chr3 = i < input.length ? input[i++] : 0;

        enc1 = chr1 >>> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >>> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >>> 6);
        enc4 = chr3 & 63;

        if (i >= input.length) {
          var mod = input.length % 3;

          if (mod == 2) {
            enc4 = 64;
          }

          if (mod == 1) {
            enc3 = enc4 = 64;
          }
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
      }

      return output;
    };
    // writes count bytes starting at start position from array
    // array is Uint8Array()
    this.write = function (array, start, count) {
      for (var i = 0; i < count && bufptr + i < bufsize; i++) {
        buf[bufptr + i] = array[start + i];
      }
      bufptr += i;
    };

    /**
     * returns a base64 string with the data in the buffer
     */
    this.getBase64Data = function () {
      return base64EncodeFromUint8Array(buf.subarray(0, bufptr));
    };

    this.getImgUrl = function () {
      return 'data:image/jpeg;base64,' + this.getBase64Data();
    };

    this.getWrittenBytes = function () {
      return bufptr;
    };
  };

  this.dlog = DEBUGMSG;

  this.pttImage = function (imageData) {
    var width = imageData.width;
    var height = imageData.height;
    var id = imageData;
    var buf = imageData.data; // Uint8Array()
    this.width = width;
    this.height = height;

    this.mcuPixels = function () {
      this.buf = null;
      this.offset = 0;
      this.stride = 0;
      this.xpos = 0;
      this.ypos = 0;
      this.w = 0;
      this.h = 0;
    };

    /**
     * returns an mcuPixels object with data for a
     * specific mcu
     */
    this.getPixels = function (xpos, ypos, w, h) {
      // only valid for RGBA data
      var ret = new this.mcuPixels();
      ret.buf = buf;
      ret.stride = width * 4;
      ret.offset = ypos * ret.stride + xpos * 4;
      ret.xpos = xpos;
      ret.ypos = ypos;
      ret.w = xpos + w > width ? width - xpos : w;
      ret.h = ypos + h > height ? height - ypos : h;

      return ret;
    };
  };

  var encodetime = 0;
  this.getEncodeTime = function () {
    return encodetime;
  };

  /**
   * The encode function stub
   *
   * quality:int 0-100
   * img: pttJPEGImage object. The image object to encode
   * bw: byteWriter object. The object that will be used to write the compressed data
   *
   * uses auto for chroma sampling
   *
   */
  this.encode = function (quality, img, bw) {
    this.encode_ext(quality, img, bw, 'auto');
  };

  /**
   * The encode function
   *
   * quality:int 0-100
   * img: pttJPEGImage object. The image object to encode
   * bw: byteWriter object. The object that will be used to write the compressed data
   * sr: "444" for 4:4:4 chroma sampling "420" for 4:2:0 chroma sampling, "auto" for auto
   *
   *
   */
  this.encode_ext = function (quality, img, bw, sr) {
    if (!img) DEBUGMSG('input image not provided. aborting encode');

    if (!bw) DEBUGMSG('byte writer not provided. aborting encode');

    var _444 = true;
    if (sr == 'auto') {
      if (quality > 50) {
        _444 = true;
      } else {
        _444 = false;
      }
    }

    DEBUGMSG(`pttjpeg_encode  qual${quality}:,  ${img.width}x${img.height}, ${sr}:${_444 ? '4:4:4' : '4:2:0'}`);
    var start = new Date().getTime();

    init_quality_settings(quality);

    /* start the bitwriter */
    bitwriter = new BitWriter();
    bitwriter.setByteWriter(bw);

    /* save copy of input image */
    inputImage = img;

    /* write headers out */
    bitwriter.putshort(0xffd8); // SOI
    writeAPP0();
    writeDQT();
    writeSOF0(img.width, img.height, _444);
    writeDHT();
    writeSOS();

    DEBUGMSG('wrote headers');

    /* MCU(minimum coding units) are 8x8 blocks for now*/
    var DCU = 0,
      DCY = 0,
      DCV = 0;

    var width = img.width;
    var height = img.height;
    var ypos, xpos;
    var mcucount = 0;

    if (_444) {
      // 4:4:4
      for (ypos = 0; ypos < height; ypos += 8) {
        for (xpos = 0; xpos < width; xpos += 8) {
          rgb2yuv_444(xpos, ypos, YDU, UDU, VDU);
          DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
          DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
          DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
        }
      }
    } else {
      // 4:2:0
      for (ypos = 0; ypos < height; ypos += 16) {
        for (xpos = 0; xpos < width; xpos += 16) {
          rgb2yuv_420(xpos, ypos);
          DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
          DCY = processDU(YDU2, fdtbl_Y, DCY, YDC_HT, YAC_HT);
          DCY = processDU(YDU3, fdtbl_Y, DCY, YDC_HT, YAC_HT);
          DCY = processDU(YDU4, fdtbl_Y, DCY, YDC_HT, YAC_HT);
          DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
          DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
        }
      }
    }

    writeEOI();
    DEBUGMSG(`wrote EOI. ${bitwriter.getWrittenBytes()} bytes written`);
    var stop = new Date().getTime();
    encodetime = stop - start;
    DEBUGMSG(`${encodetime} ms`);
  };

  /**
   * Setup the encoding envinment object
   */
  var startup = (function () {
    init_huffman_tables();
  })();
}
