import React from 'react';

import type {
  WidgetTaskHandlerProps,
} from 'react-native-android-widget';

import {
  MentalHealthWidget,
} from './MentalHealthWidget';

import {
  getTodaysMood,
  isWidgetMoodOnCooldown,
  saveMoodEntry,
  setWidgetLastLogTime,
} from '../storage/mood.storage';

import {
  getLocalDateString,
} from '../utils/date.utils';

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps,
): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const todaysMood =
        await getTodaysMood();

      const onCooldown =
        await isWidgetMoodOnCooldown();

      props.renderWidget(
        <MentalHealthWidget
          selectedMood={
            todaysMood ??
            undefined
          }
          isCooldown={onCooldown}
        />,
      );

      break;
    }

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

      if (
        !Number.isInteger(mood) ||
        mood < 1 ||
        mood > 5
      ) {
        break;
      }

      const onCooldown =
        await isWidgetMoodOnCooldown();

      /*
       * If the widget is still within the
       * 30-second cooldown, do not save
       * another mood entry.
       */
      if (onCooldown) {
        const todaysMood =
          await getTodaysMood();

        props.renderWidget(
          <MentalHealthWidget
            selectedMood={
              todaysMood ??
              undefined
            }
            message="Please wait before logging another mood"
            isCooldown={true}
          />,
        );

        break;
      }

      /*
       * Cooldown has finished, so the
       * new mood can be logged.
       */
      const today =
        getLocalDateString();

      await saveMoodEntry({
        date: today,
        mood,
      });

      /*
       * Start a new 30-second cooldown.
       */
      await setWidgetLastLogTime();

      /*
       * Immediately update the widget.
       *
       * The selected mood stays green,
       * while the other mood choices
       * appear greyed out.
       */
      props.renderWidget(
        <MentalHealthWidget
          selectedMood={mood}
          message="Mood logged successfully"
          isCooldown={true}
        />,
      );

      break;
    }

    case 'WIDGET_DELETED':
    default:
      break;
  }
}