import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { MentalHealthWidget } from './MentalHealthWidget';
import {
  getTodaysMood,
  saveMoodEntry,
} from '../storage/mood.storage';

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const todaysMood = await getTodaysMood();

      props.renderWidget(
        <MentalHealthWidget
          selectedMood={todaysMood ?? undefined}
        />,
      );
      break;
    }

    case 'WIDGET_CLICK': {
      if (props.clickAction !== 'SELECT_MOOD') {
        break;
      }

      const mood = Number(
        props.clickActionData?.mood,
      );

      if (
        !Number.isInteger(mood) ||
        mood < 1 ||
        mood > 5
      ) {
        break;
      }

      const today = new Date()
        .toISOString()
        .split('T')[0];

      await saveMoodEntry({
        date: today,
        mood,
      });

      props.renderWidget(
        <MentalHealthWidget
          selectedMood={mood}
        />,
      );

      break;
    }

    case 'WIDGET_DELETED':
    default:
      break;
  }
}