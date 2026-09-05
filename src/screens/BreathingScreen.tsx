import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useAccessibility } from '../context/AccessibilityContext';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface PhaseConfig {
  label: string;
  instruction: string;
  duration: number;
  next: Phase;
}

const phases: Record<Phase, PhaseConfig> = {
  'inhale': {
    label: 'Inhale',
    instruction: 'Breathe in slowly through your nose',
    duration: 4,
    next: 'hold-in',
  },
  'hold-in': {
    label: 'Hold',
    instruction: 'Hold your breath gently',
    duration: 4,
    next: 'exhale',
  },
  'exhale': {
    label: 'Exhale',
    instruction: 'Breathe out slowly through your mouth',
    duration: 4,
    next: 'hold-out',
  },
  'hold-out': {
    label: 'Hold',
    instruction: 'Hold before breathing in again',
    duration: 4,
    next: 'inhale',
  },
};

export default function BreathingScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { scale } = useAccessibility();
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  function animateCircle(phase: Phase) {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (phase === 'inhale') {
      animationRef.current = Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
      animationRef.current.start();
    } else if (phase === 'exhale') {
      animationRef.current = Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });
      animationRef.current.start();
    }
  }

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) animationRef.current.stop();
      scaleAnim.setValue(1);
      setCurrentPhase('inhale');
      setCountdown(4);
      return;
    }

    animateCircle(currentPhase);

    let secondsLeft = phases[currentPhase].duration;
    setCountdown(secondsLeft);

    intervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(intervalRef.current!);
        const nextPhase = phases[currentPhase].next;
        if (nextPhase === 'inhale') {
          setCyclesCompleted(prev => prev + 1);
        }
        setCurrentPhase(nextPhase);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentPhase]);

  function handleStartStop() {
    setIsRunning(prev => !prev);
    if (isRunning) {
      setCyclesCompleted(0);
    }
  }

  const phase = phases[currentPhase];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={scale(22)} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: scale(20), fontWeight: '700', color: '#111' }}>Box Breathing</Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>

        {!isRunning && (
          <Text style={{ fontSize: scale(14), color: '#aaa', textAlign: 'center', marginBottom: 8 }}>
            Box breathing helps reduce stress and anxiety by calming your nervous system. Each phase lasts 4 seconds.
          </Text>
        )}

        <View style={{ height: 40 }} />

        <Animated.View style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#D4EDDA',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: scaleAnim }],
        }}>
          <Text style={{ fontSize: scale(32), fontWeight: '700', color: '#111' }}>
            {isRunning ? countdown : ''}
          </Text>
          {!isRunning && (
            <Text style={{ fontSize: scale(14), color: '#555' }}>Press start</Text>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />

        {isRunning && (
          <>
            <Text style={{ fontSize: scale(24), fontWeight: '700', color: '#111', marginBottom: 8 }}>
              {phase.label}
            </Text>
            <Text style={{ fontSize: scale(15), color: '#aaa', textAlign: 'center', marginBottom: 8 }}>
              {phase.instruction}
            </Text>
            <Text style={{ fontSize: scale(13), color: '#bbb' }}>
              Cycles completed: {cyclesCompleted}
            </Text>
          </>
        )}

        <View style={{ height: 48 }} />

        <TouchableOpacity
          onPress={handleStartStop}
          style={{
            backgroundColor: '#111',
            paddingVertical: 16,
            paddingHorizontal: 60,
            borderRadius: 14,
          }}>
          <Text style={{ color: '#fff', fontSize: scale(16), fontWeight: '600' }}>
            {isRunning ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}