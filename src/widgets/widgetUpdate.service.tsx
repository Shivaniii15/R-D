import React from 'react';

import {
  requestWidgetUpdate,
} from 'react-native-android-widget';

import {
  getTodaysMood,
} from '../storage/mood.storage';

import {
  MentalHealthWidget,
} from './MentalHealthWidget';

export async function refreshMentalHealthWidget(): Promise<void> {
  try {
    const todaysMood =
      await getTodaysMood();

    await requestWidgetUpdate({
      widgetName:
        'MentalHealthWidget',

      renderWidget: () => (
        <MentalHealthWidget
          mood={todaysMood}
        />
      ),

      widgetNotFound: () => {
        console.log(
          'Mental Health widget is not currently installed on the home screen.',
        );
      },
    });

    console.log(
      'Mental Health widget refreshed. Mood:',
      todaysMood,
    );
  } catch (error) {
    console.log(
      'Failed to refresh Mental Health widget:',
      error,
    );
  }
}