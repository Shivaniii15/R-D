'use no memo';

import React from 'react';
import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';

interface MentalHealthWidgetProps {
  selectedMood?: number;
  showConfirmation?: boolean;
}

export function MentalHealthWidget({
  selectedMood,
  showConfirmation = false,
}: MentalHealthWidgetProps): React.JSX.Element {
  const moods = [1, 2, 3, 4, 5];

  let statusText = 'Tap a number to log your mood';

  if (selectedMood !== undefined) {
    statusText = showConfirmation
      ? `✓ Mood logged: ${selectedMood}/5`
      : `Latest mood: ${selectedMood}/5`;
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'center',
      }}>

      <TextWidget
        text="Mental Health"
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: '#111111',
        }}
      />

      <TextWidget
        text="How are you feeling today?"
        style={{
          fontSize: 14,
          color: '#666666',
          marginTop: 8,
        }}
      />

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 18,
          paddingHorizontal: 4,
        }}>

        {moods.map(mood => {
          const isSelected =
            selectedMood === mood;

          return (
            <TextWidget
              key={mood}
              text={String(mood)}
              clickAction="SELECT_MOOD"
              clickActionData={{
                mood,
              }}
              accessibilityLabel={
                `Log mood ${mood} out of 5`
              }
              style={{
                fontSize: 20,
                color: isSelected
                  ? '#FFFFFF'
                  : '#333333',
                fontWeight: '700',
                backgroundColor: isSelected
                  ? '#333333'
                  : '#F1F1F1',
                borderRadius: 18,
                paddingHorizontal: 13,
                paddingVertical: 8,
              }}
            />
          );
        })}

      </FlexWidget>

      <TextWidget
        text={statusText}
        style={{
          fontSize: 13,
          color: '#555555',
          marginTop: 14,
          fontWeight: showConfirmation
            ? '700'
            : '400',
        }}
      />

    </FlexWidget>
  );
}