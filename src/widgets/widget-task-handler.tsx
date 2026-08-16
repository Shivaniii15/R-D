import React from 'react';

import type {
  WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import {
  MentalHealthWidget,
} from './MentalHealthWidget';

import {
  getTodaysMood,
} from '../storage/mood.storage';

async function renderMentalHealthWidget(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  const mood =
    await getTodaysMood();

  props.renderWidget(
    <MentalHealthWidget
      mood={mood}
    />,
  );
}

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      await renderMentalHealthWidget(
        props,
      );
      break;

    case 'WIDGET_UPDATE':
      await renderMentalHealthWidget(
        props,
      );
      break;

    case 'WIDGET_RESIZED':
      await renderMentalHealthWidget(
        props,
      );
      break;

    case 'WIDGET_CLICK':
      await renderMentalHealthWidget(
        props,
      );
      break;

    case 'WIDGET_DELETED':
      break;

    default:
      break;
  }
}