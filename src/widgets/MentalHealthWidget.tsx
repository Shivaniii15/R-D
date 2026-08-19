import React from 'react';

import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';

interface MentalHealthWidgetProps {
  mood: number | null;
}

function getMoodLabel(
  mood: number | null,
): string {
  switch (mood) {
    case 1:
      return '😢 Terrible';

    case 2:
      return '😕 Bad';

    case 3:
      return '😐 Okay';

    case 4:
      return '🙂 Good';

    case 5:
      return '😄 Great';

    default:
      return 'Not logged yet';
  }
}

export function MentalHealthWidget({
  mood,
}: MentalHealthWidgetProps): React.JSX.Element {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 18,
        flexDirection: 'column',
      }}>

      <TextWidget
        text="Mental Health"
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#111111',
        }}
      />

      <TextWidget
        text="Today's check-in"
        style={{
          fontSize: 13,
          color: '#777777',
          marginTop: 12,
        }}
      />

      <TextWidget
        text={getMoodLabel(mood)}
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: '#111111',
          marginTop: 6,
        }}
      />

      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{
          uri: 'mentalhealth://mood',
        }}
        style={{
          backgroundColor: '#111111',
          borderRadius: 12,
          marginTop: 16,
          paddingVertical: 12,
          paddingHorizontal: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}>

        <TextWidget
          text="Log Mood"
          style={{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: '600',
          }}
        />

      </FlexWidget>

    </FlexWidget>
  );
}