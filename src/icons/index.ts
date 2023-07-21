import { PixivIcon } from '@charcoal-ui/icons';
import PlayAlt from './PlayAlt.svg';

PixivIcon.extend({
  '24/PlayAlt': PlayAlt.src,
});

declare module '@charcoal-ui/icons' {
  export interface KnownIconType {
    '24/PlayAlt': unknown,
  }
}
