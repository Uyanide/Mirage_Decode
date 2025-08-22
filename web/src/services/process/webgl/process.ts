import type { ImageCommonService } from '../../image-process';
import type { PrismAdvancedEncodeService } from '../../prism-advanced-encode';
import type { PrismDecodeService } from '../../prism-decode';
import type { PrismEncodeService } from '../../prism-encode';
import { WebGLAdvancedEncodeProcess } from './advanced-encode';
import { WebGLCommonProcess } from './common';
import { WebGLDecodeProcess } from './decode';
import { WebGLEncodeProcess } from './encode';
import { WebGLHelper } from './helper';

export class WebGLProcess
  extends WebGLAdvancedEncodeProcess(WebGLEncodeProcess(WebGLDecodeProcess(WebGLCommonProcess(WebGLHelper))))
  implements ImageCommonService, PrismEncodeService, PrismDecodeService, PrismAdvancedEncodeService {}
