/**
 * @format
 */
import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { widgetTaskHandler } from './src/widgets/widget-task-handler';
import { requestActivitySuggestionNavigation } from './src/navigation/navigation.service';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const notificationType = detail.notification?.data?.notificationType;
  if (
    type === EventType.PRESS &&
    notificationType === 'physical-activity-reminder'
  ) {
    await requestActivitySuggestionNavigation();
  }
});

AppRegistry.registerComponent(appName, () => App);
registerWidgetTaskHandler(widgetTaskHandler);