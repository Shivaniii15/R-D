import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { MentalHealthWidget } from './MentalHealthWidget';
import { getTodaysMood } from '../storage/mood.storage';

const nameToWidget = {
  MentalHealthWidget: MentalHealthWidget,
};

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  console.log('WIDGET TASK HANDLER CALLED');
  console.log('Widget action:', props.widgetAction);
  console.log('Widget info:', JSON.stringify(props.widgetInfo));

  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  console.log('Widget name:', widgetInfo.widgetName);
  console.log('Widget component found:', !!Widget);

  const mood = await getTodaysMood();

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      props.renderWidget(<Widget mood={mood} />);
      break;
    case 'WIDGET_UPDATE':
      props.renderWidget(<Widget mood={mood} />);
      break;
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget mood={mood} />);
      break;
    case 'WIDGET_CLICK':
      props.renderWidget(<Widget mood={mood} />);
      break;
    case 'WIDGET_DELETED':
      break;
    default:
      break;
  }
}