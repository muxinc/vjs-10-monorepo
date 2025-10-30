import { TooltipArrowElement, TooltipPopupElement, TooltipPortalElement, TooltipPositionerElement, TooltipRootElement, TooltipTriggerElement } from '@/elements/tooltip';
import { defineCustomElement } from '@/utils/custom-element';

defineCustomElement('media-tooltip', TooltipRootElement);
defineCustomElement('media-tooltip-trigger', TooltipTriggerElement);
defineCustomElement('media-tooltip-portal', TooltipPortalElement);
defineCustomElement('media-tooltip-positioner', TooltipPositionerElement);
defineCustomElement('media-tooltip-portal', TooltipPortalElement);
defineCustomElement('media-tooltip-popup', TooltipPopupElement);
defineCustomElement('media-tooltip-arrow', TooltipArrowElement);
