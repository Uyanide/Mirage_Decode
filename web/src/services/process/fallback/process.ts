import type { PrismAdvancedEncodeService } from '../../../services/prism-advanced-encode';
import type { PrismDecodeService } from '../../../services/prism-decode';
import type { PrismEncodeService } from '../../../services/prism-encode';
import type { ImageCommonService } from '../../image-process';
import { FallbackAdvancedEncodeProcess } from './advanced-encode';
import { FallbackCommonProcess } from './common';
import { FallbackDecodeProcess } from './decode';
import { FallbackEncodeProcess } from './encode';

export class FallbackProcess
  extends FallbackAdvancedEncodeProcess(FallbackEncodeProcess(FallbackDecodeProcess(FallbackCommonProcess)))
  implements ImageCommonService, PrismEncodeService, PrismDecodeService, PrismAdvancedEncodeService {}
