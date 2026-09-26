'use no memo';

import React from 'react';

import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';

interface MentalHealthWidgetProps {
  selectedMood?: number;
  message?: string;
  isCooldown?: boolean;
}

export function MentalHealthWidget({
  selectedMood,
  message,
  isCooldown = false,
}: MentalHealthWidgetProps): React.JSX.Element {
  const moods = [1, 2, 3, 4, 5];

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
        text={
          message ??
          'How are you feeling today?'
        }
        style={{
          fontSize: 14,
          color:
            message !== undefined
              ? '#2E7D32'
              : '#666666',
          marginTop: 7,
        }}
      />

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 16,
          paddingHorizontal: 4,
        }}>

        {moods.map(mood => {
          const isSelected =
            selectedMood === mood;

          const isDisabled =
            isCooldown && !isSelected;

          return (
            <TextWidget
              key={mood}
              text={String(mood)}
              clickAction="SELECT_MOOD"
              clickActionData={{ mood }}
              accessibilityLabel={
                `Log mood ${mood} out of 5`
              }
              style={{
                fontSize: 20,
                color: isSelected
                  ? '#FFFFFF'
                  : isDisabled
                    ? '#BDBDBD'
                    : '#333333',
                fontWeight: '700',
                backgroundColor: isSelected
                  ? '#2E7D32'
                  : isDisabled
                    ? '#F5F5F5'
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
        text={
          selectedMood !== undefined
            ? `Latest mood  ·  ${selectedMood} / 5`
            : 'No mood logged yet'
        }
        style={{
          fontSize: 14,
          fontWeight: '700',
          color:
            selectedMood !== undefined
              ? '#2E7D32'
              : '#777777',
          marginTop: 14,
        }}
      />

    </FlexWidget>
  );
}