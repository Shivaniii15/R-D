import React from 'react';

import type {
  WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import {
  MentalHealthWidget,
} from './MentalHealthWidget';

import {
  getTodaysMood,
  saveMoodEntry,
} from '../storage/mood.storage';

import {
  getLocalDateString,
} from '../utils/date.utils';

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {

    /*
     * When the widget is added,
     * updated or resized, load the
     * latest mood logged today.
     */
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const todaysMood =
        await getTodaysMood();

      props.renderWidget(
        <MentalHealthWidget
          selectedMood={
            todaysMood ??
            undefined
          }
        />,
      );

      break;
    }

    /*
     * Handle a mood button press.
     */
    case 'WIDGET_CLICK': {
      if (
        props.clickAction !==
        'SELECT_MOOD'
      ) {
        break;
      }

      const mood = Number(
        props.clickActionData?.mood,
      );

      /*
       * Only accept mood values
       * from 1 through 5.
       */
      if (
        !Number.isInteger(mood) ||
        mood < 1 ||
        mood > 5
      ) {
        break;
      }

      /*
       * Use the Android device's
       * LOCAL calendar date.
       */
      const today =
        getLocalDateString();

      /*
       * Every tap creates another
       * mood entry.
       *
       * Therefore:
       *
       * 4 -> 4 -> 4
       *
       * creates three separate logs.
       */
      await saveMoodEntry({
        date: today,
        mood,
      });

      /*
       * Immediately update the widget.
       *
       * The most recently logged
       * number becomes green.
       */
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