/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, {
  EventType,
} from '@notifee/react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { name as appName } from './app.json';

import {
  requestActivitySuggestionNavigation,
} from './src/navigation/navigation.service';

import { widgetTaskHandler } from './src/widgets/widget-task-handler';

notifee.onBackgroundEvent(
  async ({ type, detail }) => {
    const notificationType =
      detail.notification?.data?.notificationType;

    if (
      type === EventType.PRESS &&
      notificationType ===
        'physical-activity-reminder'
    ) {
      await requestActivitySuggestionNavigation();
    }
  },
);

registerWidgetTaskHandler(
  widgetTaskHandler,
);

AppRegistry.registerComponent(
  appName,
  () => App,
);